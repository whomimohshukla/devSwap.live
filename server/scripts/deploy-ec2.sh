#!/bin/bash

# DevSwap.live EC2 Deployment Script
# This script sets up Docker and deploys the application on AWS EC2 Free Tier

set -e

echo "🚀 Starting DevSwap.live EC2 Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on EC2
if ! curl -s --max-time 3 http://169.254.169.254/latest/meta-data/instance-id > /dev/null; then
    print_warning "This script is designed for AWS EC2 instances"
fi

# Update system packages
print_status "Updating system packages..."
sudo yum update -y

# Install Docker
print_status "Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
print_status "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
print_status "Setting up application directory..."
sudo mkdir -p /opt/devswap
sudo chown ec2-user:ec2-user /opt/devswap
cd /opt/devswap

# Clone repository (if not already present)
if [ ! -d ".git" ]; then
    print_status "Cloning repository..."
    git clone https://github.com/your-username/DevSwap.live.git .
fi

# Navigate to server directory
cd server

# Copy environment file
if [ ! -f ".env" ]; then
    print_status "Setting up environment file..."
    cp .env.production.example .env
    print_warning "Please edit .env file with your actual configuration values"
    print_warning "Run: nano .env"
fi

# Create SSL directory for future HTTPS setup
mkdir -p ssl

# Build and start services
print_status "Building and starting Docker services..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Check service health
print_status "Checking service health..."
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    print_status "✅ DevSwap.live backend is running successfully!"
else
    print_error "❌ Backend health check failed"
    print_status "Checking logs..."
    docker-compose logs devswap-backend
fi

# Display service status
print_status "Service Status:"
docker-compose ps

# Display useful information
echo ""
print_status "🎉 Deployment Complete!"
echo ""
print_status "Access your application:"
echo "  - Backend API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000"
echo "  - Health Check: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000/api/health"
echo ""
print_status "Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Restart services: docker-compose restart"
echo "  - Stop services: docker-compose down"
echo "  - Update application: git pull && docker-compose up -d --build"
echo ""
print_warning "Remember to:"
echo "  1. Configure your .env file with actual values"
echo "  2. Set up your domain/DNS if needed"
echo "  3. Configure SSL certificates for HTTPS"
echo "  4. Set up monitoring and backups"

