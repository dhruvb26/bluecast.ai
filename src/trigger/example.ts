import { logger, schedules, wait } from "@trigger.dev/sdk/v3";

export const firstScheduledTask = schedules.task({
  id: "first-scheduled-task",
  cron: "0 0 * * *",
  maxDuration: 5000,
  run: async (payload, { ctx }) => {
    const distanceInMs =
      payload.timestamp.getTime() -
      (payload.lastTimestamp ?? new Date()).getTime();

    logger.log("First scheduled tasks", { payload, distanceInMs });

    // Wait for 5 seconds
    await wait.for({ seconds: 5 });

    // Format the timestamp using the timezone from the payload
    const formatted = payload.timestamp.toLocaleString("en-US", {
      timeZone: payload.timezone,
    });

    logger.log(formatted);
  },
});
