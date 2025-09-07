# CI/CD Troubleshooting Guide for DevSwap.live Backend

## 🚨 Common Issues & Solutions

### Issue 1: GitHub Actions Not Triggering

**Symptoms:**
- No workflows appear in GitHub Actions
- Workflows don't run when you push code

**Solutions:**
1. **Check GitHub Secrets** (Most Common Issue)
   ```
   Go to: https://github.com/whomimohshukla/devSwap.live/settings/secrets/actions
   
   Required secrets:
   - EC2_HOST = your-ec2-public-ip (e.g., 3.110.123.45)
   - EC2_USER = ubuntu
   - EC2_SSH_KEY = your-private-key-content
   ```

2. **Get Your EC2 Details:**
   ```bash
   # SSH into your EC2 first
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Get public IP
   curl http://169.254.169.254/latest/meta-data/public-ipv4
   
   # Get private key content (on your local machine)
   cat ~/.ssh/your-ec2-key.pem
   ```

3. **Test SSH Connection:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip "echo 'SSH works!'"
   ```

### Issue 2: Workflow Fails During Deployment

**Check GitHub Actions Logs:**
1. Go to: https://github.com/whomimohshukla/devSwap.live/actions
2. Click on the failed workflow
3. Click on the failed job
4. Check the error messages

**Common Errors & Fixes:**

#### Error: "Permission denied (publickey)"
```bash
# Fix: Check your SSH key format
# The key should start with -----BEGIN RSA PRIVATE KEY-----
# and end with -----END RSA PRIVATE KEY-----

# Test locally:
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### Error: "docker: permission denied"
```bash
# Fix: On your EC2 server, run:
sudo usermod -aG docker ubuntu
sudo systemctl restart docker
newgrp docker
```

#### Error: "Project directory not found"
```bash
# Fix: Ensure your project is cloned on EC2
ssh -i your-key.pem ubuntu@your-ec2-ip
cd ~
git clone https://github.com/whomimohshukla/devSwap.live.git
cd devSwap.live/server
```

### Issue 3: Health Check Fails

**Symptoms:**
- Deployment completes but health check fails
- API not responding on localhost:5000

**Solutions:**
1. **Check Container Status:**
   ```bash
   # On EC2 server
   sudo docker-compose ps
   sudo docker-compose logs devswap-backend
   ```

2. **Check Environment Variables:**
   ```bash
   # On EC2 server
   cd ~/devSwap.live/server
   ls -la .env
   grep -E "^(AI_PROVIDER|MONGODB_URI|REDIS_URL)" .env
   ```

3. **Manual Container Restart:**
   ```bash
   # On EC2 server
   sudo docker-compose down
   sudo docker-compose up -d
   sleep 30
   curl http://localhost:5000/api/health
   ```

### Issue 4: External API Not Accessible

**Symptoms:**
- Local health check works on EC2
- External API call fails from internet

**Solution: Fix AWS Security Group**
1. Go to AWS Console → EC2 → Security Groups
2. Find your instance's security group
3. Add inbound rule:
   - Type: Custom TCP
   - Port: 5000
   - Source: 0.0.0.0/0 (Anywhere)
4. Save rules

## 🔧 Quick Fixes

### Fix 1: Reset Everything
```bash
# On your local machine
cd ~/Desktop/DevSwap.live
git add .
git commit -m "fix: trigger CI/CD"
git push origin main

# Then check: https://github.com/whomimohshukla/devSwap.live/actions
```

### Fix 2: Manual Deployment Test
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Navigate to project
cd ~/devSwap.live/server || cd ~/Desktop/DevSwap.live/server

# Manual deployment
git pull origin main
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d
sleep 30
curl http://localhost:5000/api/health
```

### Fix 3: Check Workflow Files
```bash
# On your local machine
cd ~/Desktop/DevSwap.live
ls -la .github/workflows/

# Should show:
# server-deploy.yml (new simple workflow)
# deploy-ec2.yml (your original)
# backend-deploy.yml (alternative)
```

## 🚀 Test Your CI/CD

### Step 1: Verify Secrets
Go to: https://github.com/whomimohshukla/devSwap.live/settings/secrets/actions

### Step 2: Trigger Workflow
```bash
# Make a small change
echo "# Test CI/CD" >> README.md
git add .
git commit -m "test: trigger CI/CD pipeline"
git push origin main
```

### Step 3: Monitor Progress
- GitHub Actions: https://github.com/whomimohshukla/devSwap.live/actions
- Watch the "Server Deploy to EC2" workflow

### Step 4: Verify Success
```bash
# Check your API
curl http://your-ec2-ip:5000/api/health

# Should return JSON with status
```

## 📋 Debugging Commands

### On Your Local Machine:
```bash
# Check repository status
git status
git remote -v

# Check workflow files
ls -la .github/workflows/
cat .github/workflows/server-deploy.yml
```

### On Your EC2 Server:
```bash
# Check Docker
sudo systemctl status docker
sudo docker ps -a
sudo docker-compose ps

# Check project
cd ~/devSwap.live/server
git status
git log -1

# Check API
curl http://localhost:5000/api/health
curl http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000/api/health
```

## ✅ Success Indicators

Your CI/CD is working when:
- ✅ GitHub Actions shows green checkmark
- ✅ Workflow completes without errors
- ✅ Health check returns `{"status":"healthy"}` or similar
- ✅ External API accessible: `http://your-ec2-ip:5000/api/health`

## 🆘 Still Not Working?

If you're still having issues:

1. **Share the error message** from GitHub Actions
2. **Check these logs:**
   ```bash
   # On EC2
   sudo docker-compose logs --tail=100 devswap-backend
   ```
3. **Verify your secrets** are correctly set in GitHub
4. **Test SSH connection** manually

The new `server-deploy.yml` workflow is designed to be simple and robust. It should work with minimal configuration!
