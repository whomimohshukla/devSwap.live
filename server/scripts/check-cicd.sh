#!/bin/bash

# DevSwap.live CI/CD Status Checker
# Repository: https://github.com/whomimohshukla/devSwap.live

echo "🔄 DevSwap.live CI/CD Status Check"
echo "=================================="
echo "Repository: whomimohshukla/devSwap.live"
echo "Timestamp: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo "1. 📁 REPOSITORY STATUS"
echo "======================"

# Check if we're in a git repository
if git rev-parse --git-dir > /dev/null 2>&1; then
    print_status 0 "Git repository detected"
    
    # Show remote information
    print_info "Git remotes:"
    git remote -v
    
    # Show current branch
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD)
    echo "  Current branch: $CURRENT_BRANCH"
    
    # Show last few commits
    print_info "Recent commits:"
    git log --oneline -5
    
    # Check if there are uncommitted changes
    if git diff-index --quiet HEAD --; then
        print_status 0 "Working directory is clean"
    else
        print_warning "Working directory has uncommitted changes"
        git status --porcelain
    fi
else
    print_status 1 "Not in a git repository"
    echo "  Navigate to: cd ~/Desktop/DevSwap.live/server"
fi

echo ""
echo "2. 🚀 GITHUB ACTIONS STATUS"
echo "==========================="

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    print_status 0 "GitHub CLI is available"
    
    # Check authentication
    if gh auth status &> /dev/null; then
        print_status 0 "GitHub CLI is authenticated"
        
        print_info "Recent workflow runs:"
        gh run list -R whomimohshukla/devSwap.live --limit 10
        
        print_info "Workflow files:"
        gh workflow list -R whomimohshukla/devSwap.live
        
        # Get the latest run status
        LATEST_RUN=$(gh run list -R whomimohshukla/devSwap.live --limit 1 --json status,conclusion,workflowName,createdAt --jq '.[0]')
        if [ ! -z "$LATEST_RUN" ]; then
            STATUS=$(echo "$LATEST_RUN" | jq -r '.status')
            CONCLUSION=$(echo "$LATEST_RUN" | jq -r '.conclusion')
            WORKFLOW=$(echo "$LATEST_RUN" | jq -r '.workflowName')
            
            print_info "Latest run: $WORKFLOW"
            if [ "$STATUS" = "completed" ] && [ "$CONCLUSION" = "success" ]; then
                print_status 0 "Latest workflow run succeeded"
            elif [ "$STATUS" = "in_progress" ]; then
                print_warning "Workflow is currently running"
            else
                print_status 1 "Latest workflow run failed or was cancelled"
            fi
        fi
        
    else
        print_status 1 "GitHub CLI not authenticated"
        echo "  Run: gh auth login"
    fi
else
    print_status 1 "GitHub CLI not installed"
    echo "  Install: curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
    echo "           echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main\" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null"
    echo "           sudo apt update && sudo apt install gh"
fi

echo ""
echo "3. 🔍 WORKFLOW FILES CHECK"
echo "========================="

# Check for workflow files
WORKFLOW_DIR=".github/workflows"
if [ -d "$WORKFLOW_DIR" ]; then
    print_status 0 "Workflow directory exists"
    
    print_info "Workflow files found:"
    find "$WORKFLOW_DIR" -name "*.yml" -o -name "*.yaml" | while read -r file; do
        echo "  📄 $file"
        # Show workflow name and triggers
        if command -v yq &> /dev/null; then
            NAME=$(yq eval '.name' "$file" 2>/dev/null || echo "Unknown")
            TRIGGERS=$(yq eval '.on | keys | join(", ")' "$file" 2>/dev/null || echo "Unknown")
            echo "      Name: $NAME"
            echo "      Triggers: $TRIGGERS"
        fi
    done
else
    print_status 1 "No .github/workflows directory found"
    echo "  This means no GitHub Actions are configured"
fi

echo ""
echo "4. 🏗️ BUILD & DEPLOYMENT STATUS"
echo "==============================="

# Check if Docker images exist locally
print_info "Local Docker images:"
sudo docker images | grep -E "(devswap|devSwap)" || echo "  No DevSwap images found locally"

# Check if containers are running
print_info "Running containers:"
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check last build time
if [ -f "Dockerfile" ]; then
    print_status 0 "Dockerfile exists"
    DOCKERFILE_MODIFIED=$(stat -c %Y Dockerfile 2>/dev/null || echo "0")
    DOCKERFILE_DATE=$(date -d "@$DOCKERFILE_MODIFIED" 2>/dev/null || echo "Unknown")
    echo "  Last modified: $DOCKERFILE_DATE"
else
    print_status 1 "Dockerfile not found"
fi

echo ""
echo "5. 🌐 DEPLOYMENT VERIFICATION"
echo "============================="

# Test local API
print_info "Testing local deployment:"
if curl -s http://localhost:5000/api/health > /dev/null; then
    print_status 0 "Local API is responding"
    HEALTH_STATUS=$(curl -s http://localhost:5000/api/health | jq -r '.status' 2>/dev/null || echo "unknown")
    echo "  Health status: $HEALTH_STATUS"
else
    print_status 1 "Local API is not responding"
fi

# Test external API
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || curl -s ifconfig.me 2>/dev/null || echo "unknown")
print_info "Testing external deployment (IP: $EC2_IP):"
if timeout 10 curl -s http://$EC2_IP:5000/api/health > /dev/null 2>&1; then
    print_status 0 "External API is responding"
else
    print_status 1 "External API is not responding"
    print_warning "Check AWS Security Group rules for port 5000"
fi

echo ""
echo "6. 📊 QUICK ACTIONS"
echo "=================="

print_info "Useful CI/CD commands:"
echo "  • View latest workflow run details:"
echo "    gh run view \$(gh run list -R whomimohshukla/devSwap.live --limit 1 --json databaseId --jq '.[0].databaseId') -R whomimohshukla/devSwap.live"
echo ""
echo "  • Watch a running workflow:"
echo "    gh run watch \$(gh run list -R whomimohshukla/devSwap.live --limit 1 --json databaseId --jq '.[0].databaseId') -R whomimohshukla/devSwap.live"
echo ""
echo "  • Trigger manual workflow (if configured):"
echo "    gh workflow run <workflow-name> -R whomimohshukla/devSwap.live"
echo ""
echo "  • Re-run failed workflow:"
echo "    gh run rerun \$(gh run list -R whomimohshukla/devSwap.live --limit 1 --json databaseId --jq '.[0].databaseId') -R whomimohshukla/devSwap.live"
echo ""
echo "  • View workflow logs:"
echo "    gh run view \$(gh run list -R whomimohshukla/devSwap.live --limit 1 --json databaseId --jq '.[0].databaseId') -R whomimohshukla/devSwap.live --log"

echo ""
echo "7. 🔗 USEFUL LINKS"
echo "=================="

print_info "GitHub Actions Dashboard:"
echo "  https://github.com/whomimohshukla/devSwap.live/actions"
echo ""
print_info "Repository:"
echo "  https://github.com/whomimohshukla/devSwap.live"
echo ""
print_info "Local API Health:"
echo "  http://localhost:5000/api/health"
echo ""
print_info "External API Health:"
echo "  http://$EC2_IP:5000/api/health"

echo ""
echo "✅ CI/CD check complete!"
echo "Run this script anytime: ./scripts/check-cicd.sh"
