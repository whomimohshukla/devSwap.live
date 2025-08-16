// tests/integration/matching.integration.test.ts
import request from 'supertest';
import express from 'express';
import { joinMatching, leaveMatching } from '../../src/controllers/match.controller';
import User from '../../src/models/user.model';
import Session from '../../src/models/session.model';

const app = express();
app.use(express.json());

// Mock auth middleware
const createAuthMiddleware = (userId: string) => (req: any, res: any, next: any) => {
  req.user = { id: userId };
  next();
};

// Mock Redis for testing
jest.mock('ioredis', () => {
  const mockRedis = {
    sadd: jest.fn().mockResolvedValue(1),
    srem: jest.fn().mockResolvedValue(1),
    smembers: jest.fn().mockResolvedValue([]),
    del: jest.fn().mockResolvedValue(1),
    eval: jest.fn().mockResolvedValue(null)
  };
  return jest.fn(() => mockRedis);
});

describe('Matching Integration Tests', () => {
  let user1: any, user2: any;

  beforeEach(async () => {
    // Create test users
    user1 = new User({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
      teachSkills: ['React', 'JavaScript'],
      learnSkills: ['Node.js', 'Python']
    });
    await user1.save();

    user2 = new User({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      teachSkills: ['Node.js', 'Python'],
      learnSkills: ['React', 'TypeScript']
    });
    await user2.save();
  });

  describe('User Model Tests', () => {
    it('should create users with complementary skills', async () => {
      expect(user1.teachSkills).toContain('React');
      expect(user1.learnSkills).toContain('Node.js');
      expect(user2.teachSkills).toContain('Node.js');
      expect(user2.learnSkills).toContain('React');
    });

    it('should have proper skill arrays', async () => {
      expect(Array.isArray(user1.teachSkills)).toBe(true);
      expect(Array.isArray(user1.learnSkills)).toBe(true);
      expect(user1.teachSkills.length).toBeGreaterThan(0);
      expect(user1.learnSkills.length).toBeGreaterThan(0);
    });

    it('should return safe profile without password', () => {
      const profile = user1.safeProfile();
      expect(profile.password).toBeUndefined();
      expect(profile.email).toBe('alice@example.com');
      expect(profile.name).toBe('Alice');
    });
  });

  describe('Session Model Tests', () => {
    it('should create a session between two users', async () => {
      const session = new Session({
        userA: user1._id,
        userB: user2._id,
        skillFromA: 'React',
        skillFromB: 'Node.js',
        isActive: true
      });
      await session.save();

      expect(session.isActive).toBe(true);
      expect(session.userA.toString()).toBe(user1._id.toString());
      expect(session.userB.toString()).toBe(user2._id.toString());
    });

    it('should find active sessions for a user', async () => {
      const session = new Session({
        userA: user1._id,
        userB: user2._id,
        skillFromA: 'React',
        skillFromB: 'Node.js',
        isActive: true
      });
      await session.save();

      const activeSessions = await Session.find({
        $or: [{ userA: user1._id }, { userB: user1._id }],
        isActive: true
      });

      expect(activeSessions.length).toBe(1);
      expect(activeSessions[0].isActive).toBe(true);
    });
  });
});
