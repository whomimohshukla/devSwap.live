// src/services/healthCheck.service.ts
import mongoose from 'mongoose';
import { envConfig } from '../config/env.config';
import redis, { isRedisAvailable } from '../lib/redisClient';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    openai: ServiceHealth;
  };
  metrics: {
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    activeConnections: number;
  };
}

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  error?: string;
  lastChecked: string;
}

class HealthCheckService {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  async getHealthStatus(): Promise<HealthStatus> {
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

  private async checkDatabase(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      if (!mongoose.connection.db) {
        throw new Error('Database connection not established');
      }
      await mongoose.connection.db.admin().ping();
      return {
        status: 'up',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date().toISOString()
      };
    }
  }

  private async checkRedis(): Promise<ServiceHealth> {
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
      await (redis as any).sinter('healthcheck');
      return {
        status: isRedisAvailable ? 'up' : 'degraded',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date().toISOString()
      };
    }
  }

  private async checkOpenAI(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      // Simple check - just verify API key is configured
      if (!envConfig.OPENAI_API_KEY || envConfig.OPENAI_API_KEY === 'your-openai-api-key') {
        throw new Error('OpenAI API key not configured');
      }
      
      return {
        status: 'up',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date().toISOString()
      };
    }
  }

  private getServiceResult(result: PromiseSettledResult<ServiceHealth>): ServiceHealth {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      status: 'down',
      error: 'Health check failed',
      lastChecked: new Date().toISOString()
    };
  }

  private determineOverallStatus(services: { [key: string]: ServiceHealth }): 'healthy' | 'unhealthy' | 'degraded' {
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

  private getActiveConnections(): number {
    // This is a simplified metric - in production you'd track actual connections
    return mongoose.connection.readyState === 1 ? 1 : 0;
  }

  async getMetrics(): Promise<any> {
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

export default new HealthCheckService();
