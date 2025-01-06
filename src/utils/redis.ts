"use server";

import { cache } from "react";
import IORedis from "ioredis";
import { env } from "@/env";

const redisOptions = {
  port: 12701,
  host: "redis-12701.c325.us-east-1-4.ec2.redns.redis-cloud.com",
  username: "default",
  enableTLSForSentinelMode: false,
  password: env.REDIS_CLOUD_PASSWORD,
  maxRetriesPerRequest: null,
  retryStrategy: function (times: number) {
    return Math.max(Math.min(Math.exp(times), 20000), 1000);
  },
};

let sharedClient: IORedis | null = null;
let sharedSubscriber: IORedis | null = null;

function createConnection(type: "client" | "subscriber" | "bclient"): IORedis {
  console.log(`Creating new Redis ${type} connection...`);
  const connection = new IORedis(redisOptions);

  connection.on("error", (error) => {
    console.error(`Redis ${type} connection error:`, error);
  });

  connection.on("connect", () => {
    console.log(`Connected to Redis (${type})`);
  });

  connection.on("ready", () => {
    console.log(`Redis ${type} connection is ready`);
  });

  return connection;
}

export const getSharedConnection = cache(
  (type: "client" | "subscriber" | "bclient") => {
    if (process.env.NODE_ENV === "development") {
      console.log("Skipping Redis connection in development");
      return null;
    }

    switch (type) {
      case "client":
        if (!sharedClient) {
          sharedClient = createConnection("client");
        } else {
          console.log("Reusing existing Redis client connection");
        }
        return sharedClient;
      case "subscriber":
        if (!sharedSubscriber) {
          sharedSubscriber = createConnection("subscriber");
        } else {
          console.log("Reusing existing Redis subscriber connection");
        }
        return sharedSubscriber;
      case "bclient":
        // For 'bclient', we always create a new connection
        return createConnection("bclient");
      default:
        throw new Error("Unexpected connection type: " + type);
    }
  }
);

export async function getRedisConnection(
  type: "client" | "subscriber" | "bclient" = "client"
) {
  return getSharedConnection(type);
}
