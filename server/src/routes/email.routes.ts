// src/routes/email.routes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  testEmail,
  checkEmailConfig,
  resendWelcomeEmail,
  sendLoginNotification
} from '../controllers/email.controller';

const router = Router();

// All email routes require authentication
router.use(requireAuth);

// Test email functionality
router.post('/test', testEmail);

// Check email service configuration
router.get('/config', checkEmailConfig);

// Resend welcome email (admin functionality)
router.post('/welcome/resend', resendWelcomeEmail);

// Send login notification (admin functionality)
router.post('/login-notification', sendLoginNotification);

export default router;
