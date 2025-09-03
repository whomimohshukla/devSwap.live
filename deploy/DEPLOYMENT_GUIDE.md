# DevSwap.live AWS EC2 Deployment Guide

This guide walks you through deploying DevSwap.live backend to AWS EC2 Free Tier with Docker and secure credential management.

## 🎯 Overview

- **Platform**: AWS EC2 t2.micro (Free Tier eligible)
- **Containerization**: Docker + Docker Compose
- **Database**: MongoDB + Redis (containerized)
- **Security**: Environment variables, secure secrets management
- **Cost**: Free tier eligible for 12 months

## 📋 Prerequisites

1. **AWS Account** with free tier available
2. **AWS CLI** installed and configured
3. **Docker Hub Account** for image hosting
4. **Domain name** (optional, can use IP address)

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Environment

```bash
# Navigate to your project
cd /path/to/DevSwap.live

# Make scripts executable
chmod +x deploy/*.sh

# Set up secure environment variables
./deploy/setup-secrets.sh
```

### Step 2: Build and Push Docker Image

```bash
# Build and push to Docker Hub
./deploy/docker-build-push.sh
```

**What this does:**
- Builds optimized production Docker image
- Tests the image locally
- Pushes to Docker Hub with proper tags
- Uses multi-stage build for smaller image size

### Step 3: Deploy to AWS EC2

```bash
# Deploy to EC2 Free Tier
./deploy/ec2-deploy.sh
```

**What this creates:**
- EC2 t2.micro instance (Free Tier)
- Security group with proper ports (22, 80, 443, 5000)
- Key pair for SSH access
- Auto-configured Docker environment
- MongoDB and Redis containers
- Health checks and monitoring

### Step 4: Configure Your Application

After deployment, SSH into your instance:

```bash
# SSH into your EC2 instance (replace with your IP)
ssh -i devswap-keypair.pem ec2-user@YOUR_EC2_IP

# Navigate to application directory
cd /home/ec2-user/devswap

# Copy your production environment
# (Upload your .env.production file or edit .env manually)
nano .env

# Update docker-compose.yml with your Docker image
nano docker-compose.yml
# Change: image: DOCKER_IMAGE_PLACEHOLDER
# To: image: yourusername/devswap-backend:latest

# Deploy the application
./deploy.sh
```

### Step 5: Verify Deployment

```bash
# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f

# Test health endpoint
curl http://localhost:5000/api/health

# Check from outside
curl http://YOUR_EC2_IP:5000/api/health
```

## 🔒 Security Best Practices

### Environment Variables

✅ **DO:**
- Use strong, unique secrets for each environment
- Store sensitive data in environment variables
- Use `.env.production` for production secrets
- Set proper file permissions (`chmod 600 .env`)

❌ **DON'T:**
- Commit `.env` files to version control
- Use default or weak secrets
- Share secrets in plain text
- Use development secrets in production

### AWS Security

✅ **DO:**
- Use IAM roles with minimal permissions
- Enable CloudTrail for audit logging
- Set up billing alerts
- Regularly update your instances
- Use security groups instead of NACLs when possible

❌ **DON'T:**
- Use root AWS account for daily operations
- Leave unused ports open
- Skip security updates
- Use overly permissive security groups

## 🛠️ Management Commands

### Update Deployment

```bash
# Update with new Docker image
./update-deployment.sh yourusername/devswap-backend:v1.2.0
```

### Monitor Application

```bash
# SSH into instance
ssh -i devswap-keypair.pem ec2-user@YOUR_EC2_IP

# View real-time logs
cd devswap && docker-compose logs -f

# Check resource usage
docker stats

# Check disk usage
df -h
```

### Backup Data

```bash
# Backup MongoDB
docker exec devswap-mongodb mongodump --out /data/backup

# Backup Redis
docker exec devswap-redis redis-cli BGSAVE
```

### Scale Services

```bash
# Scale application (if needed)
docker-compose up -d --scale devswap-backend=2
```

## 🌐 Domain Setup (Optional)

### Using a Custom Domain

1. **Purchase a domain** from Route 53 or external provider
2. **Create A record** pointing to your EC2 IP
3. **Update environment variables**:
   ```bash
   FRONTEND_URL=https://yourdomain.com
   CORS_ORIGIN=https://yourdomain.com
   ```

### SSL Certificate (Recommended)

```bash
# Install Certbot
sudo yum install -y certbot

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx configuration (if using reverse proxy)
```

## 📊 Monitoring & Logging

### CloudWatch Integration

```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
```

### Application Monitoring

```bash
# Check application health
curl http://YOUR_EC2_IP:5000/api/health

# Monitor Docker containers
docker-compose ps
docker stats --no-stream
```

## 💰 Cost Optimization

### Free Tier Limits

- **EC2**: 750 hours/month of t2.micro
- **EBS**: 30 GB of storage
- **Data Transfer**: 15 GB outbound

### Cost Monitoring

1. Set up **billing alerts** in AWS Console
2. Monitor usage in **AWS Cost Explorer**
3. Use **AWS Budgets** for cost control

## 🔧 Troubleshooting

### Common Issues

**Application won't start:**
```bash
# Check logs
docker-compose logs devswap-backend

# Check environment variables
docker-compose exec devswap-backend env | grep -E "(MONGODB|REDIS|JWT)"
```

**Database connection issues:**
```bash
# Check MongoDB
docker-compose exec mongodb mongo --eval "db.adminCommand('ismaster')"

# Check Redis
docker-compose exec redis redis-cli ping
```

**Port access issues:**
```bash
# Check security group
aws ec2 describe-security-groups --group-names devswap-sg

# Test port connectivity
telnet YOUR_EC2_IP 5000
```

### Performance Issues

```bash
# Check resource usage
top
free -h
df -h

# Check Docker resources
docker system df
docker system prune  # Clean up unused resources
```

## 📚 Additional Resources

- [AWS EC2 Free Tier](https://aws.amazon.com/free/)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)
- [MongoDB Atlas Free Tier](https://www.mongodb.com/cloud/atlas/pricing)
- [Redis Cloud Free Tier](https://redis.com/redis-enterprise-cloud/pricing/)

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Check AWS security groups and network settings
4. Review the troubleshooting section above

---

**🎉 Congratulations!** Your DevSwap.live backend is now running securely on AWS EC2 Free Tier!
