import { logger, schedules, wait } from "@trigger.dev/sdk/v3";
import { db } from "@/server/db";
import { creatorListItems, creators, posts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/env";
const RATE_LIMIT = 20;

export const updateInspiration = schedules.task({
  id: "update-inspiration",
  cron: "0 0 * * *",
  maxDuration: 5000,
  run: async (payload, { ctx }) => {
    const creatorUrls = await db
      .select({
        id: creators.id,
        profileUrl: creators.profileUrl,
      })
      .from(creatorListItems)
      .innerJoin(creators, eq(creatorListItems.creatorId, creators.id))
      .groupBy(creators.id, creators.profileUrl);

    logger.log(`Total number of URLs: ${creatorUrls.length}`);

    const updateCreators = async (creatorList: typeof creatorUrls) => {
      for (const creator of creatorList) {
        logger.log(`Processing creator URL: ${creator.profileUrl}`);

        // Update profile
        logger.log(`Fetching profile data for ${creator.profileUrl}`);
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
          logger.log(`Successfully fetched profile for ${creator.profileUrl}`);
          const data = profileData.data;
          try {
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
            logger.log(
              `Successfully updated profile in DB for ${creator.profileUrl}`
            );
          } catch (error: any) {
            logger.error(
              `Error updating profile in DB for ${creator.profileUrl}:`,
              error
            );
          }
        } else {
          logger.error(
            `Failed to fetch profile for ${creator.profileUrl} after retries`
          );
        }

        // Update posts
        logger.log(`Fetching posts for ${creator.profileUrl}`);
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
          logger.log(
            `Successfully fetched ${postsData.data.length} posts for ${creator.profileUrl}`
          );
          const formattedPosts = postsData.data
            .map((post: any) => {
              try {
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
                  text: post.text
                    ? Buffer.from(post.text, "utf-8")
                        .toString("utf-8")
                        .replace(
                          /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFD\uFFFE\uFFFF]/g,
                          ""
                        ) // Remove invalid UTF-8 characters
                        .replace(
                          /[\u00A0-\u9999<>&]/g,
                          (i: string) => `&#${i.charCodeAt(0)};`
                        )
                    : null,
                  time: post.time,
                  urn: post.urn,
                  creatorId: creator.id,
                };
              } catch (error: any) {
                logger.error(
                  `Error formatting post for ${creator.profileUrl}, post URN ${post.urn}:`,
                  error
                );
                return null;
              }
            })
            .filter(Boolean);

          // Use a transaction to delete old posts and insert new ones
          try {
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
            logger.log(
              `Successfully updated ${formattedPosts.length} posts in DB for ${creator.profileUrl}`
            );
          } catch (error: any) {
            logger.error(
              `Error updating posts in DB for ${creator.profileUrl}:`,
              error
            );
          }
        } else {
          logger.error(
            `Failed to fetch posts for ${creator.profileUrl} after retries`
          );
        }
      }
    };

    for (let i = 0; i < creatorUrls.length; i += RATE_LIMIT) {
      const batch = creatorUrls.slice(i, i + RATE_LIMIT);
      logger.log(
        `Processing batch ${i / RATE_LIMIT + 1} of ${Math.ceil(
          creatorUrls.length / RATE_LIMIT
        )}`
      );
      await updateCreators(batch);
    }

    async function fetchWithRetry(
      url: string,
      apiKey: string,
      apiHost: string,
      retries = 3
    ): Promise<any | null> {
      for (let i = 0; i < retries; i++) {
        try {
          logger.log(`Attempt ${i + 1} of ${retries} for URL: ${url}`);
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "x-rapidapi-key": apiKey,
              "x-rapidapi-host": apiHost,
            },
          });

          if (response.ok) {
            logger.log(`Successfully fetched data from ${url}`);
            return await response.json();
          }

          if (response.status === 429) {
            logger.log(`Rate limited on ${url}, waiting before retry...`);
            // Rate limited, wait before retrying
            await wait.for({ seconds: 60 / RATE_LIMIT });
            continue;
          }

          // Other error, don't retry
          logger.error(
            `Failed to fetch data from ${url}: ${response.status} ${response.statusText}`
          );
          return null;
        } catch (error: any) {
          logger.error(`Error fetching data from ${url}:`, error);
          if (i === retries - 1) return null;
          logger.log(`Waiting before retry ${i + 2}...`);
          await wait.for({ seconds: 60 / RATE_LIMIT });
        }
      }
      return null;
    }
  },
});
