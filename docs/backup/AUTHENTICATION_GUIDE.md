# Repository Authentication Guide

This guide provides information about the repository's self-contained authentication setup.

## Overview

This repository is fully self-contained and does not require authentication with private package registries. All dependencies are resolved locally through workspace references or from the public npm registry.

## 1. No Authentication Required

### Simplified Setup

The repository has been updated to be fully self-contained:

1. **No Private Registry Access Needed**: All packages resolve locally or from public npm
2. **No Authentication Tokens Required**: No GitHub Personal Access Tokens needed
3. **No .npmrc Configuration Required**: Works out of the box

### Benefits

- **Simplified Onboarding**: New contributors can clone and run without configuration
- **Improved Security**: No token management or secret rotation needed
- **Faster Setup**: No authentication steps required
- **Better Collaboration**: External contributors can work without access barriers

## 2. Local Development Setup

### Method 1: Simple Clone and Run (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <repository>
   ```

2. **Install dependencies**:
   ```bash
   yarn install  # Works without any authentication
   ```

3. **Start developing**:
   ```bash
   yarn dev  # Start development servers
   ```

### Method 2: Workspace Development

The repository uses Yarn workspaces for local package development:

1. **All internal packages** are referenced with `workspace:*` syntax
2. **Dependencies resolve locally** from the `packages/` directory
3. **No network calls to private registries** during development

## 3. Package Publishing (Optional)

If you need to publish packages:

### To Public npm Registry
1. Update package.json with appropriate `publishConfig` if needed
2. Run `npm publish` with npm account credentials

### To Private Registry (Advanced)
1. Configure `.npmrc` with your private registry settings
2. Add appropriate authentication tokens
3. Update package.json `publishConfig` sections

## 4. Security Best Practices

Even though no authentication is required for development:

- **Keep dependencies updated**: Regularly update public npm dependencies
- **Review package sources**: Verify all dependencies come from trusted sources
- **Use workspace references**: Internal packages should use `workspace:*` references
- **Monitor for vulnerabilities**: Use tools like `npm audit` or `yarn audit`

## 5. Troubleshooting

### Issue: Package resolution fails
**Solution**: Ensure all internal packages are built:
```bash
yarn build:packages  # Build all internal packages
```

### Issue: Workspace references not working
**Solution**: Verify package.json files use `workspace:*` syntax:
```json
{
  "dependencies": {
    "@retia-global/api": "workspace:*"
  }
}
```

### Issue: Build scripts fail
**Solution**: Check build script references in root package.json:
```bash
yarn workspace @retia-global/api build  # Build specific package
```

## 6. Migration from Previous Setup

If you were using the previous private registry setup:

1. **Remove old .npmrc files** if they contain private registry configuration
2. **Update package.json files** to use workspace references
3. **Rebuild internal packages** to ensure local versions are available

## Summary

This repository is designed to be accessible to all users without authentication requirements. The self-contained architecture ensures that:

- ✅ **No authentication tokens** needed for development
- ✅ **All dependencies resolve locally** or from public npm
- ✅ **Workspace packages** are built and referenced internally
- ✅ **Simplified contributor onboarding** with zero configuration

For any issues, check the repository documentation or open an issue in the repository.
   ```

2. **Edit .npmrc with your token**:
   ```
   @monorepo:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=ghp_your_actual_token_here
   ```

3. **Add .npmrc to .gitignore**:
   ```bash
   echo ".npmrc" >> .gitignore
   ```

### Method 2: npm login

1. **Login with npm CLI**:
   ```bash
   npm login --scope=@monorepo --registry=https://npm.pkg.github.com
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
   echo "@monorepo:registry=${NPM_REGISTRY}" > .npmrc
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
    scope: '@monorepo'

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
   echo "@monorepo:registry=https://npm.pkg.github.com" >> .npmrc
   echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc
   npm install
   ```

## 4. Application-Specific Authentication

### Web Application (apps/web)

1. **Create apps/web/.npmrc**:
   ```
   @monorepo:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=ghp_your_token_here
   ```

2. **Add to apps/web/.gitignore**:
   ```
   .npmrc
   ```

### Mobile Application (apps/mobile)

1. **Create apps/mobile/.npmrc**:
   ```
   @monorepo:registry=https://npm.pkg.github.com
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
RUN echo "@monorepo:registry=https://npm.pkg.github.com" >> .npmrc && \
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
   @monorepo:registry=https://npm.pkg.github.com
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
npm ERR! 401 Unauthorized - GET https://npm.pkg.github.com/@monorepo/package-name
```

**Solutions**:
- Check token expiration
- Verify token has `read:packages` scope
- Ensure token is correctly set in .npmrc

#### 403 Forbidden
```
npm ERR! 403 Forbidden - PUT https://npm.pkg.github.com/@monorepo/package-name
```

**Solutions**:
- Check token has `write:packages` scope
- Verify you have write access to the repository
- Ensure package name matches repository ownership

#### 404 Not Found
```
npm ERR! 404 Not Found - GET https://npm.pkg.github.com/@monorepo/package-name
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
npm view @monorepo-vzla/auth --registry=https://npm.pkg.github.com
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
@monorepo:registry=https://npm.pkg.github.com
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
   @monorepo:registry=https://npm.pkg.github.com
   ```

### From Private Registry

1. **Export existing packages**:
   ```bash
   npm pack @monorepo/package-name
   ```

2. **Republish to GitHub Packages**:
   ```bash
   npm publish --registry=https://npm.pkg.github.com
   ```

This comprehensive authentication guide ensures secure and reliable access to GitHub Packages for all team members and environments.