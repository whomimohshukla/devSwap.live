#!/bin/bash

# DevSwap.live Secure Environment Setup Script
# This script helps you securely configure environment variables

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 DevSwap.live Secure Environment Setup${NC}"
echo "========================================"

# Function to generate secure random string
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Function to prompt for input with default
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        export $var_name="${input:-$default}"
    else
        read -p "$prompt: " input
        export $var_name="$input"
    fi
}

# Function to prompt for sensitive input (hidden)
prompt_secret() {
    local prompt="$1"
    local var_name="$2"
    
    echo -n "$prompt: "
    read -s input
    echo
    export $var_name="$input"
}

echo -e "${YELLOW}📝 Let's configure your environment variables securely...${NC}"
echo ""

# Basic Configuration
echo -e "${BLUE}🌐 Basic Configuration${NC}"
prompt_with_default "Frontend URL (where your React app will be hosted)" "http://localhost:3000" "FRONTEND_URL"
prompt_with_default "Application port" "5000" "PORT"

# Database Configuration
echo ""
echo -e "${BLUE}🗄️  Database Configuration${NC}"
echo "For production, consider using MongoDB Atlas (free tier available)"
prompt_with_default "MongoDB URI" "mongodb://devswap:CHANGE_THIS_PASSWORD@localhost:27017/devswap" "MONGODB_URI"
prompt_with_default "Redis URL" "redis://localhost:6379" "REDIS_URL"

# Security Configuration
echo ""
echo -e "${BLUE}🔒 Security Configuration${NC}"
echo "Generating secure random secrets..."

JWT_SECRET=$(generate_secret)
COOKIE_SECRET=$(generate_secret)

echo "✅ JWT Secret generated"
echo "✅ Cookie Secret generated"

# OpenAI Configuration
echo ""
echo -e "${BLUE}🤖 OpenAI Configuration${NC}"
echo "You can get your API key from: https://platform.openai.com/api-keys"
prompt_secret "OpenAI API Key" "OPENAI_API_KEY"
prompt_with_default "OpenAI Organization ID (optional)" "" "OPENAI_ORG"
prompt_with_default "OpenAI Project ID (optional)" "" "OPENAI_PROJECT"

# Email Configuration (optional)
echo ""
echo -e "${BLUE}📧 Email Configuration (Optional - for notifications)${NC}"
prompt_with_default "SMTP Host (e.g., smtp.gmail.com)" "smtp.gmail.com" "SMTP_HOST"
prompt_with_default "SMTP Port" "587" "SMTP_PORT"
prompt_with_default "SMTP Username" "" "SMTP_USER"
if [ -n "$SMTP_USER" ]; then
    prompt_secret "SMTP Password (App Password for Gmail)" "SMTP_PASS"
    prompt_with_default "From Email Address" "noreply@devswap.live" "FROM_EMAIL"
fi

# WebRTC Configuration (optional)
echo ""
echo -e "${BLUE}🎥 WebRTC Configuration (Optional - for video calls)${NC}"
echo "For production, consider using a TURN server service like Twilio or Xirsys"
prompt_with_default "TURN Server URL" "" "TURN_SERVER_URL"
if [ -n "$TURN_SERVER_URL" ]; then
    prompt_with_default "TURN Username" "" "TURN_USERNAME"
    prompt_secret "TURN Credential" "TURN_CREDENTIAL"
fi

# Create production environment file
echo ""
echo -e "${YELLOW}📄 Creating production environment file...${NC}"

cat > .env.production << EOF
# DevSwap.live Production Environment
# Generated on $(date)

# Server Configuration
NODE_ENV=production
PORT=${PORT}
FRONTEND_URL=${FRONTEND_URL}
CORS_ORIGIN=${FRONTEND_URL}
CORS_CREDENTIALS=true

# Database Configuration
MONGODB_URI=${MONGODB_URI}
REDIS_URL=${REDIS_URL}
REDIS_PASSWORD=
REDIS_DB=0
DISABLE_REDIS=false

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# OpenAI Configuration
OPENAI_API_KEY=${OPENAI_API_KEY}
OPENAI_ORG=${OPENAI_ORG}
OPENAI_PROJECT=${OPENAI_PROJECT}

# Security
COOKIE_SECRET=${COOKIE_SECRET}
BCRYPT_ROUNDS=12
HELMET_ENABLED=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
STRICT_RATE_LIMIT_MAX=10

# Session Configuration
SESSION_TIMEOUT_MINUTES=60
MAX_CONCURRENT_SESSIONS=5

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif

# Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true

# WebRTC Configuration
STUN_SERVER_URL=stun:stun.l.google.com:19302
EOF

# Add optional configurations if provided
if [ -n "$SMTP_USER" ]; then
cat >> .env.production << EOF

# Email Configuration
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
FROM_EMAIL=${FROM_EMAIL}
EOF
fi

if [ -n "$TURN_SERVER_URL" ]; then
cat >> .env.production << EOF

# TURN Server Configuration
TURN_SERVER_URL=${TURN_SERVER_URL}
TURN_USERNAME=${TURN_USERNAME}
TURN_CREDENTIAL=${TURN_CREDENTIAL}
EOF
fi

cat >> .env.production << EOF

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_MATCHING=true
AI_DISABLE=false
EOF

# Set secure permissions
chmod 600 .env.production

echo ""
echo -e "${GREEN}✅ Production environment file created: .env.production${NC}"
echo ""
echo -e "${YELLOW}📋 Security Recommendations:${NC}"
echo "1. Never commit .env.production to version control"
echo "2. Use different secrets for each environment (dev, staging, prod)"
echo "3. Rotate secrets regularly"
echo "4. Consider using AWS Secrets Manager for production"
echo "5. Monitor your OpenAI API usage and set billing limits"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Copy .env.production to your EC2 instance as .env"
echo "2. Update MongoDB and Redis URLs if using external services"
echo "3. Test your configuration before going live"
echo ""
echo -e "${GREEN}🎯 Environment setup completed!${NC}"
