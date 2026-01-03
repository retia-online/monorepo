# External SDK Migration Guide

## Overview

This guide provides step-by-step instructions for migrating from the internal monorepo packages (`@retia/*`) to external SDKs (`@megamercado/*`) hosted on GitHub Packages. The migration transforms the current monorepo structure into a system where applications depend on independently versioned external packages.

## Prerequisites

Before starting the migration, ensure you have:

- GitHub organization access with package publishing permissions
- Personal Access Token (PAT) with `packages:read` and `packages:write` scopes
- Node.js 18+ and npm/yarn installed
- Access to the target GitHub organization repositories

## Migration Steps

### Step 1: Setup GitHub Packages Infrastructure

#### 1.1 Create Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with these scopes:
   - `packages:read`
   - `packages:write`
   - `repo` (if repositories are private)
3. Save the token securely - you'll need it for authentication

#### 1.2 Configure Repository Secrets

Add these secrets to your GitHub repository:

```
NPM_TOKEN=your_personal_access_token
GITHUB_TOKEN=your_github_token
```

### Step 2: Extract and Create SDK Packages

#### 2.1 Create @megamercado/auth Package

**Before (Current Structure):**
```typescript
// apps/web/src/lib/auth.ts
import { NextAuthConfig } from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"

export const authConfig: NextAuthConfig = {
  // Auth configuration
}
```

**After (SDK Structure):**
```typescript
// @megamercado/auth/src/auth-config.ts
import { NextAuthConfig } from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"

export const authConfig: NextAuthConfig = {
  // Same configuration, now in SDK
}

// @megamercado/auth/src/index.ts
export { authConfig, handlers, auth, signIn, signOut } from './auth-config';
export { requireAuth, requireAdmin } from './middleware';
```

**Migration Commands:**
```bash
# Create new repository for @megamercado/auth
mkdir megamercado-auth
cd megamercado-auth
npm init -y

# Configure package.json
npm pkg set name="@megamercado/auth"
npm pkg set publishConfig.registry="https://npm.pkg.github.com"
npm pkg set publishConfig.@megamercado:registry="https://npm.pkg.github.com"

# Install dependencies
npm install next-auth @auth/mongodb-adapter
npm install -D typescript @types/node tsup

# Copy and adapt auth configuration
cp ../monorepo/apps/web/src/lib/auth.ts ./src/auth-config.ts
cp ../monorepo/apps/web/src/lib/route-protection.ts ./src/middleware.ts
```

#### 2.2 Create @megamercado/api Package

**Before (Current Structure):**
```typescript
// packages/database/src/models/User.ts
import mongoose from 'mongoose';

export const User = mongoose.model('User', userSchema);

// packages/api/src/services/user.ts
export async function getUserBackup(userId: string) {
  // User backup logic
}
```

**After (SDK Structure):**
```typescript
// @megamercado/api/src/models/User.ts
import mongoose from 'mongoose';

export const User = mongoose.model('User', userSchema);

// @megamercado/api/src/services/user.ts
export async function getUserBackup(userId: string) {
  // Same logic, now in SDK
}

// @megamercado/api/src/index.ts
export { User, Account, Session } from './models';
export { getUserBackup, createUser } from './services/user';
export { connectDB } from './connection';
```

**Migration Commands:**
```bash
# Create new repository for @megamercado/api
mkdir megamercado-api
cd megamercado-api
npm init -y

# Configure package.json
npm pkg set name="@megamercado/api"
npm pkg set publishConfig.registry="https://npm.pkg.github.com"

# Install dependencies
npm install mongoose bcryptjs nodemailer zod
npm install -D typescript @types/node tsup

# Copy database models and services
cp -r ../monorepo/packages/database/src/models ./src/
cp -r ../monorepo/packages/api/src/services ./src/
cp ../monorepo/packages/database/src/connection.ts ./src/
```

#### 2.3 Create @megamercado/ui Package

**Before (Current Structure):**
```typescript
// packages/ui/src/Button.tsx
export function Button({ children, ...props }) {
  return <button {...props}>{children}</button>;
}

// apps/web/src/components/Navbar.tsx
export function Navbar() {
  // Navbar component
}
```

**After (SDK Structure):**
```typescript
// @megamercado/ui/src/components/Button.tsx
export function Button({ children, ...props }) {
  return <button {...props}>{children}</button>;
}

// @megamercado/ui/src/auth-components/Navbar.tsx
export function Navbar() {
  // Same component, now in SDK
}

// @megamercado/ui/src/index.ts
export { Button, Card, Input } from './components';
export { Navbar, LoginForm } from './auth-components';
```

**Migration Commands:**
```bash
# Create new repository for @megamercado/ui
mkdir megamercado-ui
cd megamercado-ui
npm init -y

# Configure package.json
npm pkg set name="@megamercado/ui"
npm pkg set publishConfig.registry="https://npm.pkg.github.com"

# Install dependencies
npm install react @types/react
npm install -D typescript tsup @storybook/react

# Copy UI components
cp -r ../monorepo/packages/ui/src/components ./src/
mkdir -p ./src/auth-components
cp ../monorepo/apps/web/src/components/Navbar.tsx ./src/auth-components/
```

#### 2.4 Create @megamercado/configs Package

**Before (Current Structure):**
```javascript
// apps/web/tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6'
      }
    }
  }
}
```

**After (SDK Structure):**
```javascript
// @megamercado/configs/tailwind.preset.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6'
      }
    }
  }
}

// @megamercado/configs/src/index.ts
export { default as tailwindPreset } from '../tailwind.preset';
export { default as tsconfig } from '../tsconfig.base.json';
```

### Step 3: Publish SDK Packages

#### 3.1 Configure GitHub Actions for Automated Publishing

Create `.github/workflows/publish.yml` in each SDK repository:

```yaml
name: Publish Package

on:
  push:
    branches: [main]
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://npm.pkg.github.com'
      
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### 3.2 Manual Publishing (First Time)

```bash
# In each SDK repository
npm run build
npm test
npm publish
```

### Step 4: Configure Monorepo Applications

#### 4.1 Configure .npmrc Files

Create `.npmrc` in both `apps/web` and `apps/mobile`:

```
@megamercado:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

#### 4.2 Update Package Dependencies

**Before (apps/web/package.json):**
```json
{
  "dependencies": {
    "@retia/database": "*",
    "@retia/ui": "*",
    "@retia/utils": "*"
  }
}
```

**After (apps/web/package.json):**
```json
{
  "dependencies": {
    "@megamercado/auth": "^1.0.0",
    "@megamercado/api": "^1.0.0",
    "@megamercado/ui": "^1.0.0",
    "@megamercado/configs": "^1.0.0"
  }
}
```

### Step 5: Update Application Code

#### 5.1 Update Authentication Code

**Before (apps/web/src/lib/auth.ts):**
```typescript
import { NextAuthConfig } from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"

export const authConfig: NextAuthConfig = {
  // Local configuration
}
```

**After (apps/web/src/lib/auth.ts):**
```typescript
import { authConfig } from "@megamercado/auth"

// Use imported configuration
export { authConfig }
```

#### 5.2 Update Middleware

**Before (apps/web/middleware.ts):**
```typescript
import { requireAuth } from "./src/lib/route-protection"

export default requireAuth
```

**After (apps/web/middleware.ts):**
```typescript
import { requireAuth } from "@megamercado/auth"

export default requireAuth
```

#### 5.3 Update Component Imports

**Before (apps/web/src/app/page.tsx):**
```typescript
import { Button } from "@retia/ui"
import { Navbar } from "../components/Navbar"
```

**After (apps/web/src/app/page.tsx):**
```typescript
import { Button, Navbar } from "@megamercado/ui"
```

#### 5.4 Update Tailwind Configuration

**Before (apps/web/tailwind.config.js):**
```javascript
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6'
      }
    }
  }
}
```

**After (apps/web/tailwind.config.js):**
```javascript
const { tailwindPreset } = require("@megamercado/configs")

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  presets: [tailwindPreset]
}
```

### Step 6: Environment Variable Configuration

#### 6.1 Preserve Application-Specific Environment Variables

Each application maintains its own environment configuration:

**apps/web/.env.local:**
```
DATABASE_URL=mongodb://localhost:27017/web-app
AUTH_SECRET=web-app-secret
NEXTAUTH_URL=http://localhost:3000
```

**apps/mobile/.env.local:**
```
DATABASE_URL=mongodb://localhost:27017/mobile-app
AUTH_SECRET=mobile-app-secret
API_URL=http://localhost:3000/api
```

### Step 7: Testing and Validation

#### 7.1 Run Application Tests

```bash
# Test web application
cd apps/web
npm test

# Test mobile application
cd apps/mobile
npm test
```

#### 7.2 Validate Authentication Flows

1. Start the web application: `npm run dev`
2. Test login/logout functionality
3. Verify protected routes work correctly
4. Test user registration and profile updates

#### 7.3 Validate Database Operations

1. Test user creation and retrieval
2. Verify getUserBackup() function works
3. Test database connections are maintained

### Step 8: Cleanup

#### 8.1 Remove Local Packages

```bash
# Remove packages directory
rm -rf packages/

# Update root package.json
npm pkg delete workspaces
```

#### 8.2 Update Build Scripts

Remove workspace-related build scripts and update to focus on applications only.

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue: Authentication Failed when Installing Packages

**Error:**
```
npm ERR! 401 Unauthorized - GET https://npm.pkg.github.com/@megamercado/auth
```

**Solution:**
1. Verify your PAT token has correct permissions
2. Check .npmrc configuration is correct
3. Ensure NPM_TOKEN environment variable is set
4. Try logging in manually: `npm login --registry=https://npm.pkg.github.com`

#### Issue: Package Not Found

**Error:**
```
npm ERR! 404 Not Found - GET https://npm.pkg.github.com/@megamercado/auth
```

**Solution:**
1. Verify package was published successfully
2. Check package name spelling in package.json
3. Ensure you have read access to the organization
4. Try clearing npm cache: `npm cache clean --force`

#### Issue: Version Conflicts

**Error:**
```
npm ERR! peer dep missing: @megamercado/auth@^1.0.0
```

**Solution:**
1. Update package.json with correct version ranges
2. Run `npm install` to resolve dependencies
3. Check for conflicting versions in package-lock.json
4. Use `npm ls` to view dependency tree

#### Issue: Build Failures After Migration

**Error:**
```
Module not found: Can't resolve '@retia/ui'
```

**Solution:**
1. Search codebase for remaining @retia imports: `grep -r "@retia" src/`
2. Update all imports to use @megamercado packages
3. Clear build cache and rebuild
4. Verify all dependencies are installed

#### Issue: Environment Variables Not Working

**Error:**
```
Error: DATABASE_URL is not defined
```

**Solution:**
1. Verify .env.local files exist in each app
2. Check environment variable names match SDK expectations
3. Restart development servers after env changes
4. Use `process.env` debugging to verify variables are loaded

#### Issue: TypeScript Declaration Errors

**Error:**
```
Could not find a declaration file for module '@megamercado/auth'
```

**Solution:**
1. Verify SDK packages include .d.ts files
2. Check tsconfig.json includes correct module resolution
3. Try rebuilding SDK packages with `npm run build`
4. Clear TypeScript cache and restart IDE

### Rollback Procedures

If migration fails and you need to rollback:

#### 1. Restore Package Dependencies

```bash
# Restore original package.json files
git checkout HEAD~1 -- apps/web/package.json apps/mobile/package.json

# Reinstall original dependencies
npm install
```

#### 2. Restore Import Statements

```bash
# Find and replace @megamercado imports back to @retia
find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/@megamercado/@retia/g'
```

#### 3. Restore Local Packages

```bash
# Restore packages directory from git
git checkout HEAD~1 -- packages/

# Rebuild local packages
npm run build
```

#### 4. Restore Configuration Files

```bash
# Restore original configuration files
git checkout HEAD~1 -- apps/web/tailwind.config.js
git checkout HEAD~1 -- apps/web/middleware.ts
```

### Performance Considerations

#### Package Size Optimization

- Use tree-shaking to reduce bundle sizes
- Implement proper exports in package.json
- Consider splitting large packages into smaller modules

#### Caching Strategies

- Configure npm cache for faster installs
- Use GitHub Actions cache for CI/CD
- Implement proper versioning to avoid unnecessary updates

#### Development Workflow

- Use `npm link` for local SDK development
- Set up hot-reload for linked packages
- Configure proper source maps for debugging

## Next Steps

After successful migration:

1. **Monitor Performance**: Track application performance metrics
2. **Update Documentation**: Keep SDK documentation current
3. **Version Management**: Establish clear versioning policies
4. **Security Updates**: Monitor and update dependencies regularly
5. **Team Training**: Ensure team understands new workflow

## Support

For additional help:

- Check GitHub Issues in SDK repositories
- Review GitHub Packages documentation
- Contact the development team for organization-specific issues