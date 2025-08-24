"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/services/healthCheck.service.ts
const mongoose_1 = __importDefault(require("mongoose"));
const env_config_1 = require("../config/env.config");
const redisClient_1 = __importStar(require("../lib/redisClient"));
class HealthCheckService {
    constructor() {
        this.startTime = Date.now();
    }
    async getHealthStatus() {
        const timestamp = new Date().toISOString();
        const [dbHealth, redisHealth, openaiHealth] = await Promise.allSettled([
            this.checkDatabase(),
            this.checkRedis(),
            this.checkOpenAI()
        ]);
        const services = {
            database: this.getServiceResult(dbHealth),
            redis: this.getServiceResult(redisHealth),
            openai: this.getServiceResult(openaiHealth)
        };
        const overallStatus = this.determineOverallStatus(services);
        return {
            status: overallStatus,
            timestamp,
            uptime: Date.now() - this.startTime,
            version: process.env.npm_package_version || '1.0.0',
            services,
            metrics: {
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage(),
                activeConnections: this.getActiveConnections()
            }
        };
    }
    async checkDatabase() {
        const startTime = Date.now();
        try {
            if (!mongoose_1.default.connection.db) {
                throw new Error('Database connection not established');
            }
            await mongoose_1.default.connection.db.admin().ping();
            return {
                status: 'up',
                responseTime: Date.now() - startTime,
                lastChecked: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                status: 'down',
                error: error instanceof Error ? error.message : 'Unknown error',
                lastChecked: new Date().toISOString()
            };
        }
    }
    async checkRedis() {
        const startTime = Date.now();
        // If redis is disabled via env, report degraded without attempting a connection
        if (String(process.env.DISABLE_REDIS || '').toLowerCase() === 'true') {
            return {
                status: 'degraded',
                responseTime: Date.now() - startTime,
                error: 'Redis disabled by configuration',
                lastChecked: new Date().toISOString(),
            };
        }
        try {
            // Use a lightweight op via shared client; falls back to stub in tests
            await redisClient_1.default.sinter('healthcheck');
            return {
                status: redisClient_1.isRedisAvailable ? 'up' : 'degraded',
                responseTime: Date.now() - startTime,
                lastChecked: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                status: 'down',
                error: error instanceof Error ? error.message : 'Unknown error',
                lastChecked: new Date().toISOString()
            };
        }
    }
    async checkOpenAI() {
        const startTime = Date.now();
        try {
            // Simple check - just verify API key is configured
            if (!env_config_1.envConfig.OPENAI_API_KEY || env_config_1.envConfig.OPENAI_API_KEY === 'your-openai-api-key') {
                throw new Error('OpenAI API key not configured');
            }
            return {
                status: 'up',
                responseTime: Date.now() - startTime,
                lastChecked: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                status: 'down',
                error: error instanceof Error ? error.message : 'Unknown error',
                lastChecked: new Date().toISOString()
            };
        }
    }
    getServiceResult(result) {
        if (result.status === 'fulfilled') {
            return result.value;
        }
        return {
            status: 'down',
            error: 'Health check failed',
            lastChecked: new Date().toISOString()
        };
    }
    determineOverallStatus(services) {
        const serviceStatuses = Object.values(services).map(s => s.status);
        if (serviceStatuses.every(status => status === 'up')) {
            return 'healthy';
        }
        if (serviceStatuses.some(status => status === 'down')) {
            // If critical services are down, mark as unhealthy
            if (services.database.status === 'down') {
                return 'unhealthy';
            }
            return 'degraded';
        }
        return 'degraded';
    }
    getActiveConnections() {
        // This is a simplified metric - in production you'd track actual connections
        return mongoose_1.default.connection.readyState === 1 ? 1 : 0;
    }
    async getMetrics() {
        return {
            timestamp: new Date().toISOString(),
            uptime: Date.now() - this.startTime,
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            eventLoop: process.hrtime(),
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch
        };
    }
}
exports.default = new HealthCheckService();
