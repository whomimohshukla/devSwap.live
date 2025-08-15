// src/lib/redisClient.ts
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
	// recommended for production tuning
	maxRetriesPerRequest: 2,
	enableAutoPipelining: true,
});

export default redis;
