/**
 * Property-based tests for mobile application cleanup functionality
 * **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
 * **Validates: Requirements 3.1, 3.2, 3.3**
 */

import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

// Mobile app files that should be cleaned up to use external SDKs
const MOBILE_APP_FILES = [
  'apps/mobile/src/lib/api.ts',
  'apps/mobile/src/lib/oauth.ts',
  'apps/mobile/package.json'
];

// Files that should import from @retia packages
const MOBILE_SOURCE_FILES = [
  'apps/mobile/src/lib/api.ts',
  'apps/mobile/src/lib/oauth.ts'
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

function hasLegacyPackageImports(content: string): boolean {
  // Check for local package imports (relative paths to packages/) in source files
  // For package.json, check for @retia dependencies, not the package name itself
  if (content.includes('"name"') && content.includes('"dependencies"')) {
    // This is a package.json file
    const packageJson = JSON.parse(content);
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    return Object.keys(allDeps).some(dep => dep.startsWith('@retia/'));
  }
  
  // For source files, check for relative package imports
  return content.includes('../../../../packages/') || 
         content.includes('../../../packages/') ||
         content.includes('../../packages/') ||
         content.includes('../packages/') ||
         content.includes("from '@retia/");
}

function hasRetiaImports(content: string): boolean {
  return content.includes('@retia-global/');
}

function hasValidMobileDependencies(packageJson: any): boolean {
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Should have @retia-global/api for validation schemas and utilities
  const hasRetiaApi = dependencies['@retia-global/api'];
  
  // Can have workspace references (we use workspace:* for local development)
  const hasValidRetiaDeps = Object.keys(dependencies).some(dep => 
    dep.startsWith('@retia-global/')
  );
  
  // Should not have legacy @retia packages (without -global)
  const hasLegacyRetia = Object.keys(dependencies).some(dep => 
    dep.startsWith('@retia/') && !dep.startsWith('@retia-global/')
  );
  
  return hasValidRetiaDeps && !hasLegacyRetia;
}

function hasValidMobileApiUsage(content: string): boolean {
  // Mobile apps should use HTTP endpoints, not direct database access
  const hasDirectDbAccess = content.includes('connectDB()') || 
                           content.includes('User.findOne(') ||
                           content.includes('User.create(');
  
  // Should use fetch or HTTP client for API calls
  const hasHttpCalls = content.includes('fetch(') || 
                      content.includes('axios(') ||
                      content.includes('http');
  
  return !hasDirectDbAccess && hasHttpCalls;
}

describe('Mobile App Cleanup Property Tests', () => {
  describe('Property 5: Application Cleanup Transformation', () => {
    
    it('should remove all legacy package imports from mobile app files', () => {
      // **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
      fc.assert(fc.property(
        fc.constantFrom(...MOBILE_APP_FILES),
        (filePath) => {
          if (!fileExists(filePath)) {
            // Skip test if file doesn't exist
            return true;
          }
          
          const content = readFileContent(filePath);
          
          // For any mobile app file, after cleanup should not contain legacy package imports
          expect(hasLegacyPackageImports(content)).toBe(false);
        }
      ), { numRuns: 100 });
    });

    it('should import validation schemas from @retia-global/api', () => {
      // **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
      fc.assert(fc.property(
        fc.constantFrom(...MOBILE_SOURCE_FILES),
        (filePath) => {
          if (!fileExists(filePath)) {
            // Skip test if file doesn't exist
            return true;
          }
          
          const content = readFileContent(filePath);
          
          // For mobile source files that use validation, should import from @retia-global/api
          if (content.includes('Schema') || content.includes('validate')) {
            expect(hasRetiaImports(content)).toBe(true);
            expect(content).toMatch(/@retia-global\/api/);
          }
        }
      ), { numRuns: 100 });
    });

    it('should have valid mobile dependencies in package.json', () => {
      // **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
      fc.assert(fc.property(
        fc.constant('apps/mobile/package.json'),
        (filePath) => {
          if (!fileExists(filePath)) {
            // Skip test if file doesn't exist
            return true;
          }
          
          const content = readFileContent(filePath);
          const packageJson = JSON.parse(content);
          
          // For mobile package.json, should have valid dependencies
          expect(hasValidMobileDependencies(packageJson)).toBe(true);
        }
      ), { numRuns: 100 });
    });

    it('should use HTTP API calls instead of direct database access', () => {
      // **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
      fc.assert(fc.property(
        fc.constantFrom(...MOBILE_SOURCE_FILES),
        (filePath) => {
          if (!fileExists(filePath)) {
            // Skip test if file doesn't exist
            return true;
          }
          
          const content = readFileContent(filePath);
          
          // For mobile API files, should use HTTP calls not direct database access
          if (filePath.includes('api.ts') || filePath.includes('service')) {
            expect(hasValidMobileApiUsage(content)).toBe(true);
          }
        }
      ), { numRuns: 100 });
    });

    it('should maintain mobile-specific functionality after cleanup', () => {
      // **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
      fc.assert(fc.property(
        fc.constant('apps/mobile'),
        (appPath) => {
          // For the mobile application, after cleanup should maintain mobile functionality
          
          // Check that essential mobile files exist
          const essentialFiles = [
            'apps/mobile/src/lib/api.ts',
            'apps/mobile/src/lib/oauth.ts',
            'apps/mobile/src/lib/secure-storage.ts',
            'apps/mobile/package.json'
          ];
          
          essentialFiles.forEach(file => {
            expect(fileExists(file)).toBe(true);
          });
          
          // Check package.json has mobile-specific dependencies
          const packageJsonPath = 'apps/mobile/package.json';
          if (fileExists(packageJsonPath)) {
            const packageJson = JSON.parse(readFileContent(packageJsonPath));
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
            
            // Should have mobile-specific packages
            expect(dependencies['expo']).toBeDefined();
            expect(dependencies['react-native']).toBeDefined();
            expect(dependencies['@retia-global/api']).toBeDefined();
            
            // Should not have web-specific packages as main dependencies
            expect(dependencies['next']).toBeUndefined();
            expect(dependencies['next-auth']).toBeUndefined();
          }
        }
      ), { numRuns: 100 });
    });

    it('should preserve mobile authentication flow', () => {
      // **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
      fc.assert(fc.property(
        fc.constant('apps/mobile/src/lib/api.ts'),
        (filePath) => {
          if (!fileExists(filePath)) {
            // Skip test if file doesn't exist
            return true;
          }
          
          const content = readFileContent(filePath);
          
          // For mobile API file, should preserve authentication methods
          expect(content).toMatch(/login.*function|async login/);
          expect(content).toMatch(/logout.*function|async logout/);
          expect(content).toMatch(/getProfile.*function|async getProfile/);
          
          // Should use mobile-specific endpoints
          expect(content).toMatch(/\/api\/mobile\/auth\//);
        }
      ), { numRuns: 100 });
    });

    it('should preserve OAuth functionality for mobile', () => {
      // **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
      fc.assert(fc.property(
        fc.constant('apps/mobile/src/lib/oauth.ts'),
        (filePath) => {
          if (!fileExists(filePath)) {
            // Skip test if file doesn't exist
            return true;
          }
          
          const content = readFileContent(filePath);
          
          // For mobile OAuth file, should preserve OAuth methods
          expect(content).toMatch(/loginWithGoogle|googleOAuth/);
          expect(content).toMatch(/loginWithFacebook|facebookOAuth/);
          
          // Should use Expo OAuth libraries
          expect(content).toMatch(/expo-auth-session|AuthSession/);
          expect(content).toMatch(/expo-web-browser|WebBrowser/);
        }
      ), { numRuns: 100 });
    });

    it('should not contain web-specific imports in mobile app', () => {
      // **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
      fc.assert(fc.property(
        fc.constantFrom(...MOBILE_SOURCE_FILES),
        (filePath) => {
          if (!fileExists(filePath)) {
            // Skip test if file doesn't exist
            return true;
          }
          
          const content = readFileContent(filePath);
          
          // For mobile source files, should not contain web-specific imports
          expect(content).not.toMatch(/next\/|next-auth/);
          expect(content).not.toMatch(/react-dom/);
          expect(content).not.toMatch(/document\.|window\./);
        }
      ), { numRuns: 100 });
    });

  });
});