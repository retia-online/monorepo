#!/bin/bash

# GitHub Packages Setup Script
# This script helps set up GitHub Packages infrastructure and authentication

set -e

echo "🚀 GitHub Packages Setup Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    echo "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "git is not installed. Please install git first."
        exit 1
    fi
    
    print_status "All prerequisites are installed"
}

# Check if GitHub CLI is available
check_gh_cli() {
    if command -v gh &> /dev/null; then
        print_status "GitHub CLI is available"
        return 0
    else
        print_warning "GitHub CLI is not installed. Some features will be limited."
        return 1
    fi
}

# Setup .npmrc file
setup_npmrc() {
    echo ""
    echo "Setting up .npmrc configuration..."
    
    if [ -f ".npmrc" ]; then
        print_warning ".npmrc already exists. Creating backup..."
        cp .npmrc .npmrc.backup
    fi
    
    if [ -f ".npmrc.template" ]; then
        cp .npmrc.template .npmrc
        print_status ".npmrc created from template"
        print_warning "Please edit .npmrc and replace YOUR_GITHUB_TOKEN with your actual token"
    else
        print_error ".npmrc.template not found. Creating basic .npmrc..."
        cat > .npmrc << EOF
@megamercado:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
EOF
        print_status "Basic .npmrc created"
        print_warning "Please edit .npmrc and replace YOUR_GITHUB_TOKEN with your actual token"
    fi
    
    # Add .npmrc to .gitignore if not already there
    if ! grep -q "\.npmrc" .gitignore 2>/dev/null; then
        echo ".npmrc" >> .gitignore
        print_status "Added .npmrc to .gitignore"
    fi
}

# Validate GitHub token
validate_token() {
    echo ""
    echo "Validating GitHub token..."
    
    if [ -z "$GITHUB_TOKEN" ]; then
        print_warning "GITHUB_TOKEN environment variable not set"
        read -p "Enter your GitHub token (or press Enter to skip): " token
        if [ -n "$token" ]; then
            export GITHUB_TOKEN="$token"
        else
            print_warning "Skipping token validation"
            return 0
        fi
    fi
    
    # Test token with GitHub API
    if curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user > /dev/null; then
        print_status "GitHub token is valid"
    else
        print_error "GitHub token validation failed"
        print_info "Please check your token permissions:"
        print_info "- read:packages"
        print_info "- write:packages"
        print_info "- repo (if using private repositories)"
    fi
}

# Create package directories
create_package_structure() {
    echo ""
    echo "Creating package directory structure..."
    
    packages=("auth" "api" "ui" "configs")
    
    for package in "${packages[@]}"; do
        if [ ! -d "packages/$package" ]; then
            mkdir -p "packages/$package/src"
            print_status "Created packages/$package directory"
        else
            print_warning "packages/$package already exists"
        fi
    done
}

# Setup GitHub Actions workflow
setup_github_actions() {
    echo ""
    echo "Setting up GitHub Actions workflow..."
    
    if [ ! -d ".github/workflows" ]; then
        mkdir -p .github/workflows
        print_status "Created .github/workflows directory"
    fi
    
    if [ -f ".github/workflows/publish-packages.yml" ]; then
        print_status "GitHub Actions workflow already exists"
    else
        print_error "GitHub Actions workflow not found. Please ensure publish-packages.yml exists."
    fi
}

# Test npm authentication
test_npm_auth() {
    echo ""
    echo "Testing npm authentication..."
    
    if npm whoami --registry=https://npm.pkg.github.com &> /dev/null; then
        username=$(npm whoami --registry=https://npm.pkg.github.com)
        print_status "Authenticated as: $username"
    else
        print_error "npm authentication failed"
        print_info "Try running: npm login --scope=@megamercado --registry=https://npm.pkg.github.com"
    fi
}

# Generate repository secrets documentation
generate_secrets_doc() {
    echo ""
    echo "Generating repository secrets documentation..."
    
    cat > REPOSITORY_SECRETS.md << EOF
# Repository Secrets Configuration

## Required Secrets

Add these secrets to your GitHub repository:

### GitHub Actions Secrets
1. Go to Repository Settings → Secrets and variables → Actions
2. Add the following secrets:

#### GITHUB_TOKEN
- **Value**: Automatically provided by GitHub Actions
- **Permissions**: packages:write, contents:read
- **Usage**: Publishing packages to GitHub Packages

#### NPM_TOKEN (Optional)
- **Value**: Your Personal Access Token
- **Permissions**: read:packages, write:packages
- **Usage**: Alternative authentication method

## Personal Access Token Setup

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes:
   - \`read:packages\`
   - \`write:packages\`
   - \`repo\` (if using private repositories)

## Environment Variables

For local development, set these environment variables:

\`\`\`bash
export GITHUB_TOKEN="your_token_here"
export NPM_REGISTRY="https://npm.pkg.github.com"
\`\`\`

## Verification

Test your setup:

\`\`\`bash
# Test authentication
npm whoami --registry=https://npm.pkg.github.com

# Test package access
npm view @megamercado/auth --registry=https://npm.pkg.github.com
\`\`\`
EOF
    
    print_status "Created REPOSITORY_SECRETS.md"
}

# Main execution
main() {
    echo "Starting GitHub Packages setup..."
    echo ""
    
    check_prerequisites
    check_gh_cli
    setup_npmrc
    validate_token
    create_package_structure
    setup_github_actions
    test_npm_auth
    generate_secrets_doc
    
    echo ""
    echo "🎉 GitHub Packages setup completed!"
    echo ""
    print_info "Next steps:"
    print_info "1. Edit .npmrc with your GitHub token"
    print_info "2. Configure repository secrets in GitHub"
    print_info "3. Review docs/GITHUB_PACKAGES_SETUP.md for detailed instructions"
    print_info "4. Test authentication with: npm whoami --registry=https://npm.pkg.github.com"
    echo ""
}

# Run main function
main "$@"