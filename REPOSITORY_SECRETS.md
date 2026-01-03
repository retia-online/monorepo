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
   - `read:packages`
   - `write:packages`
   - `repo` (if using private repositories)

## Environment Variables

For local development, set these environment variables:

```bash
export GITHUB_TOKEN="your_token_here"
export NPM_REGISTRY="https://npm.pkg.github.com"
```

## Verification

Test your setup:

```bash
# Test authentication
npm whoami --registry=https://npm.pkg.github.com

# Test package access
npm view @tu-org/auth --registry=https://npm.pkg.github.com
```
