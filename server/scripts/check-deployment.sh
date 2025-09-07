#!/bin/bash

# DevSwap.live Deployment Status Checker
# This script checks all aspects of your deployment

echo "🚀 DevSwap.live Deployment Status Check"
echo "========================================"
echo "Timestamp: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo "1. 🐳 DOCKER STATUS"
echo "==================="

# Check Docker daemon
if systemctl is-active --quiet docker; then
    print_status 0 "Docker daemon is running"
else
    print_status 1 "Docker daemon is not running"
    echo "  Fix: sudo systemctl start docker"
fi

# Check Docker containers
echo ""
print_info "Docker Containers:"
sudo docker-compose ps

# Check container health
echo ""
print_info "Container Health Details:"
for container in devswap-backend devswap-mongodb devswap-redis; do
    if sudo docker ps --filter "name=$container" --filter "status=running" | grep -q $container; then
        health=$(sudo docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null || echo "no-health-check")
        if [ "$health" = "healthy" ] || [ "$health" = "no-health-check" ]; then
            print_status 0 "$container is running ($health)"
        else
            print_status 1 "$container is $health"
        fi
    else
        print_status 1 "$container is not running"
    fi
done

echo ""
echo "2. 🌐 API ENDPOINTS STATUS"
echo "=========================="

# Get EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || curl -s ifconfig.me 2>/dev/null || echo "unknown")
print_info "EC2 Public IP: $EC2_IP"

# Test local API
echo ""
print_info "Testing Local API (localhost:5000):"
if curl -s http://localhost:5000/api/health > /dev/null; then
    print_status 0 "Local API is responding"
    echo "  Health Status:"
    curl -s http://localhost:5000/api/health | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/health
else
    print_status 1 "Local API is not responding"
fi

# Test external API
echo ""
print_info "Testing External API ($EC2_IP:5000):"
if timeout 10 curl -s http://$EC2_IP:5000/api/health > /dev/null; then
    print_status 0 "External API is responding"
else
    print_status 1 "External API is not responding (check AWS Security Group)"
    print_warning "Add inbound rule: Custom TCP, Port 5000, Source 0.0.0.0/0"
fi

echo ""
echo "3. 🔧 SERVICES STATUS"
echo "==================="

# Check individual services
print_info "Database Connection:"
if sudo docker exec devswap-backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('✅ MongoDB connected');
  process.exit(0);
}).catch(err => {
  console.log('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});
" 2>/dev/null; then
    print_status 0 "MongoDB Atlas connection working"
else
    print_status 1 "MongoDB Atlas connection failed"
fi

print_info "Redis Connection:"
if sudo docker exec devswap-backend node -e "
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });
client.connect().then(() => {
  console.log('✅ Redis connected');
  client.disconnect();
  process.exit(0);
}).catch(err => {
  console.log('❌ Redis connection failed:', err.message);
  process.exit(1);
});
" 2>/dev/null; then
    print_status 0 "Redis Cloud connection working"
else
    print_status 1 "Redis Cloud connection failed"
fi

echo ""
echo "4. 📊 SYSTEM RESOURCES"
echo "======================"

# System resources
print_info "System Resources:"
echo "  CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "  Memory Usage: $(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')"
echo "  Disk Usage: $(df -h / | awk 'NR==2{printf "%s", $5}')"

# Docker resource usage
print_info "Docker Container Resources:"
sudo docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo ""
echo "5. 🔐 SECURITY & CONFIGURATION"
echo "=============================="

# Check environment variables
print_info "Environment Configuration:"
if [ -f .env ]; then
    print_status 0 ".env file exists"
    
    # Check critical env vars (without showing values)
    for var in AI_PROVIDER MONGODB_URI REDIS_URL JWT_SECRET; do
        if grep -q "^$var=" .env; then
            print_status 0 "$var is configured"
        else
            print_status 1 "$var is missing"
        fi
    done
else
    print_status 1 ".env file is missing"
fi

# Check AWS Security Group (if AWS CLI is available)
if command -v aws &> /dev/null; then
    print_info "AWS Security Group Check:"
    INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null)
    if [ ! -z "$INSTANCE_ID" ]; then
        SG_ID=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' --output text 2>/dev/null)
        if [ ! -z "$SG_ID" ] && [ "$SG_ID" != "None" ]; then
            print_status 0 "Security Group: $SG_ID"
            # Check if port 5000 is open
            if aws ec2 describe-security-groups --group-ids $SG_ID --query 'SecurityGroups[0].IpPermissions[?FromPort==`5000`]' --output text | grep -q "5000"; then
                print_status 0 "Port 5000 is open in Security Group"
            else
                print_status 1 "Port 5000 is not open in Security Group"
            fi
        fi
    fi
else
    print_warning "AWS CLI not installed - cannot check Security Group"
fi

echo ""
echo "6. 📝 LOGS & DEBUGGING"
echo "======================"

print_info "Recent Container Logs (last 10 lines):"
echo ""
echo "Backend Logs:"
sudo docker-compose logs --tail=10 devswap-backend

echo ""
echo "7. 🎯 QUICK FIXES"
echo "================="

print_info "Common Issues & Solutions:"
echo "  • External API not accessible:"
echo "    → Add AWS Security Group rule: Custom TCP, Port 5000, Source 0.0.0.0/0"
echo ""
echo "  • Containers not running:"
echo "    → sudo docker-compose up -d"
echo ""
echo "  • Health status 'degraded':"
echo "    → Add GEMINI_API_KEY to .env file"
echo "    → sudo docker-compose restart devswap-backend"
echo ""
echo "  • Database connection issues:"
echo "    → Check MONGODB_URI in .env"
echo "    → Verify MongoDB Atlas IP whitelist"
echo ""

echo ""
echo "8. 🔗 USEFUL LINKS"
echo "=================="

print_info "Access Your Application:"
echo "  • Local API: http://localhost:5000/api/health"
echo "  • External API: http://$EC2_IP:5000/api/health"
echo "  • Frontend: https://dev-swap-live.vercel.app"
echo "  • AWS Console: https://console.aws.amazon.com/ec2/"

echo ""
echo "✅ Deployment check complete!"
echo "Run this script anytime: ./scripts/check-deployment.sh"
