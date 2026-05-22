#!/bin/bash

# Repository setup script
# This repository is self-contained and does not require private registry setup

set -e

echo "🚀 Setting up repository for development..."

echo "📋 Checking repository configuration..."

# Check if .npmrc exists with old private registry configuration
if [ -f .npmrc ]; then
    if grep -q "npm.pkg.github.com" .npmrc; then
        echo "⚠️  Found old private registry configuration in .npmrc"
        echo "   This repository is now self-contained and doesn't require private registry access."
        echo "   Consider updating or removing .npmrc if it contains private registry settings."
    else
        echo "✅ .npmrc configuration looks good."
    fi
else
    echo "✅ No .npmrc file found (not required for this self-contained repository)."
fi

echo ""
echo "📦 Dependency Information:"
echo "This repository uses Yarn workspaces with local package references."
echo "All @retia-global/* packages are resolved locally from the packages/ directory."
echo ""
echo "🔧 Build Instructions:"
echo "1. Install dependencies: yarn install"
echo "2. Build internal packages: yarn build:packages"
echo "3. Start development: yarn dev"
echo ""
echo "✅ Repository is self-contained and ready for development!"
