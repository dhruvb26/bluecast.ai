import { logger, schedules, task, wait, metadata } from "@trigger.dev/sdk/v3";
import { db } from "@/server/db";
import { creators } from "@/server/db/schema";
import { eq, and, not, gt, isNotNull } from "drizzle-orm";
import { env } from "@/env";
import { utapi } from "@/server/uploadthing";

// Add rate limit configuration
const RATE_LIMIT = {
  requestsPerMinute: 20,
  requestCount: 0,
  lastResetTime: Date.now(),
};

export const updateCreatorProfile = task({
  id: "update-creator-profile",
  maxDuration: 10000,
  retry: {
    maxAttempts: 10,
    factor: 1.8,
    randomize: false,
  },
  run: async (payload: any, { ctx }) => {
    logger.info("Starting creator profile update task");

    // Get last SUCCESSFULLY processed ID
    const lastProcessedId = metadata.get("lastProcessedId") ?? "0";

    // Add limit to process in smaller batches
    const creatorUrls = await db
      .select({
        id: creators.id,
        profileUrl: creators.profileUrl,
        profileImageUrl: creators.profileImageUrl,
      })
      .from(creators)
      .where(
        and(
          gt(creators.id, lastProcessedId?.toString() ?? "0"),
          isNotNull(creators.profileImageUrl),
          not(eq(creators.profileImageUrl, ""))
        )
      )
      .orderBy(creators.id);

    logger.info(`Found ${creatorUrls.length} creators to process`);

    for (const item of creatorUrls) {
      logger.info(
        `Processing creator ${item.id} with profile URL ${item.profileUrl}`
      );

      // Check profile URL accessibility (no rate limit needed for this)
      const profileCheck = await fetch(item.profileImageUrl!, {
        method: "GET",
      });

      // Skip if profile is accessible (200)
      if (profileCheck.status === 200) {
        logger.info(
          `Profile ${item.profileUrl} is accessible, skipping update`
        );
        continue;
      }

      // Apply rate limit check before RapidAPI request
      const now = Date.now();
      if (now - RATE_LIMIT.lastResetTime >= 70000) {
        // Reset counter every minute
        RATE_LIMIT.requestCount = 0;
        RATE_LIMIT.lastResetTime = now;
      }

      if (RATE_LIMIT.requestCount >= RATE_LIMIT.requestsPerMinute) {
        logger.info("Rate limit reached, waiting for next minute window...");
        await wait.for({ seconds: 70 });
        RATE_LIMIT.requestCount = 0;
        RATE_LIMIT.lastResetTime = Date.now();
      }

      RATE_LIMIT.requestCount++;
      logger.info(
        `Request ${RATE_LIMIT.requestCount}/${RATE_LIMIT.requestsPerMinute} this minute`
      );

      // Proceed with RapidAPI request
      const profileResponse = await fetch(
        `https://${
          env.RAPIDAPI_HOST
        }/get-linkedin-profile?linkedin_url=${encodeURIComponent(
          item.profileUrl!
        )}`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-key": env.RAPIDAPI_KEY,
            "x-rapidapi-host": env.RAPIDAPI_HOST,
          },
        }
      );

      if (!profileResponse.ok) {
        if (profileResponse.status === 429) {
          logger.info(`Rate limited, waiting before retry...`);
          await wait.for({ seconds: 60 });
          RATE_LIMIT.requestCount = 0;
          RATE_LIMIT.lastResetTime = Date.now();
          continue;
        }
        logger.error(`Error fetching posts for ${item.profileUrl}`, {
          status: profileResponse.status,
          statusText: profileResponse.statusText,
        });
        continue;
      }

      logger.info(`Successfully fetched profile for creator ${item.id}`);
      const responseData: any = await profileResponse.json();
      const data = responseData.data;
      const profileImageUrl = data.profile_image_url;

      logger.info(`Profile image URL: ${profileImageUrl}`);

      if (!profileImageUrl) {
        logger.error(`No profile image URL found for ${item.id}`);
        continue;
      }

      //   logger.info(`Checking to see if image exists for ${item.id}`);

      //check if image for this creator already exists
      //   const existingImage = await fetch(
      //     `https://${env.UPLOADTHING_APP_ID}.ufs.sh/f/${item.id}`,
      //     {
      //       method: "GET",
      //     }
      //   );

      //   if (existingImage.ok) {
      //   logger.info(
      //     `Profile image already exists for ${item.id}, deleting old one`
      //   );
      //   await utapi.deleteFiles(item.id, { keyType: "customId" });
      //   logger.info(`Deleted old profile image for ${item.id}`);
      //   }

      logger.info(`Uploading profile image for ${item.id}`);

      const fileUrl = await utapi.uploadFilesFromUrl({
        url: profileImageUrl,
      });

      if (!fileUrl.data) {
        logger.error(`Error uploading profile image for ${item.id}`);
        break;
      }

      await db
        .update(creators)
        .set({
          profileImageUrl: fileUrl.data.url,
        })
        .where(eq(creators.id, item.id));

      // Update metadata only after successful processing
      metadata.set("lastProcessedId", item.id);

      const lastProcessedId = metadata.get("lastProcessedId");
      logger.info(`Last processed ID new: ${lastProcessedId}`);

      logger.info(`Successfully updated profile for creator ${item.id}`);
    }
  },
});
