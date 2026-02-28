/**
 * Property-based tests for environment variable preservation
 * **Feature: external-sdk-transformation, Property 7: Environment Variable Preservation**
 * **Validates: Requirements 4.4, 4.5**
 */

import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

// Applications that should have environment configuration
const APPLICATIONS = [
  'apps/web',
  'apps/mobile'
];

// Critical environment variables for each application
const CRITICAL_ENV_VARS = {
  'apps/web': [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'AUTH_MODE',
    'AUTH_PROVIDERS'
  ],
  'apps/mobile': [
    'EXPO_PUBLIC_API_URL',
    'EXPO_PUBLIC_AUTH_MODE',
    'EXPO_PUBLIC_AUTH_METHODS',
    'EXPO_PUBLIC_INSTANCE'
  ]
};

// Theme variables that should be consistent
const THEME_VARIABLES = [
  'PRIMARY_COLOR',
  'SECONDARY_COLOR',
  'BACKGROUND_COLOR',
  'TEXT_COLOR'
];

function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

function readFileContent(filePath: string): string {
  if (!fileExists(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function extractEnvVariable(content: string, varName: string): string | null {
  const regex = new RegExp(`${varName}=(.+)`, 'm');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

function hasRequiredEnvVars(content: string, requiredVars: string[]): boolean {
  return requiredVars.every(varName => {
    const value = extractEnvVariable(content, varName);
    return value !== null && value !== '';
  });
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

function getThemeColors(content: string, prefix: string = ''): Record<string, string> {
  const colors: Record<string, string> = {};
  
  THEME_VARIABLES.forEach(varName => {
    const fullVarName = prefix ? `${prefix}_${varName}` : varName;
    const value = extractEnvVariable(content, fullVarName);
    if (value) {
      colors[varName] = value;
    }
  });
  
  return colors;
}

describe('Environment Variable Preservation Property Tests', () => {
  describe('Property 7: Environment Variable Preservation', () => {
    
    it('should preserve all critical environment variables for each application', () => {
      // **Feature: external-sdk-transformation, Property 7: Environment Variable Preservation**
      fc.assert(fc.property(
        fc.constantFrom(...APPLICATIONS),
        (appPath) => {
          const envPath = path.join(appPath, '.env.development');
          
          if (!fileExists(envPath)) {
            // Skip test if .env.development doesn't exist
            return true;
          }
          
          const envContent = readFileContent(envPath);
          const requiredVars = CRITICAL_ENV_VARS[appPath as keyof typeof CRITICAL_ENV_VARS];
          
          // For any application, after migration all critical environment variables should be preserved
          expect(hasRequiredEnvVars(envContent, requiredVars)).toBe(true);
        }
      ), { numRuns: 100 });
    });

    it('should have valid URL format for API endpoints', () => {
      // **Feature: external-sdk-transformation, Property 7: Environment Variable Preservation**
      fc.assert(fc.property(
        fc.constantFrom(...APPLICATIONS),
        (appPath) => {
          const envPath = path.join(appPath, '.env.development');
          
          if (!fileExists(envPath)) {
            return true;
          }
          
          const envContent = readFileContent(envPath);
          
          // For any application, URL environment variables should be valid URLs
          if (appPath === 'apps/web') {
            const nextAuthUrl = extractEnvVariable(envContent, 'NEXTAUTH_URL');
            if (nextAuthUrl) {
              expect(isValidUrl(nextAuthUrl)).toBe(true);
            }
          }
          
          if (appPath === 'apps/mobile') {
            const apiUrl = extractEnvVariable(envContent, 'EXPO_PUBLIC_API_URL');
            if (apiUrl) {
              expect(isValidUrl(apiUrl)).toBe(true);
            }
          }
        }
      ), { numRuns: 100 });
    });

    it('should have valid authentication configuration', () => {
      // **Feature: external-sdk-transformation, Property 7: Environment Variable Preservation**
      fc.assert(fc.property(
        fc.constantFrom(...APPLICATIONS),
        (appPath) => {
          const envPath = path.join(appPath, '.env.development');
          
          if (!fileExists(envPath)) {
            return true;
          }
          
          const envContent = readFileContent(envPath);
          const validAuthModes = ['required', 'disabled', 'optional', 'whitelist', 'invite-only'];
          
          // For any application, auth mode should be valid
          if (appPath === 'apps/web') {
            const authMode = extractEnvVariable(envContent, 'AUTH_MODE');
            if (authMode) {
              expect(validAuthModes).toContain(authMode);
            }
          }
          
          if (appPath === 'apps/mobile') {
            const authMode = extractEnvVariable(envContent, 'EXPO_PUBLIC_AUTH_MODE');
            if (authMode) {
              expect(validAuthModes).toContain(authMode);
            }
          }
        }
      ), { numRuns: 100 });
    });

    it('should have consistent theme colors between web and mobile', () => {
      // **Feature: external-sdk-transformation, Property 7: Environment Variable Preservation**
      fc.assert(fc.property(
        fc.constant(['apps/web', 'apps/mobile']),
        (appPaths) => {
          const webEnvPath = path.join('apps/web', '.env.development');
          const mobileEnvPath = path.join('apps/mobile', '.env.development');
          
          if (!fileExists(webEnvPath) || !fileExists(mobileEnvPath)) {
            return true;
          }
          
          const webEnvContent = readFileContent(webEnvPath);
          const mobileEnvContent = readFileContent(mobileEnvPath);
          
          // Get theme colors from both apps
          const webColors = getThemeColors(webEnvContent, 'NEXT_PUBLIC');
          const mobileColors = getThemeColors(mobileEnvContent, 'EXPO_PUBLIC');
          
          // For any theme color that exists in both apps, values should match
          Object.keys(webColors).forEach(colorName => {
            if (mobileColors[colorName]) {
              expect(webColors[colorName]).toBe(mobileColors[colorName]);
            }
          });
        }
      ), { numRuns: 100 });
    });

    it('should have valid hex colors for theme variables', () => {
      // **Feature: external-sdk-transformation, Property 7: Environment Variable Preservation**
      fc.assert(fc.property(
        fc.constantFrom(...APPLICATIONS),
        (appPath) => {
          const envPath = path.join(appPath, '.env.development');
          
          if (!fileExists(envPath)) {
            return true;
          }
          
          const envContent = readFileContent(envPath);
          
          // For any application, theme colors should be valid hex colors
          const prefix = appPath === 'apps/web' ? 'NEXT_PUBLIC' : 'EXPO_PUBLIC';
          const colors = getThemeColors(envContent, prefix);
          
          Object.values(colors).forEach(color => {
            if (color) {
              expect(isValidHexColor(color)).toBe(true);
            }
          });
        }
      ), { numRuns: 100 });
    });

    it('should have proper security configuration for web app', () => {
      // **Feature: external-sdk-transformation, Property 7: Environment Variable Preservation**
      fc.assert(fc.property(
        fc.constant('apps/web'),
        (appPath) => {
          const envPath = path.join(appPath, '.env.development');
          
          if (!fileExists(envPath)) {
            return true;
          }
          
          const envContent = readFileContent(envPath);
          
          // For web application, security-critical variables should meet requirements
          const nextAuthSecret = extractEnvVariable(envContent, 'NEXTAUTH_SECRET');
          if (nextAuthSecret) {
            // NextAuth secret should be at least 32 characters
            expect(nextAuthSecret.length).toBeGreaterThanOrEqual(32);
          }
          
          const mongoUri = extractEnvVariable(envContent, 'MONGODB_URI');
          if (mongoUri) {
            // MongoDB URI should contain mongodb protocol
            expect(mongoUri).toMatch(/^mongodb/);
          }
        }
      ), { numRuns: 100 });
    });

    it('should have mobile-specific configuration preserved', () => {
      // **Feature: external-sdk-transformation, Property 7: Environment Variable Preservation**
      fc.assert(fc.property(
        fc.constant('apps/mobile'),
        (appPath) => {
          const envPath = path.join(appPath, '.env.development');
          
          if (!fileExists(envPath)) {
            return true;
          }
          
          const envContent = readFileContent(envPath);
          
          // For mobile application, should use EXPO_PUBLIC_ prefix for public variables
          const expoPublicMatches = envContent.match(/EXPO_PUBLIC_/g);
          expect(expoPublicMatches).toBeTruthy();
          expect(expoPublicMatches!.length).toBeGreaterThan(3);
          
          // Should NOT have server-side variables
          expect(envContent).not.toMatch(/MONGODB_URI=/);
          expect(envContent).not.toMatch(/NEXTAUTH_SECRET=/);
        }
      ), { numRuns: 100 });
    });

    it('should have environment template files as reference', () => {
      // **Feature: external-sdk-transformation, Property 7: Environment Variable Preservation**
      fc.assert(fc.property(
        fc.constantFrom(...APPLICATIONS),
        (appPath) => {
          const templatePath = path.join(appPath, '.env.template');
          
          // For any application, should have template file as reference
          expect(fileExists(templatePath)).toBe(true);
          
          if (fileExists(templatePath)) {
            const templateContent = readFileContent(templatePath);
            
            // Template should contain documentation sections
            expect(templateContent).toMatch(/Configuration/);
            expect(templateContent).toMatch(/REQUIRED|OPTIONAL/);
          }
        }
      ), { numRuns: 100 });
    });

    it('should maintain environment validation logic', () => {
      // **Feature: external-sdk-transformation, Property 7: Environment Variable Preservation**
      fc.assert(fc.property(
        fc.constantFrom(...APPLICATIONS),
        (appPath) => {
          const envTsPath = path.join(appPath, 'src/lib/env.ts');
          
          if (!fileExists(envTsPath)) {
            return true;
          }
          
          const envTsContent = readFileContent(envTsPath);
          
          // For any application with env.ts, should have validation functions
          expect(envTsContent).toMatch(/getEnv|getEnvConfig/);
          
          if (appPath === 'apps/web') {
            expect(envTsContent).toMatch(/validateEnv/);
            expect(envTsContent).toMatch(/isProviderEnabled/);
          }
          
          if (appPath === 'apps/mobile') {
            expect(envTsContent).toMatch(/getAuthConfig/);
            expect(envTsContent).toMatch(/getApiUrl/);
          }
        }
      ), { numRuns: 100 });
    });

  });
});