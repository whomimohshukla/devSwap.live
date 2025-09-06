import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { envConfig } from "./config/env.config";
import { setupSwagger } from "./config/swagger.config";
import { dataBaseConnect } from "./config/database";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import matchRoutes from "./routes/match.routes";
import sessionRoutes from "./routes/session.routes";
import aiRoutes from "./routes/ai.routes";
import healthRoutes from "./routes/health.routes";
import requestsRoutes from "./routes/requests.routes";

import { SignalingController } from "./controllers/signaling.controller";
import { setIO } from "./lib/socket";

const app = express();
const server = createServer(app);

const ioAllowedOrigins = Array.from(
    new Set(
        [envConfig.CORS_ORIGIN, envConfig.FRONTEND_URL]
            .filter(Boolean)
            .flatMap((v) => v.split(",").map((s) => s.trim()).filter(Boolean))
    )
);

// In development, automatically include common localhost origins (e.g., Vite on 5173)
if (envConfig.NODE_ENV !== "production") {
    [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ].forEach((o) => {
        if (!ioAllowedOrigins.includes(o)) ioAllowedOrigins.push(o);
    });
}

const io = new Server(server, {
    cors: {
        origin: ioAllowedOrigins,
        methods: ["GET", "POST"],
        credentials: envConfig.CORS_CREDENTIALS,
    },
});

setIO(io);

if (envConfig.MAX_CONNECTIONS && Number(envConfig.MAX_CONNECTIONS) > 0) {
    server.maxConnections = Number(envConfig.MAX_CONNECTIONS);
}
if (envConfig.KEEP_ALIVE_TIMEOUT && Number(envConfig.KEEP_ALIVE_TIMEOUT) > 0) {
    server.keepAliveTimeout = Number(envConfig.KEEP_ALIVE_TIMEOUT);
}
if (envConfig.HEADERS_TIMEOUT && Number(envConfig.HEADERS_TIMEOUT) > 0) {
    server.headersTimeout = Number(envConfig.HEADERS_TIMEOUT);
}

if (envConfig.ENABLE_MATCHING) {
    new SignalingController(io);
    console.log(" WebSocket signaling enabled");
}

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

const allowedOrigins = new Set(
    [envConfig.CORS_ORIGIN, envConfig.FRONTEND_URL]
        .filter(Boolean)
        .flatMap((v) => v.split(",").map((s) => s.trim()))
);

// In development, allow common localhost origins by default
if (envConfig.NODE_ENV !== "production") {
    [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ].forEach((o) => allowedOrigins.add(o));
}

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow non-browser requests (no Origin) and requests from explicitly allowed origins
            if (!origin || allowedOrigins.has(origin)) {
                return callback(null, true);
            }
            // During development, allow any http(s) localhost origin/port to simplify DX
            if (
                envConfig.NODE_ENV !== "production" &&
                /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
            ) {
                return callback(null, true);
            }
            return callback(new Error(`Not allowed by CORS: ${origin}`));
        },
        credentials: envConfig.CORS_CREDENTIALS,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["Set-Cookie"],
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());

if (envConfig.ENABLE_REQUEST_LOGGING) {
    app.use(morgan(envConfig.NODE_ENV === "production" ? "combined" : "dev"));
}

if (envConfig.NODE_ENV === "production") {
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

    const authLimiter = rateLimit({
        windowMs: envConfig.STRICT_RATE_LIMIT_WINDOW_MS,
        max: envConfig.STRICT_RATE_LIMIT_MAX,
        message: {
            error: "Too many authentication attempts, please try again later.",
        },
    });
    app.use("/api/auth", authLimiter);
}

const PORT = process.env.PORT || 3000;
// console.log(PORT)

setupSwagger(app);

app.use("/api/health", healthRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/requests", requestsRoutes);
if (envConfig.ENABLE_AI_FEATURES) {
    app.use("/api/ai", aiRoutes);
}

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

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
        path: req.originalUrl,
    });
});

app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

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
