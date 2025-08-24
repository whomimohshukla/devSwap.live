
import Redis from "ioredis";

const DISABLE_REDIS = String(process.env.DISABLE_REDIS || "").toLowerCase() === "true";
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

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
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 2,
    enableAutoPipelining: true,
  });
  client.on("error", (err) => {
    // Prevent unhandled error spam; log once at startup
    if (!isRedisAvailable) {
      console.warn(`[redis] Connection error: ${err?.message}. Using degraded mode.`);
    }
  });
  client.on("ready", () => {
    isRedisAvailable = true;
    console.log("[redis] Connected and ready.");
  });
  redis = client as unknown as RedisLike;
}

export default redis;
