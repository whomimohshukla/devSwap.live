#!/bin/bash

# Quick DevSwap.live Status Check Commands
echo "🚀 DevSwap.live Quick Status Check"
echo "=================================="

# Navigate to correct directory
cd ~/devSwap.live/server 2>/dev/null || cd ~/Desktop/DevSwap.live/server 2>/dev/null || {
    echo "❌ Cannot find DevSwap.live server directory"
    echo "Try: cd ~/devSwap.live/server || cd ~/Desktop/DevSwap.live/server"
    exit 1
}

echo "📍 Current directory: $(pwd)"
echo ""

# 1. Docker Status
echo "1. 🐳 DOCKER STATUS"
echo "==================="
echo "Docker service status:"
sudo systemctl status docker --no-pager -l

echo ""
echo "Docker containers:"
sudo docker ps -a

echo ""
echo "Docker Compose services:"
sudo docker-compose ps

echo ""

# 2. API Health Check
echo "2. 🌐 API HEALTH CHECK"
echo "======================"
echo "Local API test:"
curl -s http://localhost:5000/api/health | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/health

echo ""
echo "External IP:"
curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || curl -s ifconfig.me

echo ""

# 3. Container Logs
echo "3. 📝 RECENT LOGS"
echo "================="
echo "Backend container logs (last 20 lines):"
sudo docker-compose logs --tail=20 devswap-backend

echo ""

# 4. System Resources
echo "4. 📊 SYSTEM RESOURCES"
echo "======================"
echo "Memory usage:"
free -h

echo ""
echo "Disk usage:"
df -h

echo ""
echo "Docker container stats:"
sudo docker stats --no-stream

echo ""

# 5. Environment Check
echo "5. 🔧 ENVIRONMENT CHECK"
echo "======================="
if [ -f .env ]; then
    echo "✅ .env file exists"
    echo "Key environment variables (values hidden):"
    grep -E "^(AI_PROVIDER|MONGODB_URI|REDIS_URL|JWT_SECRET|GEMINI_API_KEY)" .env | sed 's/=.*/=***HIDDEN***/'
else
    echo "❌ .env file missing"
fi

echo ""
echo "✅ Quick check complete!"
