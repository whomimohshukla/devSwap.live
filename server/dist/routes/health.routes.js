"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/health.routes.ts
const express_1 = __importDefault(require("express"));
const healthCheck_service_1 = __importDefault(require("../services/healthCheck.service"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health checks and monitoring endpoints
 */
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get application health status
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Health status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, unhealthy, degraded]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Uptime in milliseconds
 *                 version:
 *                   type: string
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [up, down, degraded]
 *                         responseTime:
 *                           type: number
 *                         lastChecked:
 *                           type: string
 *                           format: date-time
 *                     redis:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [up, down, degraded]
 *                         responseTime:
 *                           type: number
 *                         lastChecked:
 *                           type: string
 *                           format: date-time
 *                     openai:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [up, down, degraded]
 *                         responseTime:
 *                           type: number
 *                         lastChecked:
 *                           type: string
 *                           format: date-time
 *       503:
 *         description: Service unavailable
 */
router.get('/', async (req, res) => {
    try {
        const healthStatus = await healthCheck_service_1.default.getHealthStatus();
        const statusCode = healthStatus.status === 'healthy' ? 200 :
            healthStatus.status === 'degraded' ? 200 : 503;
        res.status(statusCode).json(healthStatus);
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Health check failed'
        });
    }
});
/**
 * @swagger
 * /health/metrics:
 *   get:
 *     summary: Get application metrics
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 */
router.get('/metrics', async (req, res) => {
    try {
        const metrics = await healthCheck_service_1.default.getMetrics();
        res.json(metrics);
    }
    catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to get metrics'
        });
    }
});
/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe for Kubernetes
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Application is ready
 *       503:
 *         description: Application is not ready
 */
router.get('/ready', async (req, res) => {
    try {
        const healthStatus = await healthCheck_service_1.default.getHealthStatus();
        if (healthStatus.status === 'unhealthy') {
            return res.status(503).json({ ready: false, status: healthStatus.status });
        }
        res.json({ ready: true, status: healthStatus.status });
    }
    catch (error) {
        res.status(503).json({
            ready: false,
            error: error instanceof Error ? error.message : 'Readiness check failed'
        });
    }
});
/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe for Kubernetes
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Application is alive
 */
router.get('/live', (req, res) => {
    res.json({
        alive: true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
exports.default = router;
