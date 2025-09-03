
import Redis from "ioredis";

const DISABLE_REDIS = String(process.env.DISABLE_REDIS || "").toLowerCase() === "true";
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_DB = parseInt(process.env.REDIS_DB || "0", 10);

export let isRedisAvailable = false;

type RedisLike = {
  zadd: (...args: any[]) => Promise<any>;
  zrem: (...args: any[]) => Promise<any>;
  pipeline: () => { sadd: (...args: any[]) => any; srem: (...args: any[]) => any; exec: () => Promise<any> };
  sadd: (...args: any[]) => Promise<any>;
  srem: (...args: any[]) => Promise<any>;
  sinter: (...args: any[]) => Promise<string[]>;
  evalsha: (...args: any[]) => Promise<any>;
  eval: (...args: any[]) => Promise<any>;
  script: (...args: any[]) => Promise<any>;
  on?: (evt: string, cb: (...a: any[]) => void) => void;
};

function createStub(): RedisLike {
  return {
    async zadd() { return 0; },
    async zrem() { return 0; },
    pipeline() {
      return {
        sadd() { return this; },
        srem() { return this; },
        async exec() { return []; },
      } as any;
    },
    async sadd() { return 0; },
    async srem() { return 0; },
    async sinter() { return []; },
    async evalsha() { return ["ERR"]; },
    async eval() { return ["ERR"]; },
    async script() { return "stub-sha"; },
  } as RedisLike;
}

let redis: RedisLike;

if (DISABLE_REDIS) {
  console.warn("[redis] Disabled via DISABLE_REDIS=true. Using no-op stub.");
  redis = createStub();
  isRedisAvailable = false;
} else {
  // Parse Redis URL and create configuration
  let redisConfig: any;
  
  if (REDIS_URL.startsWith('redis://') || REDIS_URL.startsWith('rediss://')) {
    // Use URL-based configuration for Redis Cloud or other hosted Redis
    redisConfig = REDIS_URL;
  } else {
    // Use object-based configuration for localhost
    const url = new URL(REDIS_URL.startsWith('redis://') ? REDIS_URL : `redis://${REDIS_URL}`);
    redisConfig = {
      host: url.hostname,
      port: parseInt(url.port, 10) || 6379,
      password: REDIS_PASSWORD || url.password,
      db: REDIS_DB,
    };
  }

  const client = new Redis(redisConfig, {
    maxRetriesPerRequest: 3,
    enableAutoPipelining: true,
    lazyConnect: true,
    connectTimeout: 10000,
    commandTimeout: 5000,
  });
  client.on("error", (err) => {
    // Prevent unhandled error spam; log once at startup
    if (!isRedisAvailable) {
      console.warn(`[redis] Connection error: ${err?.message}. Using degraded mode.`);
      console.warn(`[redis] Redis URL: ${REDIS_URL.replace(/:[^:@]*@/, ':****@')}`);
    }
    isRedisAvailable = false;
  });
  client.on("ready", () => {
    isRedisAvailable = true;
    console.log("[redis] Connected and ready.");
  });
  
  client.on("connect", () => {
    console.log("[redis] Connecting...");
  });
  
  client.on("reconnecting", () => {
    console.log("[redis] Reconnecting...");
  });
  
  client.on("close", () => {
    console.log("[redis] Connection closed.");
    isRedisAvailable = false;
  });
  
  // Attempt initial connection
  client.connect().catch(err => {
    console.warn(`[redis] Initial connection failed: ${err.message}. Will retry automatically.`);
  });
  redis = client as unknown as RedisLike;
}

export default redis;
