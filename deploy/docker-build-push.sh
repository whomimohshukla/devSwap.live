#!/bin/bash

# DevSwap.live Docker Build and Push Script
# This script builds the Docker image and pushes it to Docker Hub securely

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOCKER_USERNAME=${DOCKER_USERNAME:-""}
DOCKER_REPO=${DOCKER_REPO:-"devswap-backend"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo -e "${GREEN}🚀 DevSwap.live Docker Build and Push${NC}"
echo "=================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "Dockerfile.prod" ]; then
    echo -e "${RED}❌ Dockerfile.prod not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Prompt for Docker Hub username if not set
if [ -z "$DOCKER_USERNAME" ]; then
    read -p "Enter your Docker Hub username: " DOCKER_USERNAME
fi

# Full image name
FULL_IMAGE_NAME="$DOCKER_USERNAME/$DOCKER_REPO"

echo -e "${YELLOW}📦 Building Docker image...${NC}"
echo "Image: $FULL_IMAGE_NAME:$IMAGE_TAG"
echo "Build Date: $BUILD_DATE"
echo "Git Commit: $GIT_COMMIT"

# Build the Docker image with labels for better tracking
docker build \
    -f Dockerfile.prod \
    -t "$FULL_IMAGE_NAME:$IMAGE_TAG" \
    -t "$FULL_IMAGE_NAME:$GIT_COMMIT" \
    --label "org.opencontainers.image.created=$BUILD_DATE" \
    --label "org.opencontainers.image.revision=$GIT_COMMIT" \
    --label "org.opencontainers.image.source=https://github.com/yourusername/devswap.live" \
    --label "org.opencontainers.image.title=DevSwap Backend" \
    --label "org.opencontainers.image.description=Skill-swapping platform backend API" \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully!${NC}"
else
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
fi

# Test the image locally
echo -e "${YELLOW}🧪 Testing Docker image locally...${NC}"
CONTAINER_ID=$(docker run -d -p 5001:5000 --name devswap-test "$FULL_IMAGE_NAME:$IMAGE_TAG")

# Wait a moment for the container to start
sleep 5

# Check if container is running
if docker ps | grep -q devswap-test; then
    echo -e "${GREEN}✅ Container is running successfully!${NC}"
    
    # Optional: Test health endpoint
    if command -v curl &> /dev/null; then
        echo "Testing health endpoint..."
        if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Health check passed!${NC}"
        else
            echo -e "${YELLOW}⚠️  Health check failed (this might be expected without full environment)${NC}"
        fi
    fi
    
    # Clean up test container
    docker stop devswap-test > /dev/null 2>&1
    docker rm devswap-test > /dev/null 2>&1
else
    echo -e "${RED}❌ Container failed to start!${NC}"
    docker logs devswap-test
    docker rm devswap-test > /dev/null 2>&1
    exit 1
fi

# Login to Docker Hub
echo -e "${YELLOW}🔐 Logging into Docker Hub...${NC}"
echo "Please enter your Docker Hub password:"
docker login -u "$DOCKER_USERNAME"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker Hub login failed!${NC}"
    exit 1
fi

# Push the image
echo -e "${YELLOW}📤 Pushing image to Docker Hub...${NC}"
docker push "$FULL_IMAGE_NAME:$IMAGE_TAG"
docker push "$FULL_IMAGE_NAME:$GIT_COMMIT"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Image pushed successfully!${NC}"
    echo ""
    echo "🎉 Deployment ready!"
    echo "Image: $FULL_IMAGE_NAME:$IMAGE_TAG"
    echo "Commit: $FULL_IMAGE_NAME:$GIT_COMMIT"
    echo ""
    echo "You can now deploy this image to AWS using:"
    echo "docker pull $FULL_IMAGE_NAME:$IMAGE_TAG"
else
    echo -e "${RED}❌ Failed to push image to Docker Hub!${NC}"
    exit 1
fi

# Clean up
docker logout

echo -e "${GREEN}🎯 Build and push completed successfully!${NC}"
