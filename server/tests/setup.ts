// tests/setup.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Redis from 'ioredis-mock';

let mongoServer: MongoMemoryServer;

// Mock Redis
jest.mock('ioredis', () => require('ioredis-mock'));

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  title: "Test Lesson Plan",
                  objectives: ["Learn basics"],
                  activities: [{
                    type: "explanation",
                    description: "Test activity",
                    duration: 10,
                    resources: []
                  }],
                  assessments: ["Test assessment"],
                  nextSteps: ["Continue learning"]
                })
              }
            }]
          })
        }
      }
    }))
  };
});

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Clean up
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Global test timeout
jest.setTimeout(30000);
