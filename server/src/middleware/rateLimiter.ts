// src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import envConfig from "../config/env.config";


export const generalLimiter = rateLimit({
    windowMs: envConfig.RATE_LIMIT_WINDOW_MS,
    max: envConfig.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            error: "Too many requests. Please try again later.",
        });
    },
});


export const strictLimiter = rateLimit({
    windowMs: envConfig.STRICT_RATE_LIMIT_WINDOW_MS,
    max: envConfig.STRICT_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            error: "Too many attempts. Try again after 5 minutes.",
        });
    },
});
