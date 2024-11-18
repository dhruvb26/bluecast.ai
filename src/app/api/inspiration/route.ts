import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { creators, posts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/env";

const RATE_LIMIT = 20;

export async function GET(req: Request) {
  try {
    console.log("Starting GET request");
    const url = new URL(req.url);
    const linkedinUrl = url.searchParams.get("url");

    if (!linkedinUrl) {
      console.log("No LinkedIn URL provided");
      return NextResponse.json(
        { error: "LinkedIn URL is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching profile data for ${linkedinUrl}`);
    // Fetch profile data
    const profileData = await fetchWithRetry(
      `https://${
        env.RAPIDAPI_HOST
      }/get-linkedin-profile?linkedin_url=${encodeURIComponent(linkedinUrl)}`,
      env.RAPIDAPI_KEY,
      env.RAPIDAPI_HOST
    );

    if (!profileData) {
      console.error("Failed to fetch profile data");
      return NextResponse.json(
        { error: "Failed to fetch profile data" },
        { status: 500 }
      );
    }

    console.log("Successfully fetched profile data");
    const data = profileData.data;

    // Update creator profile
    try {
      console.log(`Updating creator profile for ${data.profile_id}`);
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
      console.log("Successfully updated creator profile");
    } catch (error: any) {
      console.error("Failed to update profile in database:", error);
      return NextResponse.json(
        { error: "Failed to update profile in database" },
        { status: 500 }
      );
    }

    // Fetch posts data
    console.log(`Fetching posts data for ${linkedinUrl}`);
    const postsData = await fetchWithRetry(
      `https://${
        env.RAPIDAPI_HOST
      }/get-profile-posts?linkedin_url=${encodeURIComponent(linkedinUrl)}`,
      env.RAPIDAPI_KEY,
      env.RAPIDAPI_HOST
    );

    if (!postsData) {
      console.error("Failed to fetch posts data");
      return NextResponse.json(
        { error: "Failed to fetch posts data" },
        { status: 500 }
      );
    }

    console.log(`Processing ${postsData.data.length} posts`);
    const formattedPosts = postsData.data
      .map((post: any) => {
        try {
          // Skip posts with potential Unicode issues
          if (!post.text || /[^\x00-\x7F]/.test(post.text)) {
            return null;
          }

          return {
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
            creatorId: data.profile_id,
          };
        } catch (error: any) {
          console.error("Error formatting post:", error);
          return null;
        }
      })
      .filter(Boolean);

    // Update posts in database
    try {
      console.log(`Updating ${formattedPosts.length} posts in database`);
      // First delete all existing posts for this creator
      await db.delete(posts).where(eq(posts.creatorId, data.profile_id));
      console.log("Deleted existing posts");

      // Then insert the new posts if we have any
      if (formattedPosts.length > 0) {
        for (const post of formattedPosts) {
          await db
            .insert(posts)
            .values(post)
            .onConflictDoUpdate({
              target: [posts.id],
              set: post,
            });
        }
        console.log(`Inserted ${formattedPosts.length} new posts`);
      }
      console.log("Successfully updated posts in database");
    } catch (error: any) {
      console.error("Failed to update posts in database:", error);
      return NextResponse.json(
        { error: "Failed to update posts in database" },
        { status: 500 }
      );
    }

    console.log("Request completed successfully");
    return NextResponse.json({
      message: "Successfully processed profile and posts",
      profile: data,
      posts: formattedPosts,
    });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
      console.log(`Attempt ${i + 1} of ${retries} for URL: ${url}`);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": apiHost,
        },
      });

      if (response.ok) {
        console.log(`Successfully fetched data from ${url}`);
        return await response.json();
      }

      if (response.status === 429) {
        console.log(`Rate limited on ${url}, waiting before retry...`);
        // Rate limited, wait before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, (60 / RATE_LIMIT) * 1000)
        );
        continue;
      }

      console.error(
        `Failed to fetch data from ${url}: ${response.status} ${response.statusText}`
      );
      return null;
    } catch (error: any) {
      console.error(`Error fetching data from ${url}:`, error);
      if (i === retries - 1) return null;
      console.log(`Waiting before retry ${i + 2}...`);
      await new Promise((resolve) =>
        setTimeout(resolve, (60 / RATE_LIMIT) * 1000)
      );
    }
  }
  return null;
}
