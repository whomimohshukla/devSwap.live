"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envConfig = void 0;
// src/config/env.config.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const requiredEnvVars = [
    'JWT_SECRET',
    'MONGODB_URI',
];
function validateEnv() {
    const missingBase = requiredEnvVars.filter(key => !process.env[key]);
    if (missingBase.length > 0) {
        throw new Error(`Missing required environment variables: ${missingBase.join(', ')}`);
    }
    const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
    if (provider === 'gemini') {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('Missing required environment variables: GEMINI_API_KEY');
        }
    }
    else if (provider === 'openrouter') {
        if (!process.env.OPENROUTER_API_KEY) {
            throw new Error('Missing required environment variables: OPENROUTER_API_KEY');
        }
    }
    else if (provider === 'openai') {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('Missing required environment variables: OPENAI_API_KEY');
        }
    }
}
function parseBoolean(value, defaultValue = false) {
    if (!value)
        return defaultValue;
    return value.toLowerCase() === 'true';
}
function parseNumber(value, defaultValue) {
    if (!value)
        return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}
function parseArray(value, defaultValue = []) {
    if (!value)
        return defaultValue;
    return value.split(',').map(item => item.trim());
}
// Validate environment variables on startup
validateEnv();
exports.envConfig = {
    // Server
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseNumber(process.env.PORT, 5000),
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    // Database
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_TEST_URI: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/devswap_test',
    // Redis
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_DB: parseNumber(process.env.REDIS_DB, 0),
    DISABLE_REDIS: parseBoolean(process.env.DISABLE_REDIS, false),
    // JWT
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    // AI Provider
    AI_PROVIDER: (process.env.AI_PROVIDER || 'gemini').toLowerCase(),
    // Gemini
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    // OpenRouter
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
    // OpenAI (legacy)
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    OPENAI_MAX_TOKENS: parseNumber(process.env.OPENAI_MAX_TOKENS, 2000),
    OPENAI_TEMPERATURE: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 900000),
    RATE_LIMIT_MAX_REQUESTS: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 1000),
    STRICT_RATE_LIMIT_MAX: parseNumber(process.env.STRICT_RATE_LIMIT_MAX, 50),
    STRICT_RATE_LIMIT_WINDOW_MS: parseNumber(process.env.STRICT_RATE_LIMIT_WINDOW_MS, 5 * 60 * 1000),
    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
    CORS_CREDENTIALS: parseBoolean(process.env.CORS_CREDENTIALS, true),
    // Session
    SESSION_TIMEOUT_MINUTES: parseNumber(process.env.SESSION_TIMEOUT_MINUTES, 60),
    MAX_CONCURRENT_SESSIONS: parseNumber(process.env.MAX_CONCURRENT_SESSIONS, 5),
    // File Upload
    MAX_FILE_SIZE: parseNumber(process.env.MAX_FILE_SIZE, 5242880), // 5MB
    ALLOWED_FILE_TYPES: parseArray(process.env.ALLOWED_FILE_TYPES, ['image/jpeg', 'image/png', 'image/gif']),
    // Email
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: parseNumber(process.env.SMTP_PORT, 587),
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    FROM_EMAIL: process.env.FROM_EMAIL,
    // Monitoring
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    ENABLE_REQUEST_LOGGING: parseBoolean(process.env.ENABLE_REQUEST_LOGGING, true),
    SENTRY_DSN: process.env.SENTRY_DSN,
    // Security
    BCRYPT_ROUNDS: parseNumber(process.env.BCRYPT_ROUNDS, 12),
    COOKIE_SECRET: process.env.COOKIE_SECRET || 'default-cookie-secret',
    HELMET_ENABLED: parseBoolean(process.env.HELMET_ENABLED, true),
    // WebRTC
    TURN_SERVER_URL: process.env.TURN_SERVER_URL,
    TURN_USERNAME: process.env.TURN_USERNAME,
    TURN_CREDENTIAL: process.env.TURN_CREDENTIAL,
    STUN_SERVER_URL: process.env.STUN_SERVER_URL || 'stun:stun.l.google.com:19302',
    // Feature Flags
    ENABLE_AI_FEATURES: parseBoolean(process.env.ENABLE_AI_FEATURES, true),
    ENABLE_MATCHING: parseBoolean(process.env.ENABLE_MATCHING, true),
    ENABLE_NOTIFICATIONS: parseBoolean(process.env.ENABLE_NOTIFICATIONS, true),
    ENABLE_ANALYTICS: parseBoolean(process.env.ENABLE_ANALYTICS, false),
    // Performance
    MAX_CONNECTIONS: parseNumber(process.env.MAX_CONNECTIONS, 1000),
    KEEP_ALIVE_TIMEOUT: parseNumber(process.env.KEEP_ALIVE_TIMEOUT, 65000),
    HEADERS_TIMEOUT: parseNumber(process.env.HEADERS_TIMEOUT, 66000),
    // OAuth (optional)
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || `${process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`}/api/auth/google/callback`,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_REDIRECT_URI: process.env.GITHUB_REDIRECT_URI || `${process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`}/api/auth/github/callback`,
};
exports.default = exports.envConfig;
