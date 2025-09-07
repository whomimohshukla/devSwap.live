#!/bin/bash

# DevSwap.live CI/CD Diagnostic Script
echo "🔍 DevSwap.live CI/CD Diagnostic Check"
echo "======================================"
echo "Timestamp: $(date)"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "1. 📁 REPOSITORY STRUCTURE CHECK"
echo "================================"

# Check if we're in the right directory
if [ -d ".github/workflows" ]; then
    print_status 0 "GitHub workflows directory exists"
    
    print_info "Workflow files found:"
    ls -la .github/workflows/
    
    # Check specific workflow
    if [ -f ".github/workflows/server-deploy.yml" ]; then
        print_status 0 "server-deploy.yml exists"
    else
        print_status 1 "server-deploy.yml missing"
    fi
else
    print_status 1 "Not in repository root or .github/workflows missing"
    echo "Current directory: $(pwd)"
    echo "Please run this from: ~/Desktop/DevSwap.live/"
    exit 1
fi

echo ""
echo "2. 🔑 GITHUB REPOSITORY CHECK"
echo "============================="

# Check git configuration
if git rev-parse --git-dir > /dev/null 2>&1; then
    print_status 0 "Git repository detected"
    
    print_info "Git remotes:"
    git remote -v
    
    print_info "Current branch:"
    git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD
    
    print_info "Last commit:"
    git log -1 --oneline
    
    # Check if there are uncommitted changes
    if git diff-index --quiet HEAD --; then
        print_status 0 "Working directory is clean"
    else
        print_warning "Working directory has uncommitted changes"
        git status --porcelain
    fi
else
    print_status 1 "Not a git repository"
fi

echo ""
echo "3. 🚀 GITHUB ACTIONS REQUIREMENTS"
echo "================================="

print_info "Required GitHub Secrets (check manually):"
echo "  Go to: https://github.com/whomimohshukla/devSwap.live/settings/secrets/actions"
echo ""
echo "  Required secrets:"
echo "  - EC2_HOST (your EC2 public IP)"
echo "  - EC2_USER (usually 'ubuntu')"
echo "  - EC2_SSH_KEY (your private SSH key content)"
echo ""

print_info "GitHub Actions page:"
echo "  https://github.com/whomimohshukla/devSwap.live/actions"

echo ""
echo "4. 🔧 SERVER DIRECTORY CHECK"
echo "============================"

if [ -d "server" ]; then
    print_status 0 "Server directory exists"
    
    # Check important files
    if [ -f "server/Dockerfile" ]; then
        print_status 0 "Dockerfile exists"
    else
        print_status 1 "Dockerfile missing"
    fi
    
    if [ -f "server/docker-compose.yml" ]; then
        print_status 0 "docker-compose.yml exists"
    else
        print_status 1 "docker-compose.yml missing"
    fi
    
    if [ -f "server/package.json" ]; then
        print_status 0 "package.json exists"
    else
        print_status 1 "package.json missing"
    fi
    
    if [ -f "server/.env" ]; then
        print_status 0 ".env file exists"
    else
        print_status 1 ".env file missing"
    fi
else
    print_status 1 "Server directory missing"
fi

echo ""
echo "5. 🌐 CONNECTIVITY TEST"
echo "======================="

print_info "Testing GitHub connectivity:"
if curl -s https://api.github.com/repos/whomimohshukla/devSwap.live > /dev/null; then
    print_status 0 "GitHub repository is accessible"
else
    print_status 1 "Cannot access GitHub repository"
fi

echo ""
echo "6. 📋 WORKFLOW CONTENT CHECK"
echo "============================"

if [ -f ".github/workflows/server-deploy.yml" ]; then
    print_info "server-deploy.yml content preview:"
    echo "---"
    head -20 .github/workflows/server-deploy.yml
    echo "---"
    
    # Check for common issues
    if grep -q "EC2_HOST" .github/workflows/server-deploy.yml; then
        print_status 0 "Workflow references EC2_HOST secret"
    else
        print_status 1 "Workflow doesn't reference EC2_HOST secret"
    fi
    
    if grep -q "appleboy/ssh-action" .github/workflows/server-deploy.yml; then
        print_status 0 "Workflow uses SSH action"
    else
        print_status 1 "Workflow doesn't use SSH action"
    fi
fi

echo ""
echo "7. 🎯 QUICK FIXES"
echo "================="

print_info "Most common CI/CD issues and fixes:"
echo ""
echo "Issue 1: Missing GitHub Secrets"
echo "  → Go to: https://github.com/whomimohshukla/devSwap.live/settings/secrets/actions"
echo "  → Add EC2_HOST, EC2_USER, EC2_SSH_KEY"
echo ""
echo "Issue 2: Workflow not triggering"
echo "  → Make sure you push to 'main' or 'master' branch"
echo "  → Make sure changes are in 'server/' directory"
echo ""
echo "Issue 3: SSH connection fails"
echo "  → Test: ssh -i your-key.pem ubuntu@your-ec2-ip"
echo "  → Check EC2 security group allows SSH (port 22)"
echo ""
echo "Issue 4: Workflow file syntax error"
echo "  → Check YAML syntax in .github/workflows/server-deploy.yml"
echo ""

echo ""
echo "8. 🚀 TEST COMMANDS"
echo "=================="

print_info "To test your CI/CD pipeline:"
echo ""
echo "1. Ensure GitHub secrets are set"
echo "2. Make a small change:"
echo "   echo '# Test CI/CD' >> README.md"
echo "   git add ."
echo "   git commit -m 'test: trigger CI/CD'"
echo "   git push origin main"
echo ""
echo "3. Check GitHub Actions:"
echo "   https://github.com/whomimohshukla/devSwap.live/actions"
echo ""
echo "4. If it fails, check the logs in GitHub Actions"

echo ""
echo "✅ Diagnostic complete!"
echo ""
print_warning "Next steps:"
echo "1. Check GitHub Secrets (most common issue)"
echo "2. Push a test commit to trigger workflow"
echo "3. Monitor GitHub Actions page for results"
echo "4. If still failing, share the error message from GitHub Actions"
