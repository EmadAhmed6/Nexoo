import { createClient } from "redis";
import "dotenv/config";

const redis = createClient({
  url: `redis://${process.env.REDIS_USERNAME || "default"}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}/0`,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379,
  },
});

redis.on("error", (err) => console.error("Redis Client Error ❌", err));

const connectToRedis = async () => {
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }
    console.log("Connected to Redis successfully! 🚀");
  } catch (err) {
    console.error("Redis connection failed: ❌", err);
  }
};

export { redis, connectToRedis };
