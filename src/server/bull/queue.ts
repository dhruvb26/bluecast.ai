"use server";

import { Queue } from "bullmq";
import { getRedisConnection } from "@/utils/redis";

let queue: Queue | null = null;

export async function initializeQueue() {
  if (process.env.NODE_ENV === "development") {
    console.log("Skipping queue initialization in development");
    return null;
  }

  if (queue) {
    console.log("Reusing existing queue");
    return queue;
  }

  console.log("Creating new queue");

  const redisConnection = await getRedisConnection("client");
  queue = new Queue("linkedin-posts", {
    connection: redisConnection as any,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnFail: false,
    },
  });

  console.log("New queue created");

  return queue;
}

export async function getQueue() {
  if (!queue) {
    console.log("Queue not initialized, initializing now");
    return await initializeQueue();
  }
  console.log("Returning existing queue");
  return queue;
}

export async function closeConnections() {
  if (queue) {
    await queue.close();
    console.log("Queue closed");
  }
  const redisConnection = await getRedisConnection("client");
  if (redisConnection) {
    await redisConnection.quit();
    console.log("Redis connection closed");
  }
  console.log("All connections closed");
}
