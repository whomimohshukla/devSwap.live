#!/bin/bash

# Quick HTTPS setup using ngrok for OAuth testing
# This script sets up ngrok to provide HTTPS tunnel to your EC2 backend

echo "🚀 Setting up HTTPS tunnel for OAuth compliance..."

# Step 1: Install ngrok on your EC2 server
echo "1. SSH into your EC2 server and run these commands:"
echo ""
echo "# Download and install ngrok"
echo "curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null"
echo "echo 'deb https://ngrok-agent.s3.amazonaws.com buster main' | sudo tee /etc/apt/sources.list.d/ngrok.list"
echo "sudo apt update && sudo apt install ngrok"
echo ""

# Step 2: Setup ngrok
echo "2. Sign up at https://ngrok.com and get your auth token"
echo "3. Configure ngrok with your token:"
echo "ngrok config add-authtoken YOUR_TOKEN_HERE"
echo ""

# Step 3: Start tunnel
echo "4. Start HTTPS tunnel to your backend:"
echo "ngrok http 5000"
echo ""

echo "5. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)"
echo "6. Update your Google OAuth settings with this new URL"
echo ""

# Environment variables to update
echo "📝 Update these environment variables on your EC2 server:"
echo "BACKEND_PUBLIC_URL=https://your-ngrok-url.ngrok.io"
echo "GOOGLE_REDIRECT_URI=https://your-ngrok-url.ngrok.io/api/auth/google/callback"
echo "FRONTEND_URL=https://dev-swap-live-mjhro8z3z-mimoh-shuklas-projects.vercel.app"
echo ""

echo "🔧 Google Cloud Console Updates:"
echo "1. Go to https://console.cloud.google.com/"
echo "2. Navigate to APIs & Services > Credentials"
echo "3. Edit your OAuth 2.0 Client ID"
echo "4. Update Authorized redirect URIs:"
echo "   - Add: https://your-ngrok-url.ngrok.io/api/auth/google/callback"
echo "   - Add: https://dev-swap-live-mjhro8z3z-mimoh-shuklas-projects.vercel.app/auth/callback"
echo ""

echo "✅ After setup, your OAuth will work with HTTPS!"
