#!/bin/bash

echo "🚀 PERMANENT OAUTH FIX FOR DEVSWAP.LIVE"
echo "========================================"

# Step 1: Update .env file with correct OAuth settings
echo "📝 Step 1: Updating .env file..."

# Navigate to server directory
cd /home/whomimohshukla/Desktop/DevSwap.live/server

# Backup existing .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Update .env with correct OAuth settings
echo "Updating environment variables..."

# Remove old problematic entries
sed -i '/^FRONTEND_URL=/d' .env
sed -i '/^GOOGLE_REDIRECT_URI=/d' .env
sed -i '/^BACKEND_PUBLIC_URL=/d' .env

# Add correct entries
echo "" >> .env
echo "# OAuth Configuration - Updated $(date)" >> .env
echo "FRONTEND_URL=https://dev-swap-live.vercel.app" >> .env
echo "GOOGLE_REDIRECT_URI=https://dev-swap-live.vercel.app/auth/callback" >> .env
echo "BACKEND_PUBLIC_URL=https://dev-swap-live.vercel.app" >> .env

echo "✅ Environment variables updated!"

# Step 2: Stop existing Docker container
echo "📦 Step 2: Stopping existing Docker containers..."
docker stop $(docker ps -q --filter ancestor=devswap-backend) 2>/dev/null || echo "No running containers found"

# Step 3: Rebuild Docker image to ensure changes take effect
echo "🔨 Step 3: Rebuilding Docker image..."
docker build -t devswap-backend .

# Step 4: Start Docker container with updated environment
echo "🚀 Step 4: Starting Docker container with updated environment..."
docker run -d --name devswap-backend-prod --env-file .env -p 5000:5000 devswap-backend

# Step 5: Verify the container is running
echo "🔍 Step 5: Verifying container status..."
sleep 5
docker ps | grep devswap-backend

# Step 6: Test the API
echo "🧪 Step 6: Testing API health..."
sleep 10
curl -s http://localhost:5000/api/health | jq . || echo "API not responding yet, please wait a moment"

echo ""
echo "✅ DOCKER CONTAINER UPDATED!"
echo "📋 Next steps:"
echo "1. Update Google Cloud Console with these URLs:"
echo "   - https://dev-swap-live.vercel.app/auth/callback"
echo "   - http://localhost:3000/auth/callback"
echo ""
echo "2. Remove these URLs from Google Console:"
echo "   - http://13.200.253.11:5000/api/auth/google/callback"
echo "   - Any other HTTP backend URLs"
echo ""
echo "3. Test OAuth at: https://dev-swap-live.vercel.app"
echo ""
echo "🔧 If you need to check logs:"
echo "docker logs devswap-backend-prod"
echo ""
echo "🔧 If you need to restart:"
echo "docker restart devswap-backend-prod"
