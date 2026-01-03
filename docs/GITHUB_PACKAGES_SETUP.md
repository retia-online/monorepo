# GitHub Packages Setup Guide

This guide covers setting up GitHub Packages infrastructure for the @megamercado SDK packages.

## Prerequisites

- GitHub organization or personal account with packages enabled
- Repository with appropriate permissions
- Node.js and npm installed locally

## 1. GitHub Organization Configuration

### Create GitHub Organization (if not exists)
1. Go to GitHub and create a new organization named `tu-org`
2. Ensure the organization has packages enabled
3. Set package visibility to private (recommended for internal SDKs)

### Repository Setup
1. Create repositories for each SDK package:
   - `tu-org/auth-sdk`
   - `tu-org/api-sdk` 
   - `tu-org/ui-sdk`
   - `tu-org/configs-sdk`
2. Or use a single monorepo approach with multiple packages

## 2. Personal Access Token (PAT) Creation

### Create PAT with Required Permissions
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Set expiration (recommended: 90 days for security)
4. Select the following scopes:
   - `read:packages` - Download packages from GitHub Packages
   - `write:packages` - Upload packages to GitHub Packages
   - `delete:packages` - Delete packages from GitHub Packages (optional)
   - `repo` - Access to private repositories (if packages are in private repos)

### Store PAT Securely
- **Never commit PAT to version control**
- Store in environment variables or secure credential manager
- For CI/CD, use repository secrets (see next section)

## 3. Repository Secrets Configuration

### Add Secrets to Repository
1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

#### Required Secrets
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions (has packages:write permission)
- `NPM_TOKEN` - Your Personal Access Token (if using custom token)

#### Optional Secrets
- `SLACK_WEBHOOK` - For publishing notifications
- `DISCORD_WEBHOOK` - For publishing notifications

### Organization-Level Secrets (Recommended)
For multiple repositories, set secrets at organization level:
1. Go to Organization Settings → Secrets and variables → Actions
2. Add the same secrets with organization-wide access

## 4. Local Development Setup

### Configure .npmrc for Local Development
1. Copy `.npmrc.template` to `.npmrc`
2. Replace `YOUR_GITHUB_TOKEN` with your actual PAT
3. Add `.npmrc` to `.gitignore` to prevent accidental commits

```bash
# Copy template
cp .npmrc.template .npmrc

# Edit with your token
# @megamercado:registry=https://npm.pkg.github.com
# //npm.pkg.github.com/:_authToken=ghp_your_actual_token_here
```

### Alternative: Use npm login
```bash
npm login --scope=@megamercado --registry=https://npm.pkg.github.com
```

## 5. Package Configuration

### package.json Configuration
Each SDK package should have the following configuration:

```json
{
  "name": "@megamercado/package-name",
  "version": "1.0.0",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "@megamercado:registry": "https://npm.pkg.github.com"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/tu-org/repo-name.git"
  }
}
```

## 6. Automated Publishing Workflow

The GitHub Actions workflow (`.github/workflows/publish-packages.yml`) handles:
- Building packages
- Running tests
- Publishing to GitHub Packages
- Semantic versioning
- Release notes generation

### Workflow Triggers
- Push to main branch (for development releases)
- GitHub releases (for stable releases)
- Manual workflow dispatch

## 7. Consuming Packages

### In Applications
1. Configure `.npmrc` in consuming applications:
```
@megamercado:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_TOKEN
```

2. Install packages:
```bash
npm install @megamercado/auth @megamercado/api @megamercado/ui @megamercado/configs
```

### In Docker
For Docker builds, use build args:
```dockerfile
ARG GITHUB_TOKEN
RUN echo "@megamercado:registry=https://npm.pkg.github.com" >> .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc && \
    npm install && \
    rm .npmrc
```

## 8. Security Best Practices

### Token Management
- Use least privilege principle (only required scopes)
- Rotate tokens regularly (every 90 days)
- Use different tokens for different environments
- Monitor token usage in GitHub audit logs

### Access Control
- Limit package access to organization members
- Use team-based permissions for different access levels
- Regular audit of package access and downloads
- Enable package vulnerability scanning

### CI/CD Security
- Use GitHub's built-in `GITHUB_TOKEN` when possible
- Store sensitive data in encrypted secrets
- Use environment-specific secrets
- Enable branch protection rules

## 9. Troubleshooting

### Common Issues

#### Authentication Errors
```
npm ERR! 401 Unauthorized
```
**Solution**: Check token permissions and expiration

#### Package Not Found
```
npm ERR! 404 Not Found - GET https://npm.pkg.github.com/@megamercado/package-name
```
**Solution**: Verify package name, registry configuration, and access permissions

#### Publishing Failures
```
npm ERR! 403 Forbidden
```
**Solution**: Check write permissions and package ownership

### Debug Commands
```bash
# Check npm configuration
npm config list

# Test authentication
npm whoami --registry=https://npm.pkg.github.com

# Verify package access
npm view @megamercado/package-name --registry=https://npm.pkg.github.com
```

## 10. Monitoring and Maintenance

### Package Analytics
- Monitor download statistics in GitHub Packages
- Track version adoption across applications
- Monitor security vulnerabilities

### Maintenance Tasks
- Regular dependency updates
- Security patch releases
- Documentation updates
- Performance monitoring

### Backup Strategy
- Regular exports of package metadata
- Source code backups in multiple locations
- Disaster recovery procedures
- Version history preservation