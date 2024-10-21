import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { creatorListItems, creators, posts } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { env } from "@/env";
import { sleep } from "@/utils/sleep";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 20; // requests per minute
const MINUTE_IN_MS = 60000;

export async function GET(req: NextRequest): Promise<Response> {
  try {
    if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const creatorUrls = await db
      .select({
        id: creators.id,
        profileUrl: creators.profileUrl,
      })
      .from(creatorListItems)
      .innerJoin(creators, eq(creatorListItems.creatorId, creators.id))
      .groupBy(creators.id, creators.profileUrl);

    console.log("Total number of URLs: ", creatorUrls.length);

    const updateCreators = async (creatorList: typeof creatorUrls) => {
      for (const creator of creatorList) {
        // Update profile
        const profileData = await fetchWithRetry(
          `https://${
            env.RAPIDAPI_HOST
          }/get-linkedin-profile?linkedin_url=${encodeURIComponent(
            creator.profileUrl!
          )}`,
          env.RAPIDAPI_KEY,
          env.RAPIDAPI_HOST
        );

        if (profileData) {
          const data = profileData.data;
          await db
            .insert(creators)
            .values({
              id: data.profile_id,
              profileUrl: data.linkedin_url,
              fullName: data.full_name,
              profileImageUrl: data.profile_image_url,
              headline: data.headline,
              urn: data.urn,
            })
            .onConflictDoUpdate({
              target: [creators.id],
              set: {
                profileUrl: data.linkedin_url,
                fullName: data.full_name,
                profileImageUrl: data.profile_image_url,
                headline: data.headline,
                urn: data.urn,
              },
            });
        } else {
          console.error(
            `Failed to fetch profile for ${creator.profileUrl} after retries`
          );
        }

        // Update posts
        const postsData = await fetchWithRetry(
          `https://${
            env.RAPIDAPI_HOST
          }/get-profile-posts?linkedin_url=${encodeURIComponent(
            creator.profileUrl!
          )}`,
          env.RAPIDAPI_KEY,
          env.RAPIDAPI_HOST
        );

        if (postsData) {
          const formattedPosts = postsData.data.map((post: any) => ({
            id: post.urn,
            images: post.images,
            document: post.document,
            video: post.video,
            numAppreciations: post.num_appreciations,
            numComments: post.num_comments,
            numEmpathy: post.num_empathy,
            numInterests: post.num_interests,
            numLikes: post.num_likes,
            numReposts: post.num_reposts,
            postUrl: post.post_url,
            reshared: post.reshared,
            text: post.text,
            time: post.time,
            urn: post.urn,
            creatorId: creator.id,
          }));

          // Use a transaction to delete old posts and insert new ones
          await db.transaction(async (tx) => {
            await tx.delete(posts).where(eq(posts.creatorId, creator.id));
            for (const post of formattedPosts) {
              await tx
                .insert(posts)
                .values(post)
                .onConflictDoUpdate({
                  target: [posts.id],
                  set: post,
                });
            }
          });
        } else {
          console.error(
            `Failed to fetch posts for ${creator.profileUrl} after retries`
          );
        }

        // Wait to respect rate limit
        await sleep(MINUTE_IN_MS / RATE_LIMIT);
      }
    };

    // Process creators in batches of RATE_LIMIT
    for (let i = 0; i < creatorUrls.length; i += RATE_LIMIT) {
      const batch = creatorUrls.slice(i, i + RATE_LIMIT);
      await updateCreators(batch);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating inspiration:", error);
    return NextResponse.json(
      { error: "Error updating inspiration" },
      { status: 500 }
    );
  }
}

async function fetchWithRetry(
  url: string,
  apiKey: string,
  apiHost: string,
  retries = 3
): Promise<any | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": apiHost,
        },
      });

      if (response.ok) {
        return await response.json();
      }

      if (response.status === 429) {
        // Rate limited, wait before retrying
        await sleep(MINUTE_IN_MS / RATE_LIMIT);
        continue;
      }

      // Other error, don't retry
      console.error(
        `Failed to fetch data: ${response.status} ${response.statusText}`
      );
      return null;
    } catch (error) {
      console.error(`Error fetching data: ${error}`);
      if (i === retries - 1) return null;
      await sleep(MINUTE_IN_MS / RATE_LIMIT);
    }
  }
  return null;
}
