#!/bin/bash

# GitHub Packages Setup Validation Script
# This script validates that GitHub Packages infrastructure is properly configured

set -e

echo "🔍 GitHub Packages Setup Validation"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print colored output
print_pass() {
    echo -e "${GREEN}✓ PASS${NC} $1"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}✗ FAIL${NC} $1"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠ WARN${NC} $1"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ INFO${NC} $1"
}

# Test 1: Check if required files exist
test_required_files() {
    echo ""
    echo "Testing required files..."
    
    files=(
        ".github/workflows/publish-packages.yml"
        ".npmrc.template"
        ".npmrc"
        "docs/GITHUB_PACKAGES_SETUP.md"
        "docs/AUTHENTICATION_GUIDE.md"
        "REPOSITORY_SECRETS.md"
        "scripts/setup-github-packages.sh"
    )
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            print_pass "File exists: $file"
        else
            print_fail "Missing file: $file"
        fi
    done
}

# Test 2: Check package directory structure
test_package_structure() {
    echo ""
    echo "Testing package directory structure..."
    
    packages=("auth" "api" "ui" "configs")
    
    for package in "${packages[@]}"; do
        if [ -d "packages/$package" ]; then
            print_pass "Package directory exists: packages/$package"
            
            if [ -d "packages/$package/src" ]; then
                print_pass "Source directory exists: packages/$package/src"
            else
                print_warning "Missing src directory: packages/$package/src"
            fi
        else
            print_fail "Missing package directory: packages/$package"
        fi
    done
}

# Test 3: Validate .npmrc configuration
test_npmrc_config() {
    echo ""
    echo "Testing .npmrc configuration..."
    
    if [ -f ".npmrc" ]; then
        if grep -q "@megamercado:registry=https://npm.pkg.github.com" .npmrc; then
            print_pass ".npmrc contains correct registry configuration"
        else
            print_fail ".npmrc missing registry configuration"
        fi
        
        if grep -q "//npm.pkg.github.com/:_authToken=" .npmrc; then
            if grep -q "YOUR_GITHUB_TOKEN" .npmrc; then
                print_warning ".npmrc contains placeholder token - needs real token"
            else
                print_pass ".npmrc contains authentication token"
            fi
        else
            print_fail ".npmrc missing authentication token"
        fi
    else
        print_fail ".npmrc file not found"
    fi
}

# Test 4: Test npm authentication
test_npm_auth() {
    echo ""
    echo "Testing npm authentication..."
    
    if npm whoami --registry=https://npm.pkg.github.com &> /dev/null; then
        username=$(npm whoami --registry=https://npm.pkg.github.com)
        print_pass "npm authentication successful - logged in as: $username"
    else
        print_fail "npm authentication failed"
        print_info "Run: npm login --scope=@megamercado --registry=https://npm.pkg.github.com"
    fi
}

# Test 5: Validate GitHub Actions workflow
test_github_actions() {
    echo ""
    echo "Testing GitHub Actions workflow..."
    
    workflow_file=".github/workflows/publish-packages.yml"
    
    if [ -f "$workflow_file" ]; then
        if grep -q "packages: write" "$workflow_file"; then
            print_pass "Workflow has packages:write permission"
        else
            print_warning "Workflow missing packages:write permission"
        fi
        
        if grep -q "NODE_AUTH_TOKEN" "$workflow_file"; then
            print_pass "Workflow uses NODE_AUTH_TOKEN"
        else
            print_fail "Workflow missing NODE_AUTH_TOKEN configuration"
        fi
        
        if grep -q "npm publish" "$workflow_file"; then
            print_pass "Workflow includes npm publish step"
        else
            print_fail "Workflow missing npm publish step"
        fi
    else
        print_fail "GitHub Actions workflow file not found"
    fi
}

# Test 6: Check .gitignore configuration
test_gitignore() {
    echo ""
    echo "Testing .gitignore configuration..."
    
    if [ -f ".gitignore" ]; then
        if grep -q "\.npmrc" .gitignore; then
            print_pass ".gitignore includes .npmrc"
        else
            print_warning ".gitignore missing .npmrc entry"
        fi
    else
        print_warning ".gitignore file not found"
    fi
}

# Test 7: Validate documentation completeness
test_documentation() {
    echo ""
    echo "Testing documentation completeness..."
    
    docs=(
        "docs/GITHUB_PACKAGES_SETUP.md"
        "docs/AUTHENTICATION_GUIDE.md"
        "REPOSITORY_SECRETS.md"
    )
    
    for doc in "${docs[@]}"; do
        if [ -f "$doc" ]; then
            word_count=$(wc -w < "$doc")
            if [ "$word_count" -gt 100 ]; then
                print_pass "Documentation complete: $doc ($word_count words)"
            else
                print_warning "Documentation may be incomplete: $doc ($word_count words)"
            fi
        else
            print_fail "Missing documentation: $doc"
        fi
    done
}

# Test 8: Check environment variables
test_environment() {
    echo ""
    echo "Testing environment variables..."
    
    if [ -n "$GITHUB_TOKEN" ]; then
        print_pass "GITHUB_TOKEN environment variable is set"
        
        # Test token validity
        if curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user > /dev/null; then
            print_pass "GITHUB_TOKEN is valid"
        else
            print_fail "GITHUB_TOKEN is invalid or expired"
        fi
    else
        print_warning "GITHUB_TOKEN environment variable not set"
    fi
}

# Test 9: Validate script permissions
test_script_permissions() {
    echo ""
    echo "Testing script permissions..."
    
    scripts=(
        "scripts/setup-github-packages.sh"
        "scripts/validate-github-packages-setup.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [ -f "$script" ]; then
            if [ -x "$script" ]; then
                print_pass "Script is executable: $script"
            else
                print_warning "Script not executable: $script"
                print_info "Run: chmod +x $script"
            fi
        else
            print_fail "Script not found: $script"
        fi
    done
}

# Test 10: Check package.json configurations (if they exist)
test_package_json() {
    echo ""
    echo "Testing package.json configurations..."
    
    packages=("auth" "api" "ui" "configs")
    
    for package in "${packages[@]}"; do
        package_json="packages/$package/package.json"
        if [ -f "$package_json" ]; then
            if grep -q "@megamercado/$package" "$package_json"; then
                print_pass "Package name correct: packages/$package"
            else
                print_warning "Package name may be incorrect: packages/$package"
            fi
            
            if grep -q "publishConfig" "$package_json"; then
                print_pass "Publish config present: packages/$package"
            else
                print_warning "Missing publishConfig: packages/$package"
            fi
        else
            print_info "Package.json not yet created: packages/$package"
        fi
    done
}

# Main execution
main() {
    echo "Starting validation tests..."
    echo ""
    
    test_required_files
    test_package_structure
    test_npmrc_config
    test_npm_auth
    test_github_actions
    test_gitignore
    test_documentation
    test_environment
    test_script_permissions
    test_package_json
    
    echo ""
    echo "📊 Validation Summary"
    echo "===================="
    echo -e "${GREEN}Passed: $PASSED${NC}"
    echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
    echo -e "${RED}Failed: $FAILED${NC}"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 All critical tests passed! GitHub Packages setup is ready.${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed. Please address the issues above.${NC}"
        exit 1
    fi
}

# Run main function
main "$@"