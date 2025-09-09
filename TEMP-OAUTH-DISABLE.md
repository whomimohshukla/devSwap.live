# Temporary OAuth Disable for Testing

## Quick Fix to Test Frontend-Backend Connectivity

Since Google OAuth requires HTTPS and your backend is currently on HTTP, let's temporarily disable OAuth to test the core functionality.

### Backend Changes (On EC2 Server)

1. **Update environment variables** on your EC2 server:
```bash
# SSH into your EC2 server and update .env
sudo nano /path/to/your/backend/.env

# Add/update these lines:
FRONTEND_URL=https://dev-swap-live-mjhro8z3z-mimoh-shuklas-projects.vercel.app
BACKEND_PUBLIC_URL=http://ec2-13-200-253-11.ap-south-1.compute.amazonaws.com
```

2. **Restart your backend service** on EC2:
```bash
# If using Docker
docker-compose restart

# If using PM2
pm2 restart all

# If using systemd
sudo systemctl restart your-app-name
```

### Frontend Changes (Already Done)

✅ Frontend is already configured to connect to your backend:
- API URL: `http://ec2-13-200-253-11.ap-south-1.compute.amazonaws.com/api`
- Deployed on Vercel: `https://dev-swap-live-mjhro8z3z-mimoh-shuklas-projects.vercel.app`

### Test Steps

1. **Visit your deployed frontend**: https://dev-swap-live-mjhro8z3z-mimoh-shuklas-projects.vercel.app
2. **Try email/password registration** (skip OAuth buttons)
3. **Test core features** like:
   - User registration
   - Login
   - Profile management
   - Skill matching
   - Session creation

### CORS Configuration

Your backend needs to allow requests from Vercel. Update CORS settings to include:
```javascript
// In your backend CORS config
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://dev-swap-live-mjhro8z3z-mimoh-shuklas-projects.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true
};
```

## OAuth Fix Options (Choose One)

### Option A: Get a Domain + SSL (Recommended)
1. Buy a domain (e.g., devswap.live)
2. Point it to your EC2 server
3. Set up SSL certificate (Let's Encrypt)
4. Update OAuth redirect URIs

### Option B: Use Cloudflare
1. Add your domain to Cloudflare
2. Point DNS to your EC2 IP
3. Enable SSL in Cloudflare
4. Update OAuth settings

### Option C: Continue Without OAuth
Focus on email/password authentication for now and add OAuth later when you have HTTPS.

## Current Status
- ✅ Frontend deployed and configured
- ✅ Backend running on EC2
- ⚠️ OAuth blocked by HTTPS requirement
- 🔄 Need to test core functionality first
