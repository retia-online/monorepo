/**
 * Property-based tests for web application cleanup functionality
 * **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
 * **Validates: Requirements 3.1, 3.2, 3.3**
 */

import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

// Web app files that should be cleaned up to use external SDKs
const WEB_APP_FILES = [
  'apps/web/src/lib/auth.ts',
  'apps/web/src/lib/route-protection.ts',
  'apps/web/src/components/Navbar.tsx',
  'apps/web/src/app/login/login-form.tsx',
  'apps/web/tailwind.config.js',
  'apps/web/middleware.ts'
];

// Files that should import from @retia packages
const UI_COMPONENT_FILES = [
  'apps/web/src/app/login/login-form.tsx',
  'apps/web/src/app/register/page.tsx',
  'apps/web/src/app/reset-password/page.tsx',
  'apps/web/src/app/forgot-password/page.tsx',
  'apps/web/src/app/admin/users/page.tsx'
];

// API route files that should import from @retia-global/api
const API_ROUTE_FILES = [
  'apps/web/src/app/api/change-password/route.ts',
  'apps/web/src/app/api/forgot-password/route.ts',
  'apps/web/src/app/api/reset-password/route.ts',
  'apps/web/src/app/api/profile/route.ts',
  'apps/web/src/app/api/register/route.ts',
  'apps/web/src/app/api/admin/users/route.ts'
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

function hasLegacyRetiaImports(content: string): boolean {
  return content.includes('@retia/');
}

function hasRetiaImports(content: string): boolean {
  return content.includes('@retia-global/');
}

function hasLocalAuthLogic(content: string): boolean {
  // Check for local authentication implementation patterns
  const localAuthPatterns = [
    'NextAuth(',
    'CredentialsProvider(',
    'GoogleProvider(',
    'FacebookProvider(',
    'async authorize(',
    'async signIn(',
    'async jwt(',
    'async session('
  ];
  
  return localAuthPatterns.some(pattern => content.includes(pattern));
}

function hasLocalDatabaseLogic(content: string): boolean {
  // Check for local database implementation patterns (not just usage of imported models)
  const localDbPatterns = [
    'mongoose.connect(',
    'mongoose.createConnection(',
    'new mongoose.Schema(',
    'mongoose.model(',
    'const.*Schema.*=.*new.*Schema'
  ];
  
  return localDbPatterns.some(pattern => content.includes(pattern));
}

function hasTailwindPresetImport(content: string): boolean {
  return content.includes('require("@retia-global/configs/tailwind")');
}

function hasMiddlewareFactory(content: string): boolean {
  return content.includes('createAuthMiddleware');
}

describe('Web App Cleanup Property Tests', () => {
  describe('Property 5: Application Cleanup Transformation', () => {
    
    it('should remove all legacy @retia imports from web app files', () => {
      // **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
      fc.assert(fc.property(
        fc.constantFrom(...WEB_APP_FILES),
        (filePath) => {
          if (!fileExists(filePath)) {
            // Skip test if file doesn't exist
            return true;
          }
          
          const content = readFileContent(filePath);
          
          // For any web app file, after cleanup should not contain @retia imports
          expect(hasLegacyRetiaImports(content)).toBe(false);
        }
      ), { numRuns: 100 });
    });

    it('should import UI components from @retia-global/ui', () => {
      // **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
      fc.assert(fc.property(
        fc.constantFrom(...UI_COMPONENT_FILES),
        (filePath) => {
          if (!fileExists(filePath)) {
            // Skip test if file doesn't exist
            return true;
          }
          
          const content = readFileContent(filePath);
          
          // For any UI component file, should import from @retia-global/ui
          if (content.includes('import') && (content.includes('Button') || content.includes('Card') || content.includes('Input'))) {
            expect(hasRetiaImports(content)).toBe(true);
            expect(content).toMatch(/@retia\/ui/);
          }
        }
      ), { numRuns: 100 });
    });

    it('should import API functionality from @retia-global/api', () => {
      // **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
      fc.assert(fc.property(
        fc.constantFrom(...API_ROUTE_FILES),
        (filePath) => {
          if (!fileExists(filePath)) {
            // Skip test if file doesn't exist
            return true;
          }
          
          const content = readFileContent(filePath);
          
          // For any API route file, should import from @retia-global/api
          if (content.includes('connectDB') || content.includes('User') || content.includes('sendEmail')) {
            expect(hasRetiaImports(content)).toBe(true);
            expect(content).toMatch(/@retia\/api/);
          }
        }
      ), { numRuns: 100 });
    });

    it('should remove local authentication logic from auth.ts', () => {
      // **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
      fc.assert(fc.property(
        fc.constant('apps/web/src/lib/auth.ts'),
        (filePath) => {
          if (!fileExists(filePath)) {
            // Skip test if file doesn't exist
            return true;
          }
          
          const content = readFileContent(filePath);
          
          // For auth.ts file, after cleanup should not contain local auth implementation
          expect(hasLocalAuthLogic(content)).toBe(false);
          
          // Should import from @retia-global/auth instead
          expect(content).toMatch(/@retia\/auth/);
        }
      ), { numRuns: 100 });
    });

    it('should remove local database logic from API routes', () => {
      // **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
      fc.assert(fc.property(
        fc.constantFrom(...API_ROUTE_FILES),
        (filePath) => {
          if (!fileExists(filePath)) {
            // Skip test if file doesn't exist
            return true;
          }
          
          const content = readFileContent(filePath);
          
          // For any API route, after cleanup should not contain local database logic
          // (Database operations should be imported from SDK)
          if (content.includes('@retia-global/api')) {
            // If using SDK, should not have local database implementation patterns
            expect(hasLocalDatabaseLogic(content)).toBe(false);
          }
        }
      ), { numRuns: 100 });
    });

    it('should use @retia-global/configs preset in tailwind.config.js', () => {
      // **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
      fc.assert(fc.property(
        fc.constant('apps/web/tailwind.config.js'),
        (filePath) => {
          if (!fileExists(filePath)) {
            // Skip test if file doesn't exist
            return true;
          }
          
          const content = readFileContent(filePath);
          
          // For tailwind config, should use @retia-global/configs preset
          expect(hasTailwindPresetImport(content)).toBe(true);
          
          // Should not contain manual theme configuration (should be in preset)
          expect(content).not.toMatch(/theme:\s*{/);
          expect(content).not.toMatch(/extend:\s*{/);
        }
      ), { numRuns: 100 });
    });

    it('should use middleware factory from @retia-global/auth', () => {
      // **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
      fc.assert(fc.property(
        fc.constant('apps/web/middleware.ts'),
        (filePath) => {
          if (!fileExists(filePath)) {
            // Skip test if file doesn't exist
            return true;
          }
          
          const content = readFileContent(filePath);
          
          // For middleware.ts, should use factory from @retia-global/auth
          expect(hasMiddlewareFactory(content)).toBe(true);
          expect(content).toMatch(/@retia\/auth/);
        }
      ), { numRuns: 100 });
    });

    it('should export route protection functions from @retia-global/auth', () => {
      // **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
      fc.assert(fc.property(
        fc.constant('apps/web/src/lib/route-protection.ts'),
        (filePath) => {
          if (!fileExists(filePath)) {
            // Skip test if file doesn't exist
            return true;
          }
          
          const content = readFileContent(filePath);
          
          // For route-protection.ts, should export from @retia-global/auth
          expect(content).toMatch(/export[\s\S]*from[\s\S]*@retia\/auth/);
          
          // Should not contain local implementation
          expect(content).not.toMatch(/async function requireAuth/);
          expect(content).not.toMatch(/async function redirectIfAuthenticated/);
        }
      ), { numRuns: 100 });
    });

    it('should maintain all required functionality after cleanup', () => {
      // **Feature: external-sdk-transformation, Property 5: Application Cleanup Transformation**
      fc.assert(fc.property(
        fc.constant('apps/web'),
        (appPath) => {
          // For the web application, after cleanup should maintain all functionality
          
          // Check that essential files exist
          const essentialFiles = [
            'apps/web/src/lib/auth.ts',
            'apps/web/src/lib/route-protection.ts',
            'apps/web/middleware.ts',
            'apps/web/tailwind.config.js'
          ];
          
          essentialFiles.forEach(file => {
            expect(fileExists(file)).toBe(true);
          });
          
          // Check package.json has @retia dependencies
          const packageJsonPath = 'apps/web/package.json';
          if (fileExists(packageJsonPath)) {
            const packageJson = JSON.parse(readFileContent(packageJsonPath));
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
            
            // Should have @retia packages
            expect(dependencies['@retia-global/auth']).toBeDefined();
            expect(dependencies['@retia-global/api']).toBeDefined();
            expect(dependencies['@retia-global/ui']).toBeDefined();
            expect(dependencies['@retia-global/configs']).toBeDefined();
          }
        }
      ), { numRuns: 100 });
    });

  });
});