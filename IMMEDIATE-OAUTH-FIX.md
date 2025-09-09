# 🚨 IMMEDIATE OAuth Fix - 10 Minutes

## Problem
Google OAuth error: "Access blocked: Authorization Error" because your backend uses HTTP instead of HTTPS.

## 🎯 **Fastest Solution: Update Google OAuth Settings**

### Step 1: Update Google Cloud Console (2 minutes)
1. **Go to**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services > Credentials
3. **Find your OAuth 2.0 Client ID**: `761874996170-agi7j8ro58uovri9dt8mhbvadt9pj8bq.apps.googleusercontent.com`
4. **Click Edit** on your OAuth client
5. **In "Authorized redirect URIs"**, ADD these URLs:
   ```
   https://dev-swap-live-mjhro8z3z-mimoh-shuklas-projects.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```
6. **REMOVE** the problematic HTTP URL:
   ```
   http://13.200.253.11:5000/api/auth/google/callback
   ```
7. **Click Save**

### Step 2: Update Backend Environment (3 minutes)
SSH into your EC2 server and update these variables:

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@ec2-13-200-253-11.ap-south-1.compute.amazonaws.com

# Edit environment file
sudo nano /path/to/your/backend/.env

# Update these lines:
FRONTEND_URL=https://dev-swap-live-mjhro8z3z-mimoh-shuklas-projects.vercel.app
GOOGLE_REDIRECT_URI=https://dev-swap-live-mjhro8z3z-mimoh-shuklas-projects.vercel.app/auth/callback

# Restart your backend service
docker-compose restart
# OR
pm2 restart all
```

### Step 3: Update Frontend OAuth Flow (Already Done)
✅ Your frontend is already configured correctly on Vercel with HTTPS.

## 🔄 **Alternative: Disable OAuth Temporarily**

If you want to test core functionality without OAuth:

### Frontend: Hide OAuth Buttons
Create a quick patch to hide OAuth buttons and focus on email/password auth:

```typescript
// In your login/register components, temporarily hide OAuth buttons
const ENABLE_OAUTH = false; // Set to false temporarily

// In your JSX:
{ENABLE_OAUTH && (
  <button onClick={handleGoogleLogin}>
    Sign in with Google
  </button>
)}
```

### Test Core Features
1. **Visit**: https://dev-swap-live-mjhro8z3z-mimoh-shuklas-projects.vercel.app
2. **Register** with email/password
3. **Test** skill matching, sessions, etc.

## 🎯 **Recommended Next Steps**

### Option A: Quick Ngrok Setup (5 minutes)
```bash
# On your EC2 server:
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc
echo 'deb https://ngrok-agent.s3.amazonaws.com buster main' | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Get free account at ngrok.com, then:
ngrok config add-authtoken YOUR_TOKEN
ngrok http 5000

# Use the HTTPS URL for OAuth redirect
```

### Option B: Get SSL Certificate (30 minutes)
1. **Buy domain** (e.g., devswap.live)
2. **Point to EC2** IP address
3. **Install Let's Encrypt** SSL certificate
4. **Update OAuth** with HTTPS domain

## 🚀 **Current Status**
- ✅ Frontend: Deployed on Vercel (HTTPS)
- ✅ Backend: Running on EC2 (HTTP)
- ❌ OAuth: Blocked by HTTPS requirement
- 🔧 **Action Needed**: Choose Option A or B above

## 📞 **Need Help?**
The fastest solution is Option A (Ngrok) - it gives you HTTPS in 5 minutes for testing OAuth.
