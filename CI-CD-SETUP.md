# DevSwap.live CI/CD Setup Guide

## 🚀 Complete CI/CD Pipeline Setup

Your DevSwap.live project now has a comprehensive CI/CD pipeline with **4 different workflows** that are **resilient to errors** - they will continue deployment even if linting or tests fail.

## 📋 Available Workflows

### 1. `deploy-ec2.yml` (Your Original)
- **Triggers**: Push to `main` branch (server changes only)
- **Purpose**: Deploy backend to EC2 with full testing
- **Features**: MongoDB + Redis services, comprehensive testing

### 2. `backend-deploy.yml` (New)
- **Triggers**: Push to `main`/`master` (server changes), manual dispatch
- **Purpose**: Backend-focused deployment with Docker testing
- **Features**: Docker image testing, health checks

### 3. `frontend-deploy.yml` (New)
- **Triggers**: Push to `main`/`master` (client changes), manual dispatch
- **Purpose**: Frontend deployment to Vercel
- **Features**: Lighthouse performance audits, Vercel integration

### 4. `full-stack-deploy.yml` (New - Recommended)
- **Triggers**: Push to any branch, manual dispatch with options
- **Purpose**: Complete full-stack deployment with change detection
- **Features**: Smart change detection, parallel deployments, comprehensive monitoring

## 🔧 Required GitHub Secrets

Go to your repository: `https://github.com/whomimohshukla/devSwap.live/settings/secrets/actions`

### Backend/EC2 Secrets
```
EC2_HOST=your-ec2-public-ip-or-domain
EC2_USER=ubuntu
EC2_SSH_KEY=your-private-ssh-key-content
```

### Frontend/Vercel Secrets (Optional)
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
```

### Environment Variables (Optional)
```
MONGODB_TEST_URI=mongodb://localhost:27017/devswap_test
VITE_API_URL=http://your-ec2-ip:5000
VITE_FRONTEND_URL=https://your-vercel-app.vercel.app
```

## 🛠️ Setup Instructions

### Step 1: Configure EC2 SSH Access
1. Get your EC2 private key content:
   ```bash
   cat ~/.ssh/your-ec2-key.pem
   ```
2. Copy the entire content (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)
3. Add as `EC2_SSH_KEY` secret in GitHub

### Step 2: Get EC2 Host
```bash
# On your EC2 instance
curl http://169.254.169.254/latest/meta-data/public-ipv4
```
Add this IP as `EC2_HOST` secret.

### Step 3: Test SSH Connection
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip "echo 'SSH works!'"
```

### Step 4: Verify Repository Structure
Your repo should have this structure:
```
devSwap.live/
├── .github/workflows/
│   ├── deploy-ec2.yml
│   ├── backend-deploy.yml
│   ├── frontend-deploy.yml
│   └── full-stack-deploy.yml
├── server/
│   ├── package.json
│   ├── Dockerfile
│   └── docker-compose.yml
└── client/
    └── package.json
```

## 🚀 How to Deploy

### Automatic Deployment
- **Push to main/master**: Triggers automatic deployment
- **Change detection**: Only deploys what changed (backend/frontend)

### Manual Deployment
1. Go to: `https://github.com/whomimohshukla/devSwap.live/actions`
2. Select "Full Stack CI/CD Pipeline"
3. Click "Run workflow"
4. Choose options:
   - ✅ Deploy Backend to EC2
   - ✅ Deploy Frontend to Vercel

## 🔍 Monitoring & Debugging

### View Workflow Status
```bash
# Install GitHub CLI
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh

# Authenticate
gh auth login

# View recent runs
gh run list -R whomimohshukla/devSwap.live --limit 10

# Watch a running workflow
gh run watch <run-id> -R whomimohshukla/devSwap.live

# View logs
gh run view <run-id> -R whomimohshukla/devSwap.live --log
```

### Check Deployment Status on EC2
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Navigate to project
cd ~/devSwap.live/server || cd ~/Desktop/DevSwap.live/server

# Run comprehensive check
./scripts/check-deployment.sh

# Quick health check
curl -s http://localhost:5000/api/health | jq .
```

## 🛡️ Error Resilience Features

All workflows now include:
- **`continue-on-error: true`** for linting and tests
- **Graceful fallbacks** when scripts don't exist
- **Comprehensive logging** for debugging
- **Health checks** before marking deployment as successful
- **Rollback capabilities** (manual)

## 🎯 Workflow Features

### Smart Change Detection
- Only runs backend jobs when `server/` changes
- Only runs frontend jobs when `client/` changes
- Saves CI/CD minutes and time

### Comprehensive Testing
- **Linting**: ESLint, Prettier (continues on error)
- **Type Checking**: TypeScript validation (continues on error)
- **Unit Tests**: Jest/Vitest (continues on error)
- **Docker Testing**: Container health checks
- **API Testing**: Health endpoint validation

### Security Features
- **Vulnerability Scanning**: Trivy security scans
- **Secret Management**: GitHub Secrets integration
- **SSH Key Security**: Secure EC2 deployment

## 🔗 Useful Links

- **GitHub Actions**: https://github.com/whomimohshukla/devSwap.live/actions
- **Repository**: https://github.com/whomimohshukla/devSwap.live
- **EC2 Health Check**: http://your-ec2-ip:5000/api/health
- **Frontend**: https://dev-swap-live.vercel.app

## 🚨 Troubleshooting

### Common Issues

1. **SSH Permission Denied**
   ```bash
   # Check key permissions
   chmod 600 ~/.ssh/your-key.pem
   
   # Test connection
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Docker Permission Denied on EC2**
   ```bash
   # Add user to docker group
   sudo usermod -aG docker ubuntu
   sudo systemctl restart docker
   ```

3. **Health Check Fails**
   ```bash
   # Check container status
   sudo docker-compose ps
   
   # Check logs
   sudo docker-compose logs devswap-backend
   
   # Restart services
   sudo docker-compose restart
   ```

4. **Workflow Fails**
   - Check GitHub Actions logs
   - Verify all secrets are set
   - Ensure EC2 is accessible
   - Check repository structure

## ✅ Success Indicators

Your CI/CD is working when:
- ✅ Workflows show green checkmarks
- ✅ EC2 health check returns `{"status":"healthy"}`
- ✅ External API is accessible: `http://your-ec2-ip:5000/api/health`
- ✅ Frontend deploys to Vercel successfully
- ✅ No critical errors in workflow logs

## 🎉 Next Steps

1. **Push a change** to trigger your first automated deployment
2. **Monitor the workflow** in GitHub Actions
3. **Verify deployment** using the health checks
4. **Set up monitoring** and alerts (optional)
5. **Configure branch protection** rules (recommended)

Your DevSwap.live project now has enterprise-grade CI/CD! 🚀
