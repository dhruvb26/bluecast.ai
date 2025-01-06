"use server";
export const register = async () => {
  if (process.env.NODE_ENV === "development") {
    console.log("Skipping worker initialization in development");
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { Worker } = await import("bullmq");
    const { postWorker } = await import("./server/bull/worker");
    const { getRedisConnection } = await import("./utils/redis");

    const redisConnection = await getRedisConnection("subscriber");
    const worker = new Worker("linkedin-posts", postWorker, {
      connection: redisConnection as any,
    });

    console.log("Worker started for queue: linkedin-posts");

    worker.on("completed", async (job) => {
      console.log(`Job completed for ${job.id}`);
    });
    worker.on("failed", async (job, err) => {
      console.error(`${job?.id} has failed with ${err.message}`);
    });
    worker.on("stalled", (str) => {
      console.log(`Job stalled: ${str}`);
    });
  }
};
