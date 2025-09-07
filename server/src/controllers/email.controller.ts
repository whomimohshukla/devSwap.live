// src/controllers/email.controller.ts
import { Request, Response } from 'express';
import { emailService } from '../services/emailService';

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Test email functionality
export async function testEmail(req: AuthenticatedRequest, res: Response) {
  try {
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    const success = await emailService.sendTestEmail(to);
    
    if (success) {
      res.json({
        success: true,
        message: 'Test email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email'
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Check email service configuration
export async function checkEmailConfig(req: AuthenticatedRequest, res: Response) {
  try {
    const isConfigured = emailService.isEmailServiceConfigured();
    const isVerified = await emailService.verifyEmailConfig();
    
    res.json({
      success: true,
      data: {
        configured: isConfigured,
        verified: isVerified,
        status: isConfigured && isVerified ? 'ready' : 'not_configured'
      }
    });
  } catch (error) {
    console.error('Email config check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check email configuration'
    });
  }
}

// Resend welcome email (admin only)
export async function resendWelcomeEmail(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId, email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    const success = await emailService.sendWelcomeEmail({
      name,
      email,
      _id: userId
    });
    
    if (success) {
      res.json({
        success: true,
        message: 'Welcome email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send welcome email'
      });
    }
  } catch (error) {
    console.error('Resend welcome email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Send custom login notification (admin only)
export async function sendLoginNotification(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId, email, name, loginInfo } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    const success = await emailService.sendLoginNotification({
      name,
      email,
      _id: userId
    }, loginInfo || {
      ip: req.ip || 'Unknown',
      userAgent: req.get('User-Agent') || 'Unknown',
      timestamp: new Date()
    });
    
    if (success) {
      res.json({
        success: true,
        message: 'Login notification sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send login notification'
      });
    }
  } catch (error) {
    console.error('Send login notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
