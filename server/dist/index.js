"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_config_1 = require("./config/env.config");
const swagger_config_1 = require("./config/swagger.config");
const database_1 = require("./config/database");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const match_routes_1 = __importDefault(require("./routes/match.routes"));
const session_routes_1 = __importDefault(require("./routes/session.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const requests_routes_1 = __importDefault(require("./routes/requests.routes"));
const signaling_controller_1 = require("./controllers/signaling.controller");
const socket_1 = require("./lib/socket");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const ioAllowedOrigins = Array.from(new Set([env_config_1.envConfig.CORS_ORIGIN, env_config_1.envConfig.FRONTEND_URL]
    .filter(Boolean)
    .flatMap((v) => v.split(",").map((s) => s.trim()).filter(Boolean))));
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ioAllowedOrigins,
        methods: ["GET", "POST"],
        credentials: env_config_1.envConfig.CORS_CREDENTIALS,
    },
});
(0, socket_1.setIO)(io);
if (env_config_1.envConfig.MAX_CONNECTIONS && Number(env_config_1.envConfig.MAX_CONNECTIONS) > 0) {
    server.maxConnections = Number(env_config_1.envConfig.MAX_CONNECTIONS);
}
if (env_config_1.envConfig.KEEP_ALIVE_TIMEOUT && Number(env_config_1.envConfig.KEEP_ALIVE_TIMEOUT) > 0) {
    server.keepAliveTimeout = Number(env_config_1.envConfig.KEEP_ALIVE_TIMEOUT);
}
if (env_config_1.envConfig.HEADERS_TIMEOUT && Number(env_config_1.envConfig.HEADERS_TIMEOUT) > 0) {
    server.headersTimeout = Number(env_config_1.envConfig.HEADERS_TIMEOUT);
}
if (env_config_1.envConfig.ENABLE_MATCHING) {
    new signaling_controller_1.SignalingController(io);
    console.log(" WebSocket signaling enabled");
}
if (env_config_1.envConfig.HELMET_ENABLED) {
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
    }));
}
const allowedOrigins = new Set([env_config_1.envConfig.CORS_ORIGIN, env_config_1.envConfig.FRONTEND_URL]
    .filter(Boolean)
    .flatMap((v) => v.split(",").map((s) => s.trim())));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: env_config_1.envConfig.CORS_CREDENTIALS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, cookie_parser_1.default)());
if (env_config_1.envConfig.ENABLE_REQUEST_LOGGING) {
    app.use((0, morgan_1.default)(env_config_1.envConfig.NODE_ENV === "production" ? "combined" : "dev"));
}
if (env_config_1.envConfig.NODE_ENV === "production") {
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: env_config_1.envConfig.RATE_LIMIT_WINDOW_MS,
        max: env_config_1.envConfig.RATE_LIMIT_MAX_REQUESTS,
        message: {
            error: "Too many requests from this IP, please try again later.",
            retryAfter: Math.ceil(env_config_1.envConfig.RATE_LIMIT_WINDOW_MS / 1000),
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use("/api", limiter);
    const authLimiter = (0, express_rate_limit_1.default)({
        windowMs: env_config_1.envConfig.STRICT_RATE_LIMIT_WINDOW_MS,
        max: env_config_1.envConfig.STRICT_RATE_LIMIT_MAX,
        message: {
            error: "Too many authentication attempts, please try again later.",
        },
    });
    app.use("/api/auth", authLimiter);
}
const PORT = process.env.PORT || 5000;
(0, swagger_config_1.setupSwagger)(app);
app.use("/api/health", health_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/match", match_routes_1.default);
app.use("/api/sessions", session_routes_1.default);
app.use("/api/requests", requests_routes_1.default);
if (env_config_1.envConfig.ENABLE_AI_FEATURES) {
    app.use("/api/ai", ai_routes_1.default);
}
app.get("/", (req, res) => {
    res.json({
        name: "DevSwap.live API",
        version: "1.0.0",
        status: "running",
        environment: env_config_1.envConfig.NODE_ENV,
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
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});
async function start() {
    try {
        await (0, database_1.dataBaseConnect)();
    }
    catch (e) {
        console.error(" Failed to connect to MongoDB. Check MONGODB_URI.", e);
    }
    server.listen(PORT, () => {
        console.log(` DevSwap.live Server running on port ${PORT}`);
        console.log(` WebSocket server ready for signaling`);
        console.log(` Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
        if (String(process.env.DISABLE_REDIS || "").toLowerCase() === "true") {
            console.log(" Redis disabled by configuration (DISABLE_REDIS=true).");
        }
    });
}
start();
