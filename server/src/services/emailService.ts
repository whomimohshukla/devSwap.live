// src/services/emailService.ts
import nodemailer from 'nodemailer';
import { envConfig } from '../config/env.config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface User {
  name: string;
  email: string;
  _id?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      // Check if email configuration is available
      if (!envConfig.SMTP_HOST || !envConfig.SMTP_USER || !envConfig.SMTP_PASS) {
        console.warn('Email service not configured - missing SMTP credentials');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: envConfig.SMTP_HOST,
        port: envConfig.SMTP_PORT || 587,
        secure: envConfig.SMTP_PORT === 465, // true for 465, false for other ports
        auth: {
          user: envConfig.SMTP_USER,
          pass: envConfig.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates for development
        },
      });

      this.isConfigured = true;
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  private async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('Email service not configured - skipping email send');
      return false;
    }

    try {
      const mailOptions = {
        from: envConfig.FROM_EMAIL || envConfig.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  private getWelcomeEmailTemplate(user: User): string {
    const frontendUrl = envConfig.FRONTEND_URL || 'http://localhost:3000';
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to DevSwap.live</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
          }
          .welcome-title {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .features {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .feature-item {
            margin: 10px 0;
            padding-left: 20px;
            position: relative;
          }
          .feature-item:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
          }
          .cta-button {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">DevSwap.live</div>
            <h1 class="welcome-title">Welcome to DevSwap, ${user.name}! 🎉</h1>
          </div>
          
          <div class="content">
            <p>We're thrilled to have you join our community of passionate developers and learners!</p>
            
            <p>DevSwap.live is your platform for skill-swapping and peer learning. Connect with fellow developers, share your expertise, and learn new technologies through interactive sessions.</p>
            
            <div class="features">
              <h3>What you can do on DevSwap:</h3>
              <div class="feature-item">Find learning partners based on your skills and interests</div>
              <div class="feature-item">Join real-time coding sessions with video chat</div>
              <div class="feature-item">Get AI-powered lesson plans tailored to your learning goals</div>
              <div class="feature-item">Track your learning progress and build your developer network</div>
              <div class="feature-item">Access curated learning roadmaps for various technologies</div>
            </div>
            
            <p>Ready to start your learning journey?</p>
            
            <a href="${frontendUrl}/dashboard" class="cta-button">Explore DevSwap →</a>
          </div>
          
          <div class="footer">
            <p>Happy learning!<br>The DevSwap.live Team</p>
            <p>If you have any questions, feel free to reach out to us.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getLoginNotificationTemplate(user: User, loginInfo: { ip?: string; userAgent?: string; timestamp: Date }): string {
    const frontendUrl = envConfig.FRONTEND_URL || 'http://localhost:3000';
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Login to DevSwap.live</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
          }
          .login-title {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .login-info {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .info-row {
            margin: 8px 0;
            display: flex;
            justify-content: space-between;
          }
          .info-label {
            font-weight: 500;
            color: #374151;
          }
          .info-value {
            color: #6b7280;
          }
          .security-notice {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .cta-button {
            display: inline-block;
            background: #dc2626;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 10px 5px;
          }
          .secondary-button {
            background: #6b7280;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">DevSwap.live</div>
            <h1 class="login-title">New Login Detected 🔐</h1>
          </div>
          
          <div class="content">
            <p>Hi ${user.name},</p>
            
            <p>We detected a new login to your DevSwap.live account. Here are the details:</p>
            
            <div class="login-info">
              <div class="info-row">
                <span class="info-label">Time:</span>
                <span class="info-value">${loginInfo.timestamp.toLocaleString()}</span>
              </div>
              ${loginInfo.ip ? `
              <div class="info-row">
                <span class="info-label">IP Address:</span>
                <span class="info-value">${loginInfo.ip}</span>
              </div>
              ` : ''}
              ${loginInfo.userAgent ? `
              <div class="info-row">
                <span class="info-label">Device/Browser:</span>
                <span class="info-value">${loginInfo.userAgent}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="security-notice">
              <strong>Was this you?</strong> If you recognize this login, you can ignore this email. If you don't recognize this activity, please secure your account immediately.
            </div>
            
            <div style="text-align: center;">
              <a href="${frontendUrl}/account/security" class="cta-button">Secure My Account</a>
              <a href="${frontendUrl}/dashboard" class="cta-button secondary-button">Go to Dashboard</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Stay secure!<br>The DevSwap.live Team</p>
            <p>This is an automated security notification.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(user: User): Promise<boolean> {
    const subject = `Welcome to DevSwap.live, ${user.name}! 🚀`;
    const html = this.getWelcomeEmailTemplate(user);

    return await this.sendEmail({
      to: user.email,
      subject,
      html,
    });
  }

  async sendLoginNotification(user: User, loginInfo: { ip?: string; userAgent?: string; timestamp?: Date }): Promise<boolean> {
    const subject = `New login to your DevSwap.live account`;
    const html = this.getLoginNotificationTemplate(user, {
      ...loginInfo,
      timestamp: loginInfo.timestamp || new Date(),
    });

    return await this.sendEmail({
      to: user.email,
      subject,
      html,
    });
  }

  // Test email functionality
  async sendTestEmail(to: string): Promise<boolean> {
    const subject = 'DevSwap.live Email Service Test';
    const html = `
      <h2>Email Service Test</h2>
      <p>This is a test email from DevSwap.live email service.</p>
      <p>If you received this, the email service is working correctly!</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
    `;

    return await this.sendEmail({
      to,
      subject,
      html,
    });
  }

  // Check if email service is properly configured
  isEmailServiceConfigured(): boolean {
    return this.isConfigured;
  }

  // Verify email configuration
  async verifyEmailConfig(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('Email configuration verified successfully');
      return true;
    } catch (error) {
      console.error('Email configuration verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
