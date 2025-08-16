// src/config/swagger.config.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevSwap.live API',
      version: '1.0.0',
      description: 'A comprehensive skill-swapping platform API that connects developers for peer-to-peer learning sessions',
      contact: {
        name: 'DevSwap.live Team',
        email: 'support@devswap.live'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.devswap.live/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'User ID' },
            name: { type: 'string', description: 'User full name' },
            email: { type: 'string', format: 'email', description: 'User email address' },
            avatar: { type: 'string', description: 'Profile picture URL' },
            bio: { type: 'string', description: 'User biography' },
            teachSkills: {
              type: 'array',
              items: { type: 'string' },
              description: 'Skills the user can teach'
            },
            learnSkills: {
              type: 'array',
              items: { type: 'string' },
              description: 'Skills the user wants to learn'
            },
            skillLevels: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  skillName: { type: 'string' },
                  level: { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced'] }
                }
              }
            },
            isOnline: { type: 'boolean', description: 'User online status' },
            location: { type: 'string', description: 'User location' },
            lastSeen: { type: 'string', format: 'date-time', description: 'Last activity timestamp' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Session: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Session ID' },
            userA: { $ref: '#/components/schemas/User' },
            userB: { $ref: '#/components/schemas/User' },
            skillFromA: { type: 'string', description: 'Skill taught by user A' },
            skillFromB: { type: 'string', description: 'Skill taught by user B' },
            isActive: { type: 'boolean', description: 'Session active status' },
            startedAt: { type: 'string', format: 'date-time' },
            endedAt: { type: 'string', format: 'date-time' }
          }
        },
        LessonPlan: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            sessionId: { type: 'string', description: 'Associated session ID' },
            teacherSkill: { type: 'string' },
            learnerSkill: { type: 'string' },
            teacherLevel: { type: 'string' },
            learnerLevel: { type: 'string' },
            content: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                objectives: { type: 'array', items: { type: 'string' } },
                activities: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['explanation', 'practice', 'demo', 'discussion'] },
                      description: { type: 'string' },
                      duration: { type: 'number', description: 'Duration in minutes' },
                      resources: { type: 'array', items: { type: 'string' } }
                    }
                  }
                },
                assessments: { type: 'array', items: { type: 'string' } },
                nextSteps: { type: 'array', items: { type: 'string' } }
              }
            },
            aiModel: { type: 'string', description: 'AI model used for generation' },
            generatedAt: { type: 'string', format: 'date-time' },
            cached: { type: 'boolean', description: 'Whether this plan is cached for reuse' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Error message' },
            success: { type: 'boolean', default: false },
            error: { type: 'string', description: 'Detailed error information' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', default: true },
            message: { type: 'string', description: 'Success message' },
            data: { type: 'object', description: 'Response data' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.ts'
  ]
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'DevSwap.live API Documentation'
  }));

  // JSON endpoint for the OpenAPI spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export default specs;
