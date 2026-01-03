# GitHub Packages Authentication Guide

This guide provides step-by-step instructions for setting up authentication with GitHub Packages for the @megamercado SDK packages.

## Overview

GitHub Packages requires authentication for both publishing and consuming private packages. This guide covers all authentication methods and scenarios.

## 1. Personal Access Token (PAT) Setup

### Creating a Personal Access Token

1. **Navigate to GitHub Settings**
   - Go to [GitHub.com](https://github.com)
   - Click your profile picture → Settings
   - Scroll down to "Developer settings" → "Personal access tokens" → "Tokens (classic)"

2. **Generate New Token**
   - Click "Generate new token (classic)"
   - Add a descriptive note (e.g., "TU-Org SDK Packages")
   - Set expiration (recommended: 90 days for security)

3. **Select Required Scopes**
   ```
   ✅ read:packages    - Download packages from GitHub Packages
   ✅ write:packages   - Upload packages to GitHub Packages
   ✅ delete:packages  - Delete packages (optional, for maintenance)
   ✅ repo            - Access private repositories (if packages are in private repos)
   ```

4. **Generate and Copy Token**
   - Click "Generate token"
   - **Important**: Copy the token immediately - you won't see it again!
   - Store it securely (password manager, environment variable)

### Token Security Best Practices

- **Never commit tokens to version control**
- Use environment variables or secure credential managers
- Rotate tokens regularly (every 90 days)
- Use least privilege principle (only required scopes)
- Monitor token usage in GitHub audit logs

## 2. Local Development Authentication

### Method 1: .npmrc File (Recommended)

1. **Create .npmrc file in your project root**:
   ```bash
   cp .npmrc.template .npmrc
   ```

2. **Edit .npmrc with your token**:
   ```
   @megamercado:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=ghp_your_actual_token_here
   ```

3. **Add .npmrc to .gitignore**:
   ```bash
   echo ".npmrc" >> .gitignore
   ```

### Method 2: npm login

1. **Login with npm CLI**:
   ```bash
   npm login --scope=@megamercado --registry=https://npm.pkg.github.com
   ```

2. **Enter credentials when prompted**:
   - Username: Your GitHub username
   - Password: Your Personal Access Token (not your GitHub password!)
   - Email: Your GitHub email

### Method 3: Environment Variables

1. **Set environment variables**:
   ```bash
   export NPM_TOKEN="ghp_your_actual_token_here"
   export NPM_REGISTRY="https://npm.pkg.github.com"
   ```

2. **Create .npmrc dynamically**:
   ```bash
   echo "@megamercado:registry=${NPM_REGISTRY}" > .npmrc
   echo "//${NPM_REGISTRY#https://}/:_authToken=${NPM_TOKEN}" >> .npmrc
   ```

## 3. CI/CD Authentication

### GitHub Actions (Recommended)

GitHub Actions provides automatic authentication through the `GITHUB_TOKEN`:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    registry-url: 'https://npm.pkg.github.com'
    scope: '@megamercado'

- name: Publish package
  run: npm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Custom CI/CD Systems

For other CI/CD systems, use repository secrets:

1. **Add secret to your CI/CD system**:
   - Secret name: `GITHUB_TOKEN` or `NPM_TOKEN`
   - Secret value: Your Personal Access Token

2. **Configure in CI/CD pipeline**:
   ```bash
   echo "@megamercado:registry=https://npm.pkg.github.com" >> .npmrc
   echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc
   npm install
   ```

## 4. Application-Specific Authentication

### Web Application (apps/web)

1. **Create apps/web/.npmrc**:
   ```
   @megamercado:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=ghp_your_token_here
   ```

2. **Add to apps/web/.gitignore**:
   ```
   .npmrc
   ```

### Mobile Application (apps/mobile)

1. **Create apps/mobile/.npmrc**:
   ```
   @megamercado:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=ghp_your_token_here
   ```

2. **Add to apps/mobile/.gitignore**:
   ```
   .npmrc
   ```

## 5. Docker Authentication

### Dockerfile with Build Args

```dockerfile
ARG GITHUB_TOKEN
RUN echo "@megamercado:registry=https://npm.pkg.github.com" >> .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc && \
    npm install && \
    rm .npmrc
```

### Docker Build Command

```bash
docker build --build-arg GITHUB_TOKEN=${GITHUB_TOKEN} .
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      args:
        GITHUB_TOKEN: ${GITHUB_TOKEN}
```

## 6. Team Authentication

### Organization-Level Tokens

For teams, consider using organization-level tokens:

1. **Create organization token**:
   - Go to Organization Settings → Developer settings
   - Create token with organization scope
   - Share securely with team members

2. **Team .npmrc template**:
   ```
   @megamercado:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${TEAM_GITHUB_TOKEN}
   ```

### Role-Based Access

Configure different access levels:

- **Developers**: `read:packages` only
- **Maintainers**: `read:packages`, `write:packages`
- **Admins**: All package permissions

## 7. Troubleshooting Authentication

### Common Error Messages

#### 401 Unauthorized
```
npm ERR! 401 Unauthorized - GET https://npm.pkg.github.com/@megamercado/package-name
```

**Solutions**:
- Check token expiration
- Verify token has `read:packages` scope
- Ensure token is correctly set in .npmrc

#### 403 Forbidden
```
npm ERR! 403 Forbidden - PUT https://npm.pkg.github.com/@megamercado/package-name
```

**Solutions**:
- Check token has `write:packages` scope
- Verify you have write access to the repository
- Ensure package name matches repository ownership

#### 404 Not Found
```
npm ERR! 404 Not Found - GET https://npm.pkg.github.com/@megamercado/package-name
```

**Solutions**:
- Verify package exists and is published
- Check package name spelling
- Ensure you have access to the repository

### Debug Commands

```bash
# Check npm configuration
npm config list

# Test authentication
npm whoami --registry=https://npm.pkg.github.com

# Verify token permissions
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# Test package access
npm view @megamercado/auth --registry=https://npm.pkg.github.com
```

### Verbose Logging

Enable verbose logging for debugging:

```bash
npm install --loglevel verbose
npm publish --loglevel verbose
```

## 8. Security Considerations

### Token Management

- **Rotate tokens regularly** (every 90 days)
- **Use different tokens** for different environments
- **Monitor token usage** in GitHub audit logs
- **Revoke unused tokens** immediately

### Access Control

- **Limit package visibility** to organization members
- **Use team-based permissions** for granular access
- **Regular audit** of package access and downloads
- **Enable two-factor authentication** on GitHub account

### Environment Separation

- **Development**: Personal tokens with read access
- **Staging**: Service account tokens with limited scope
- **Production**: Automated tokens with minimal permissions

## 9. Automation Scripts

### Token Validation Script

```bash
#!/bin/bash
validate_token() {
    if [ -z "$GITHUB_TOKEN" ]; then
        echo "Error: GITHUB_TOKEN not set"
        exit 1
    fi
    
    if curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user > /dev/null; then
        echo "✓ Token is valid"
    else
        echo "✗ Token validation failed"
        exit 1
    fi
}
```

### Automated .npmrc Setup

```bash
#!/bin/bash
setup_npmrc() {
    if [ -z "$GITHUB_TOKEN" ]; then
        read -p "Enter GitHub token: " GITHUB_TOKEN
    fi
    
    cat > .npmrc << EOF
@megamercado:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
EOF
    
    echo "✓ .npmrc configured"
}
```

## 10. Migration from Other Registries

### From npm Registry

1. **Update package.json**:
   ```json
   {
     "publishConfig": {
       "registry": "https://npm.pkg.github.com"
     }
   }
   ```

2. **Update .npmrc**:
   ```
   @megamercado:registry=https://npm.pkg.github.com
   ```

### From Private Registry

1. **Export existing packages**:
   ```bash
   npm pack @megamercado/package-name
   ```

2. **Republish to GitHub Packages**:
   ```bash
   npm publish --registry=https://npm.pkg.github.com
   ```

This comprehensive authentication guide ensures secure and reliable access to GitHub Packages for all team members and environments.