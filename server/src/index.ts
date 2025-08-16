import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

// Configuration
import { envConfig } from "./config/env.config";
import { setupSwagger } from "./config/swagger.config";
import { dataBaseConnect } from "./config/database";

// Routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import matchRoutes from "./routes/match.routes";
import sessionRoutes from "./routes/session.routes";
import aiRoutes from "./routes/ai.routes";
import healthRoutes from "./routes/health.routes";

// Controllers
import { SignalingController } from "./controllers/signaling.controller";

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: envConfig.CORS_ORIGIN,
		methods: ["GET", "POST"],
		credentials: envConfig.CORS_CREDENTIALS,
	},
});

// Initialize signaling controller
if (envConfig.ENABLE_MATCHING) {
	new SignalingController(io);
	console.log("✅ WebSocket signaling enabled");
}

// Security Middleware
if (envConfig.HELMET_ENABLED) {
	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					styleSrc: ["'self'", "'unsafe-inline'"],
					scriptSrc: ["'self'"],
					imgSrc: ["'self'", "data:", "https:"],
				},
			},
		})
	);
}

// CORS
app.use(
	cors({
		origin: envConfig.CORS_ORIGIN,
		credentials: envConfig.CORS_CREDENTIALS,
	})
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
if (envConfig.ENABLE_REQUEST_LOGGING) {
	app.use(morgan(envConfig.NODE_ENV === "production" ? "combined" : "dev"));
}

// Rate limiting
const limiter = rateLimit({
	windowMs: envConfig.RATE_LIMIT_WINDOW_MS,
	max: envConfig.RATE_LIMIT_MAX_REQUESTS,
	message: {
		error: "Too many requests from this IP, please try again later.",
		retryAfter: Math.ceil(envConfig.RATE_LIMIT_WINDOW_MS / 1000),
	},
	standardHeaders: true,
	legacyHeaders: false,
});
app.use("/api", limiter);

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
	windowMs: envConfig.RATE_LIMIT_WINDOW_MS,
	max: envConfig.STRICT_RATE_LIMIT_MAX,
	message: {
		error: "Too many authentication attempts, please try again later.",
	},
});
app.use("/api/auth", authLimiter);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
	res.json({
		message: "DevSwap.live API Server",
		version: "1.0.0",
		services: [
			"Auth Service",
			"User Service",
			"Matching Service",
			"Session Service",
			"AI Service",
			"Signaling Service",
		],
	});
});

// API Documentation
setupSwagger(app);

// Health checks (no rate limiting)
app.use("/api/health", healthRoutes);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/sessions", sessionRoutes);
if (envConfig.ENABLE_AI_FEATURES) {
	app.use("/api/ai", aiRoutes);
}

// Root endpoint
app.get("/", (req, res) => {
	res.json({
		name: "DevSwap.live API",
		version: "1.0.0",
		status: "running",
		environment: envConfig.NODE_ENV,
		docs: "/api-docs",
		health: "/api/health",
	});
});

// 404 handler (no wildcard pattern to avoid path-to-regexp issues)
app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: "API endpoint not found",
		path: req.originalUrl,
	});
});

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
	console.error(err.stack);
	res.status(500).json({ message: "Something went wrong!" });
});

// Start application after connecting to database
async function start() {
	try {
		await dataBaseConnect();
	} catch (e) {
		console.error(" Failed to connect to MongoDB. Check MONGODB_URI.", e);
	}
	server.listen(PORT, () => {
		console.log(` DevSwap.live Server running on port ${PORT}`);
		console.log(` WebSocket server ready for signaling`);
		console.log(
			` Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
		);
		if (String(process.env.DISABLE_REDIS || "").toLowerCase() === "true") {
			console.log(" Redis disabled by configuration (DISABLE_REDIS=true).");
		}
	});
}

start();
