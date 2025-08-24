"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRedisAvailable = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const DISABLE_REDIS = String(process.env.DISABLE_REDIS || "").toLowerCase() === "true";
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
exports.isRedisAvailable = false;
function createStub() {
    return {
        async zadd() { return 0; },
        async zrem() { return 0; },
        pipeline() {
            return {
                sadd() { return this; },
                srem() { return this; },
                async exec() { return []; },
            };
        },
        async sadd() { return 0; },
        async srem() { return 0; },
        async sinter() { return []; },
        async evalsha() { return ["ERR"]; },
        async eval() { return ["ERR"]; },
        async script() { return "stub-sha"; },
    };
}
let redis;
if (DISABLE_REDIS) {
    console.warn("[redis] Disabled via DISABLE_REDIS=true. Using no-op stub.");
    redis = createStub();
    exports.isRedisAvailable = false;
}
else {
    const client = new ioredis_1.default(REDIS_URL, {
        maxRetriesPerRequest: 2,
        enableAutoPipelining: true,
    });
    client.on("error", (err) => {
        // Prevent unhandled error spam; log once at startup
        if (!exports.isRedisAvailable) {
            console.warn(`[redis] Connection error: ${err?.message}. Using degraded mode.`);
        }
    });
    client.on("ready", () => {
        exports.isRedisAvailable = true;
        console.log("[redis] Connected and ready.");
    });
    redis = client;
}
exports.default = redis;
