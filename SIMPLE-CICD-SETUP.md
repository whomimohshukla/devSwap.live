# Simple CI/CD Setup - Step by Step

## 🎯 **Ultra-Simple CI/CD Workflow Created**

I've created the simplest possible CI/CD workflow: `deploy.yml`

**What it does:**
- Triggers on push to `main` branch
- Connects to your EC2 server via SSH
- Pulls latest code
- Rebuilds and restarts Docker containers
- Tests the API health

## 🔧 **CRITICAL: Set Up GitHub Secrets**

**This is the ONLY step you need to complete for CI/CD to work:**

### Step 1: Go to GitHub Secrets
Open: `https://github.com/whomimohshukla/devSwap.live/settings/secrets/actions`

### Step 2: Add These 3 Secrets

#### Secret 1: EC2_HOST
- **Name:** `EC2_HOST`
- **Value:** Your EC2 public IP address (e.g., `3.110.123.45`)

To get your EC2 IP:
```bash
# SSH into your EC2 server first
ssh -i your-key.pem ubuntu@your-ec2-ip

# Then run this command on EC2:
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

#### Secret 2: EC2_USER
- **Name:** `EC2_USER`
- **Value:** `ubuntu`

#### Secret 3: EC2_SSH_KEY
- **Name:** `EC2_SSH_KEY`
- **Value:** Your complete private SSH key content

To get your SSH key:
```bash
# On your local machine (not EC2):
cat ~/.ssh/your-ec2-key.pem
```

Copy the ENTIRE output including:
```
-----BEGIN RSA PRIVATE KEY-----
[all the key content]
-----END RSA PRIVATE KEY-----
```

## 🚀 **Test Your CI/CD**

Once you've added the 3 secrets:

### Step 1: Make a Test Change
```bash
cd ~/Desktop/DevSwap.live
echo "# Testing CI/CD" >> README.md
git add .
git commit -m "test: trigger simple CI/CD"
git push origin main
```

### Step 2: Watch It Work
- Go to: `https://github.com/whomimohshukla/devSwap.live/actions`
- You should see "Deploy to EC2" workflow running
- Click on it to watch the progress

### Step 3: Verify Success
```bash
# Test your API (replace with your EC2 IP)
curl http://your-ec2-ip:5000/api/health
```

## 🔍 **If It Still Doesn't Work**

### Check 1: Verify Secrets Are Set
- Go to: `https://github.com/whomimohshukla/devSwap.live/settings/secrets/actions`
- You should see 3 secrets: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`

### Check 2: Test SSH Connection Manually
```bash
# On your local machine:
ssh -i your-key.pem ubuntu@your-ec2-ip "echo 'SSH works!'"
```

### Check 3: Check GitHub Actions Logs
- Go to: `https://github.com/whomimohshukla/devSwap.live/actions`
- Click on the failed workflow
- Read the error message

## 📋 **What's Different About This Workflow**

**Old workflows had:**
- Complex Docker builds in GitHub Actions
- Multiple jobs and dependencies
- Complicated error handling
- Path issues

**New workflow has:**
- Single job, single step
- Direct SSH to your server
- Simple commands that work
- No complex Docker builds in GitHub Actions

## ✅ **Success Indicators**

Your CI/CD is working when:
- ✅ GitHub Actions shows green checkmark
- ✅ No errors in the workflow logs
- ✅ Your API responds: `curl http://your-ec2-ip:5000/api/health`

## 🆘 **Still Having Issues?**

If it's still not working after setting the 3 secrets:

1. **Share the exact error message** from GitHub Actions
2. **Test SSH manually** with the command above
3. **Double-check your secrets** are exactly correct

This ultra-simple workflow should work with just the 3 GitHub secrets set correctly!
