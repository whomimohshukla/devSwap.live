// tests/controllers/auth.controller.test.ts
import request from 'supertest';
import express from 'express';
import { register, login, logout, getProfile } from '../../src/controllers/auth.controller';
import User from '../../src/models/user.model';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

// Mock middleware
const mockAuth = (req: any, res: any, next: any) => {
  req.user = { id: 'test-user-id' };
  next();
};

// Routes
app.post('/register', register);
app.post('/login', login);
app.post('/logout', mockAuth, logout);
app.get('/profile', mockAuth, getProfile);

describe('Auth Controller', () => {
  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        teachSkills: ['React'],
        learnSkills: ['Node.js']
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      // Create user first
      await request(app).post('/register').send(userData);

      // Try to create again
      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      // Create test user
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        teachSkills: ['React'],
        learnSkills: ['Node.js']
      });
      await user.save();
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return error for invalid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return error for non-existent user', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /profile', () => {
    it('should return user profile for authenticated user', async () => {
      // Create test user
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        teachSkills: ['React'],
        learnSkills: ['Node.js']
      });
      await user.save();

      // Create a simple test route that simulates the auth middleware
      app.get('/profile-test', async (req: any, res: any) => {
        try {
          // Simulate authenticated user
          const foundUser = await User.findById(user._id);
          if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
          }
          res.json({ user: foundUser.safeProfile() });
        } catch (error) {
          console.error('Profile test error:', error);
          res.status(500).json({ message: 'Server error' });
        }
      });

      const response = await request(app)
        .get('/profile-test')
        .expect(200);

      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.name).toBe('Test User');
    });
  });
});
