"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strictLimiter = exports.generalLimiter = void 0;
// src/middleware/rateLimiter.ts
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_config_1 = __importDefault(require("../config/env.config"));
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_config_1.default.RATE_LIMIT_WINDOW_MS,
    max: env_config_1.default.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: "Too many requests. Please try again later.",
        });
    },
});
exports.strictLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_config_1.default.STRICT_RATE_LIMIT_WINDOW_MS,
    max: env_config_1.default.STRICT_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: "Too many attempts. Try again after 5 minutes.",
        });
    },
});
