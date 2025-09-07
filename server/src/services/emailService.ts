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
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
          }
          
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          
          .logo {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 16px;
            text-decoration: none;
            color: white;
          }
          
          .logo::before {
            content: '🔄';
            font-size: 28px;
          }
          
          .welcome-title {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .welcome-subtitle {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 18px;
            margin-bottom: 24px;
            color: #374151;
          }
          
          .intro-text {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 32px;
            line-height: 1.7;
          }
          
          .features-section {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
            padding: 32px;
            margin: 32px 0;
            border: 1px solid #e2e8f0;
          }
          
          .features-title {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .features-grid {
            display: grid;
            gap: 16px;
          }
          
          .feature-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s ease;
          }
          
          .feature-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 12px;
            flex-shrink: 0;
            margin-top: 2px;
          }
          
          .feature-text {
            font-size: 15px;
            color: #374151;
            line-height: 1.5;
          }
          
          .cta-section {
            text-align: center;
            margin: 40px 0;
          }
          
          .cta-text {
            font-size: 18px;
            color: #374151;
            margin-bottom: 24px;
            font-weight: 500;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.39);
            transition: all 0.3s ease;
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px 0 rgba(102, 126, 234, 0.5);
          }
          
          .tips-section {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 20px;
            margin: 32px 0;
          }
          
          .tips-title {
            font-size: 16px;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .tips-text {
            font-size: 14px;
            color: #92400e;
            line-height: 1.6;
          }
          
          .footer {
            background: #f9fafb;
            padding: 32px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          
          .footer-text {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 16px;
          }
          
          .footer-signature {
            font-size: 16px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 8px;
          }
          
          .footer-team {
            font-size: 14px;
            color: #9ca3af;
          }
          
          .social-links {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            gap: 16px;
          }
          
          .social-link {
            display: inline-block;
            width: 40px;
            height: 40px;
            background: #e5e7eb;
            border-radius: 50%;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s ease;
          }
          
          .social-link:hover {
            background: #d1d5db;
          }
          
          @media (max-width: 600px) {
            .email-wrapper {
              margin: 10px;
              border-radius: 12px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .welcome-title {
              font-size: 24px;
            }
            
            .features-section {
              padding: 24px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="logo">DevSwap.live</div>
            <h1 class="welcome-title">Welcome to the Community!</h1>
            <p class="welcome-subtitle">Your journey to skill mastery begins now</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Hey ${user.name}! 👋
            </div>
            
            <div class="intro-text">
              We're absolutely thrilled to have you join our vibrant community of passionate developers, learners, and innovators! DevSwap.live is where knowledge meets opportunity, and skills transform into success.
            </div>
            
            <div class="features-section">
              <h3 class="features-title">🚀 What awaits you on DevSwap</h3>
              <div class="features-grid">
                <div class="feature-item">
                  <div class="feature-icon">🎯</div>
                  <div class="feature-text"><strong>Smart Matching:</strong> Connect with developers who complement your skills and learning goals</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">💻</div>
                  <div class="feature-text"><strong>Live Coding Sessions:</strong> Collaborate in real-time with video chat, screen sharing, and synchronized code editing</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">🤖</div>
                  <div class="feature-text"><strong>AI-Powered Learning:</strong> Get personalized lesson plans and learning paths tailored just for you</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">📈</div>
                  <div class="feature-text"><strong>Progress Tracking:</strong> Monitor your growth and build an impressive developer portfolio</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">🗺️</div>
                  <div class="feature-text"><strong>Learning Roadmaps:</strong> Follow expert-curated paths for mastering any technology stack</div>
                </div>
              </div>
            </div>
            
            <div class="tips-section">
              <div class="tips-title">
                💡 Pro Tip
              </div>
              <div class="tips-text">
                Complete your profile and add your skills to get better matches! The more detailed your profile, the more relevant connections you'll make.
              </div>
            </div>
            
            <div class="cta-section">
              <div class="cta-text">Ready to start swapping skills and accelerating your growth?</div>
              <a href="${frontendUrl}/dashboard" class="cta-button">Launch Your Journey →</a>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-signature">Happy coding & learning! 🎉</div>
            <div class="footer-team">The DevSwap.live Team</div>
            <div class="footer-text">
              Need help getting started? We're here for you! Reply to this email or check out our help center.
            </div>
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
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            padding: 20px;
            min-height: 100vh;
          }
          
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          
          .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          
          .logo {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 16px;
            text-decoration: none;
            color: white;
          }
          
          .logo::before {
            content: '🔄';
            font-size: 28px;
          }
          
          .security-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          
          .login-title {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .login-subtitle {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 18px;
            margin-bottom: 24px;
            color: #374151;
          }
          
          .intro-text {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 32px;
            line-height: 1.7;
          }
          
          .login-details {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            border: 1px solid #e2e8f0;
          }
          
          .details-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .info-grid {
            display: grid;
            gap: 16px;
          }
          
          .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .info-label {
            font-weight: 500;
            color: #374151;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .info-value {
            color: #6b7280;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
          }
          
          .security-notice {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #f59e0b;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            text-align: center;
          }
          
          .security-icon-notice {
            font-size: 32px;
            margin-bottom: 12px;
          }
          
          .security-title {
            font-size: 18px;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 12px;
          }
          
          .security-text {
            font-size: 15px;
            color: #92400e;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          
          .action-buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
          }
          
          .cta-button {
            display: inline-block;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            transition: all 0.3s ease;
            text-align: center;
            min-width: 140px;
          }
          
          .primary-button {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.39);
          }
          
          .primary-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px 0 rgba(239, 68, 68, 0.5);
          }
          
          .secondary-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.39);
          }
          
          .secondary-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px 0 rgba(102, 126, 234, 0.5);
          }
          
          .tips-section {
            background: #e0f2fe;
            border: 1px solid #0284c7;
            border-radius: 8px;
            padding: 20px;
            margin: 32px 0;
          }
          
          .tips-title {
            font-size: 16px;
            font-weight: 600;
            color: #0c4a6e;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .tips-text {
            font-size: 14px;
            color: #0c4a6e;
            line-height: 1.6;
          }
          
          .footer {
            background: #f9fafb;
            padding: 32px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          
          .footer-text {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 16px;
          }
          
          .footer-signature {
            font-size: 16px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 8px;
          }
          
          .footer-team {
            font-size: 14px;
            color: #9ca3af;
          }
          
          .footer-disclaimer {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 16px;
            font-style: italic;
          }
          
          @media (max-width: 600px) {
            .email-wrapper {
              margin: 10px;
              border-radius: 12px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .login-title {
              font-size: 24px;
            }
            
            .login-details {
              padding: 20px;
            }
            
            .action-buttons {
              flex-direction: column;
              align-items: center;
            }
            
            .cta-button {
              width: 100%;
              max-width: 280px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="logo">DevSwap.live</div>
            <div class="security-icon">🔐</div>
            <h1 class="login-title">New Login Detected</h1>
            <p class="login-subtitle">Security notification for your account</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Hi ${user.name}! 👋
            </div>
            
            <div class="intro-text">
              We detected a new login to your DevSwap.live account and wanted to make sure it was you. Your account security is our top priority.
            </div>
            
            <div class="login-details">
              <div class="details-title">
                📊 Login Details
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">
                    🕐 Time
                  </div>
                  <div class="info-value">${loginInfo.timestamp.toLocaleString('en-US', { 
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })}</div>
                </div>
                ${loginInfo.ip ? `
                <div class="info-item">
                  <div class="info-label">
                    🌐 IP Address
                  </div>
                  <div class="info-value">${loginInfo.ip}</div>
                </div>
                ` : ''}
                ${loginInfo.userAgent ? `
                <div class="info-item">
                  <div class="info-label">
                    💻 Device/Browser
                  </div>
                  <div class="info-value">${loginInfo.userAgent.length > 50 ? loginInfo.userAgent.substring(0, 50) + '...' : loginInfo.userAgent}</div>
                </div>
                ` : ''}
              </div>
            </div>
            
            <div class="security-notice">
              <div class="security-icon-notice">⚠️</div>
              <div class="security-title">Was this you?</div>
              <div class="security-text">
                If you recognize this login activity, you can safely ignore this email. However, if you don't recognize this login or suspect unauthorized access, please take immediate action to secure your account.
              </div>
              <div class="action-buttons">
                <a href="${frontendUrl}/account/security" class="cta-button primary-button">🔒 Secure Account</a>
                <a href="${frontendUrl}/dashboard" class="cta-button secondary-button">📊 Go to Dashboard</a>
              </div>
            </div>
            
            <div class="tips-section">
              <div class="tips-title">
                💡 Security Tips
              </div>
              <div class="tips-text">
                • Always log out from shared devices<br>
                • Use strong, unique passwords<br>
                • Enable two-factor authentication when available<br>
                • Regularly review your account activity
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-signature">Stay secure! 🛡️</div>
            <div class="footer-team">The DevSwap.live Security Team</div>
            <div class="footer-text">
              We're committed to keeping your account safe. If you have any security concerns, don't hesitate to contact us.
            </div>
            <div class="footer-disclaimer">
              This is an automated security notification. Please do not reply to this email.
            </div>
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
