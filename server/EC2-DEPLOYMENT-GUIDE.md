# DevSwap.live EC2 Deployment Guide

## 🚀 Complete AWS EC2 Free Tier Deployment

This guide will help you deploy DevSwap.live on AWS EC2 Free Tier using Docker.

## Prerequisites

- AWS Account with EC2 Free Tier eligibility
- GitHub repository for your code
- Domain name (optional, but recommended)

## Step 1: Launch EC2 Instance

### 1.1 Create EC2 Instance
```bash
# Launch t2.micro instance (Free Tier eligible)
- AMI: Amazon Linux 2023
- Instance Type: t2.micro (1 vCPU, 1 GB RAM)
- Storage: 8 GB gp3 (Free Tier: up to 30 GB)
- Security Group: Create new with following rules:
```

### 1.2 Security Group Rules
```
Type            Protocol    Port Range    Source
SSH             TCP         22            Your IP
HTTP            TCP         80            0.0.0.0/0
HTTPS           TCP         443           0.0.0.0/0
Custom TCP      TCP         5000          0.0.0.0/0 (for API)
Custom TCP      TCP         3000          0.0.0.0/0 (for Frontend)
```

### 1.3 Key Pair
- Create new key pair or use existing
- Download `.pem` file and keep it secure

## Step 2: Connect to EC2 Instance

```bash
# Connect via SSH
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip

# Update system
sudo yum update -y
```

## Step 3: Run Deployment Script

```bash
# Clone your repository
git clone https://github.com/your-username/DevSwap.live.git
cd DevSwap.live/server

# Run the deployment script
./scripts/deploy-ec2.sh
```

## Step 4: Configure Environment

```bash
# Edit environment file
nano .env

# Update with your actual values:
MONGODB_URI=mongodb://admin:devswap123@mongodb:27017/devswap?authSource=admin
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secure-jwt-secret
OPENAI_API_KEY=your-openai-api-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CORS_ORIGIN=http://your-ec2-public-ip,https://your-domain.com
```

## Step 5: Start Services

```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## Step 6: Verify Deployment

```bash
# Health check
curl http://localhost:5000/api/health

# Test from outside
curl http://your-ec2-public-ip:5000/api/health
```

## Step 7: Set Up CI/CD (Optional)

### 7.1 GitHub Secrets
Add these secrets to your GitHub repository:

```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
EC2_HOST=your-ec2-public-ip
EC2_USER=ec2-user
EC2_PRIVATE_KEY=your-private-key-content
```

### 7.2 Auto-deployment
- Push to main branch triggers automatic deployment
- Tests run before deployment
- Health checks verify successful deployment

## Resource Usage (EC2 Free Tier)

```
Service         Memory Limit    CPU Limit
Backend         512MB          0.5 CPU
MongoDB         256MB          0.3 CPU
Redis           128MB          0.1 CPU
Nginx           64MB           0.1 CPU
Total           960MB          1.0 CPU
```

## Monitoring Commands

```bash
# Check resource usage
docker stats

# View service logs
docker-compose logs devswap-backend
docker-compose logs mongodb
docker-compose logs redis

# Restart services
docker-compose restart

# Update application
git pull
docker-compose up -d --build
```

## SSL/HTTPS Setup (Recommended)

### Using Let's Encrypt (Free)

```bash
# Install certbot
sudo yum install -y certbot

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Update nginx.conf for HTTPS
# Copy certificates to ./ssl/ directory
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/

# Restart nginx
docker-compose restart nginx
```

## Backup Strategy

```bash
# Create backup script
cat > backup.sh << 'BACKUP_EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec devswap-mongodb mongodump --out /tmp/backup_$DATE
docker cp devswap-mongodb:/tmp/backup_$DATE ./backups/
aws s3 cp ./backups/backup_$DATE s3://your-backup-bucket/ --recursive
BACKUP_EOF

chmod +x backup.sh

# Run daily backup (crontab)
crontab -e
# Add: 0 2 * * * /opt/devswap/server/backup.sh
```

## Troubleshooting

### Common Issues

1. **Out of Memory**
   ```bash
   # Check memory usage
   free -h
   # Restart services if needed
   docker-compose restart
   ```

2. **Port Already in Use**
   ```bash
   # Check what's using the port
   sudo netstat -tlnp | grep :5000
   # Kill process if needed
   sudo kill -9 PID
   ```

3. **Docker Service Won't Start**
   ```bash
   # Check Docker logs
   docker-compose logs service-name
   # Rebuild if needed
   docker-compose build --no-cache service-name
   ```

4. **Database Connection Issues**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   # Verify connection
   docker exec -it devswap-mongodb mongosh
   ```

## Performance Optimization

### For EC2 Free Tier

```bash
# Enable swap (helps with memory)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Cost Monitoring

- EC2 t2.micro: Free for 750 hours/month
- EBS Storage: Free for 30 GB/month
- Data Transfer: Free for 15 GB/month outbound

## Security Best Practices

1. **Regular Updates**
   ```bash
   sudo yum update -y
   docker-compose pull
   docker-compose up -d
   ```

2. **Firewall Rules**
   ```bash
   # Only allow necessary ports
   # Use security groups effectively
   # Consider using AWS WAF for additional protection
   ```

3. **Monitoring**
   ```bash
   # Set up CloudWatch alarms
   # Monitor resource usage
   # Set up log aggregation
   ```

## Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Check security group rules
4. Ensure EC2 instance has enough resources

## Next Steps

1. Set up domain and SSL
2. Configure monitoring and alerts
3. Set up automated backups
4. Consider using AWS RDS for MongoDB (when ready to scale)
5. Set up CloudFront CDN for better performance

---

🎉 **Your DevSwap.live application is now running on AWS EC2!**

Access your API at: `http://your-ec2-public-ip:5000`
