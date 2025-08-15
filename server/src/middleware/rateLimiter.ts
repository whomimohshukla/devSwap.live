// src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// General limiter — for normal routes
export const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // 100 requests per IP
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req: Request, res: Response) => {
		res.status(429).json({
			error: "Too many requests. Please try again later.",
		});
	},
});

// Strict limiter — for sensitive actions like login or match
export const strictLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 5, // Only 5 attempts per IP
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req: Request, res: Response) => {
		res.status(429).json({
			error: "Too many attempts. Try again after 5 minutes.",
		});
	},
});
