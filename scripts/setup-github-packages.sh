#!/bin/bash

# Setup GitHub Packages for local development
# This script configures the local .npmrc for the @retia-global scope

set -e

echo "🚀 Setting up GitHub Packages configuration..."

# Check if .npmrc already exists and has the configuration
if [ -f .npmrc ]; then
    if grep -q "npm.pkg.github.com" .npmrc; then
        echo "✅ .npmrc is already configured for GitHub Packages."
    else
        echo "📝 Adding GitHub Packages configuration to .npmrc..."
        cat .npmrc.template >> .npmrc
    fi
else
    if [ -f .npmrc.template ]; then
        echo "📝 Creating .npmrc from template..."
        cp .npmrc.template .npmrc
    else
        echo "❌ Error: .npmrc.template not found. Please create it first."
        exit 1
    fi
fi

echo ""
echo "🔐 Authentication Check:"
echo "To authenticate, you need a GitHub Personal Access Token (PAT) with 'read:packages' scope."
echo "If you haven't done so, update the //npm.pkg.github.com/:_authToken= line in your .npmrc"
echo ""
echo "✅ Setup complete! You can now run 'yarn install' to fetch packages."
