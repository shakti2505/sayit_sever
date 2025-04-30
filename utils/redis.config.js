import { createClient } from "redis";

const redisClient = createClient({ url: process.env.REDIS_URL });

let isConnected = false;

async function connectRedis() {
  if (!isConnected) {
    redisClient.on("error", (err) => console.log("Redis Error", err));
    await redisClient.connect();
    isConnected = true;
    console.log("🔗 Redis connected");
  }
}

export { redisClient, connectRedis };
