"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/lib/redisClient.ts
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
    // recommended for production tuning
    maxRetriesPerRequest: 2,
    enableAutoPipelining: true,
});
exports.default = redis;
