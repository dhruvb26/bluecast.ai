import { logger, schedules, wait } from "@trigger.dev/sdk/v3";
import { db } from "@/server/db";
import { creatorListItems, creators, posts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/env";
const RATE_LIMIT = {
  requestsPerMinute: 20,
  requestCount: 0,
  lastResetTime: Date.now(),
};
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

    logger.log(`Found ${creatorUrls.length} creators to process`);

    const fetchCreatorPosts = async (
      creator: {
        id: string;
        profileUrl: string | null;
      },
      start: number
    ) => {
      logger.log(
        `Fetching posts for creator ${creator.profileUrl} starting at position ${start}`
      );

      // Add rate limit check before each request
      const now = Date.now();
      if (now - RATE_LIMIT.lastResetTime >= 60000) {
        // Reset counter every minute
        RATE_LIMIT.requestCount = 0;
        RATE_LIMIT.lastResetTime = now;
      }

      if (RATE_LIMIT.requestCount >= RATE_LIMIT.requestsPerMinute) {
        logger.log("Rate limit reached, waiting for next minute window...");
        await wait.for({ seconds: 60 });
        RATE_LIMIT.requestCount = 0;
        RATE_LIMIT.lastResetTime = Date.now();
      }

      RATE_LIMIT.requestCount++;
      logger.log(
        `Request ${RATE_LIMIT.requestCount}/${RATE_LIMIT.requestsPerMinute} this minute`
      );

      try {
        const postsResponse = await fetch(
          `https://${
            env.RAPIDAPI_HOST
          }/get-profile-posts?linkedin_url=${encodeURIComponent(
            creator.profileUrl!
          )}&start=${start}`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-key": env.RAPIDAPI_KEY,
              "x-rapidapi-host": env.RAPIDAPI_HOST,
            },
          }
        );

        if (!postsResponse.ok) {
          if (postsResponse.status === 429) {
            logger.log(`Rate limited, waiting before retry...`);
            await wait.for({ seconds: 60 });
            RATE_LIMIT.requestCount = 0;
            RATE_LIMIT.lastResetTime = Date.now();
            return null;
          }
          logger.error(`Failed to fetch posts for ${creator.profileUrl}`);
          return null;
        }

        // something new by neovim
        const postsData: any = await postsResponse.json();
        logger.log(
          `Successfully fetched ${postsData.data?.length || 0} posts for ${
            creator.profileUrl
          } at position ${start}`
        );
        return postsData.data;
      } catch (error: any) {
        logger.error(`Error fetching posts for ${creator.profileUrl}:`, error);
        return null;
      }
    };

    const updateCreatorPosts = async (creator: {
      id: string;
      profileUrl: string | null;
    }) => {
      logger.log(`Starting post update for creator ${creator.profileUrl}`);
      const seenPosts = new Set<string>();
      let allPosts: any[] = [];

      // Fetch first 2 pages in parallel (100 posts total)
      const startPositions = [0, 50];
      logger.log(
        `Fetching ${startPositions.length} pages in parallel for ${creator.profileUrl}`
      );
      const postsResults = await Promise.all(
        startPositions.map((start) => fetchCreatorPosts(creator, start))
      );

      // Process results and maintain uniqueness
      for (const posts of postsResults) {
        if (!posts) continue;

        const newPosts = posts.filter((post: any) => {
          if (!seenPosts.has(post.text)) {
            seenPosts.add(post.text);
            return true;
          }
          return false;
        });

        allPosts = [...allPosts, ...newPosts];
        if (allPosts.length >= 50) break;
      }

      // Trim to 50 posts if we have more
      allPosts = allPosts.slice(0, 50);

      logger.log(
        `Successfully fetched ${allPosts.length} unique posts for ${creator.profileUrl}`
      );

      const formattedPosts = allPosts
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

      logger.log(
        `Successfully formatted ${formattedPosts.length} posts for ${creator.profileUrl}`
      );

      try {
        // Delete existing posts for this creator
        await db.delete(posts).where(eq(posts.creatorId, creator.id));
        logger.log(`Deleted existing posts for ${creator.profileUrl}`);

        // Insert new posts
        if (formattedPosts.length > 0) {
          logger.log(
            `Starting to insert ${formattedPosts.length} posts for ${creator.profileUrl}`
          );
          for (const post of formattedPosts) {
            if (post) {
              await db
                .insert(posts)
                .values(post)
                .onConflictDoUpdate({
                  target: [posts.id],
                  set: post,
                });
            }
          }
          logger.log(
            `Inserted ${formattedPosts.length} new posts for ${creator.profileUrl}`
          );
        }
      } catch (error: any) {
        logger.error(
          `Error updating posts in DB for ${creator.profileUrl}:`,
          error
        );
      }
    };

    for (const creator of creatorUrls) {
      await updateCreatorPosts(creator);
    }
  },
});
