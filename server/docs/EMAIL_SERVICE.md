# Email Service Documentation

## Overview

The DevSwap.live email service provides automated email functionality for user onboarding and security notifications. It uses Nodemailer with SMTP configuration to send beautifully designed HTML emails.

## Features

- **Welcome Emails**: Sent automatically when users register
- **Login Notifications**: Sent when users log in (security feature)
- **Test Email Functionality**: For testing email configuration
- **Email Configuration Verification**: Check if email service is properly configured

## Environment Configuration

Add the following environment variables to your `.env` file:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com                    # Your SMTP server host
SMTP_PORT=587                               # SMTP port (587 for TLS, 465 for SSL)
SMTP_USER=your-email@gmail.com              # SMTP username/email
SMTP_PASS=your-app-password                 # SMTP password/app password
FROM_EMAIL=noreply@devswap.live             # From email address (optional, defaults to SMTP_USER)
```

### Popular SMTP Providers

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password  # Generate at https://myaccount.google.com/apppasswords
```

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

## API Endpoints

All email endpoints require authentication and are prefixed with `/api/email`.

### Test Email
```http
POST /api/email/test
Content-Type: application/json
Authorization: Bearer <token>

{
  "to": "test@example.com"
}
```

### Check Email Configuration
```http
GET /api/email/config
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "configured": true,
    "verified": true,
    "status": "ready"
  }
}
```

### Resend Welcome Email (Admin)
```http
POST /api/email/welcome/resend
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "user-id",
  "email": "user@example.com",
  "name": "User Name"
}
```

### Send Login Notification (Admin)
```http
POST /api/email/login-notification
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "loginInfo": {
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Email Templates

### Welcome Email
- **Subject**: "Welcome to DevSwap.live, {name}! 🚀"
- **Features**: 
  - Professional HTML design with DevSwap branding
  - Overview of platform features
  - Call-to-action button to dashboard
  - Responsive design for mobile devices

### Login Notification Email
- **Subject**: "New login to your DevSwap.live account"
- **Features**:
  - Security-focused design
  - Login details (IP, browser, timestamp)
  - Security action buttons
  - Warning about unauthorized access

## Service Integration

### Automatic Email Sending

The email service is automatically integrated with:

1. **User Registration** (`auth.controller.ts`):
   - Welcome email sent after successful registration
   - Non-blocking operation (doesn't delay response)

2. **User Login** (`auth.controller.ts`):
   - Login notification sent after successful login
   - Includes IP address and browser information
   - Non-blocking operation

### Manual Email Operations

Use the email service directly in your code:

```typescript
import { emailService } from '../services/emailService';

// Send welcome email
await emailService.sendWelcomeEmail({
  name: 'John Doe',
  email: 'john@example.com',
  _id: 'user-id'
});

// Send login notification
await emailService.sendLoginNotification({
  name: 'John Doe',
  email: 'john@example.com',
  _id: 'user-id'
}, {
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  timestamp: new Date()
});

// Test email service
await emailService.sendTestEmail('test@example.com');

// Check configuration
const isConfigured = emailService.isEmailServiceConfigured();
const isVerified = await emailService.verifyEmailConfig();
```

## Error Handling

The email service includes comprehensive error handling:

- **Configuration Errors**: Service gracefully handles missing SMTP configuration
- **Send Failures**: Errors are logged but don't break the application flow
- **Non-blocking Operations**: Email sending doesn't delay user responses
- **Verification**: Built-in SMTP configuration verification

## Security Considerations

1. **Environment Variables**: Never commit SMTP credentials to version control
2. **App Passwords**: Use app-specific passwords for Gmail and similar providers
3. **Rate Limiting**: Email sending respects application rate limits
4. **Input Validation**: All email inputs are validated before sending
5. **Non-blocking**: Email operations don't expose internal errors to users

## Troubleshooting

### Common Issues

1. **"Email service not configured"**
   - Check that all required SMTP environment variables are set
   - Verify SMTP credentials are correct

2. **"Authentication failed"**
   - For Gmail: Enable 2FA and use App Password
   - For other providers: Check username/password combination

3. **"Connection timeout"**
   - Check SMTP host and port configuration
   - Verify firewall/network settings

4. **Emails not being received**
   - Check spam/junk folders
   - Verify FROM_EMAIL is properly configured
   - Test with different email providers

### Testing Email Configuration

1. Use the `/api/email/config` endpoint to verify configuration
2. Send a test email using `/api/email/test`
3. Check server logs for detailed error messages
4. Verify SMTP settings with your email provider

## Development vs Production

### Development
- Use a test email service like Mailtrap or Ethereal Email
- Set up Gmail with App Password for quick testing
- Enable detailed logging for debugging

### Production
- Use professional email service (SendGrid, Mailgun, SES)
- Configure proper FROM_EMAIL domain
- Monitor email delivery rates
- Set up email analytics and bounce handling

## Future Enhancements

Potential improvements for the email service:

1. **Email Templates**: Database-stored customizable templates
2. **Email Queue**: Background job processing for high-volume sending
3. **Analytics**: Email open rates, click tracking
4. **Personalization**: Dynamic content based on user preferences
5. **Multi-language**: Internationalization support
6. **Email Verification**: Double opt-in for user registration
