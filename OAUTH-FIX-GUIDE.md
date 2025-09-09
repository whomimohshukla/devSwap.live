# Google OAuth HTTPS Compliance Fix

## Problem
Google OAuth is rejecting authentication because the redirect URI uses HTTP instead of HTTPS:
- Current: `http://13.200.253.11:5000/api/auth/google/callback`
- Required: `https://your-domain.com/api/auth/google/callback`

## Root Cause
Google's OAuth 2.0 policy requires HTTPS for production applications to ensure security.

## Solutions

### Option 1: Use HTTPS with SSL Certificate (Recommended)
1. **Get SSL Certificate** for your domain
2. **Configure NGINX** as reverse proxy with SSL
3. **Update environment variables** to use HTTPS URLs
4. **Update Google OAuth settings** in Google Cloud Console

### Option 2: Use Cloudflare or Similar Service
1. **Point domain to Cloudflare**
2. **Enable SSL/TLS encryption**
3. **Configure origin server** (your EC2)
4. **Update OAuth redirect URIs**

### Option 3: Temporary Development Fix
For development/testing only - disable OAuth temporarily and use email/password authentication.

## Implementation Steps

### Step 1: Update Backend Environment Variables
```bash
# On your EC2 server, update these variables:
BACKEND_PUBLIC_URL=https://your-domain.com
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
FRONTEND_URL=https://dev-swap-live-mjhro8z3z-mimoh-shuklas-projects.vercel.app
```

### Step 2: Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Update Authorized redirect URIs:
   - Remove: `http://13.200.253.11:5000/api/auth/google/callback`
   - Add: `https://your-domain.com/api/auth/google/callback`

### Step 3: SSL Certificate Setup (NGINX)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Quick Fix for Testing
If you want to test without OAuth temporarily, you can:
1. Use email/password registration/login
2. Disable OAuth buttons in frontend
3. Focus on core functionality first

## Current Status
- ✅ Frontend deployed to Vercel (HTTPS)
- ✅ Backend running on EC2 (HTTP)
- ❌ OAuth requires HTTPS backend
- 🔄 Need SSL certificate or domain setup

## Next Steps
1. Choose a solution approach
2. Set up SSL/domain if going with Option 1 or 2
3. Update environment variables
4. Update Google OAuth settings
5. Test OAuth flow
