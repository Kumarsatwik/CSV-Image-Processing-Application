const Redis = require("ioredis");

const createRedisClient = () => {
  return new Redis(process.env.UPSTASH_REDIS_URL, {
    tls: {
      rejectUnauthorized: false,
    },
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });
};

const redisClient = createRedisClient();

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Successfully connected to Redis");
});

module.exports = { redisClient, createRedisClient };
