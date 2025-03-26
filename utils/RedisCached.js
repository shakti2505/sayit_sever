import redisClient from "./redis.config.js";

export const cachedWithRedis = async (key, value) => {
  await redisClient.set(key, JSON.stringify(value));
  await redisClient.expire(key, 10);
};

export const getWithRedis = async (key) => {
  const cachedValue = await redisClient.get(key);
  return cachedValue;
};
