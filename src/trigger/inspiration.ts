import { logger, schedules, wait } from "@trigger.dev/sdk/v3";
import { db } from "@/server/db";
import { creatorListItems, creators, posts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/env";
const RATE_LIMIT = 20;

export const updateInspiration = schedules.task({
  id: "update-inspiration",
  cron: "0 0 */3 * *",
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

        if (!profileData) {
          logger.error(
            `Failed to fetch profile data for ${creator.profileUrl}`
          );
          continue;
        }

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
          continue;
        }

        // Update posts
        logger.log(`Fetching posts for ${creator.profileUrl}`);
        let allPosts: any[] = [];
        let start = 0;

        while (true) {
          const postsData = await fetchWithRetry(
            `https://${
              env.RAPIDAPI_HOST
            }/get-profile-posts?linkedin_url=${encodeURIComponent(
              creator.profileUrl!
            )}&start=${start}`,
            env.RAPIDAPI_KEY,
            env.RAPIDAPI_HOST
          );

          if (!postsData) {
            logger.error(`Failed to fetch posts for ${creator.profileUrl}`);
            break;
          }

          // Filter out posts with Unicode issues
          const validPosts = postsData.data;

          allPosts = [...allPosts, ...validPosts];

          // If we got less than 50 valid posts and start is 0, try with start=50
          if (validPosts.length < 50 && start === 0) {
            start = 50;
            continue;
          }
          break;
        }

        logger.log(
          `Successfully fetched ${allPosts.length} posts for ${creator.profileUrl}`
        );

        // Track seen texts to filter duplicates
        const seenTexts = new Set<string>();
        const formattedPosts = allPosts
          .map((post: any) => {
            try {
              // Skip duplicate posts based on text
              if (seenTexts.has(post.text)) {
                logger.log(
                  `Skipping duplicate post with text: ${post.text.substring(
                    0,
                    50
                  )}...`
                );
                return null;
              }
              seenTexts.add(post.text);

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

        try {
          logger.log(`Updating ${formattedPosts.length} posts in database`);
          // First delete all existing posts for this creator
          await db.delete(posts).where(eq(posts.creatorId, creator.id));
          logger.log("Deleted existing posts");

          // Then insert the new posts if we have any
          if (formattedPosts.length > 0) {
            for (const post of formattedPosts) {
              if (post) {
                // Add null check
                await db
                  .insert(posts)
                  .values(post)
                  .onConflictDoUpdate({
                    target: [posts.id],
                    set: post,
                  });
              }
            }
            logger.log(`Inserted ${formattedPosts.length} new posts`);
          }
          logger.log("Successfully updated posts in database");
        } catch (error: any) {
          logger.error(
            `Error updating posts in DB for ${creator.profileUrl}:`,
            error
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
  },
});

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
        await wait.for({ seconds: 60 / RATE_LIMIT });
        continue;
      }

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
