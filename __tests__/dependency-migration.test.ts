/**
 * Property-based tests for dependency migration functionality
 * **Feature: external-sdk-transformation, Property 6: Dependency Migration Completeness**
 * **Validates: Requirements 4.1, 4.2**
 */

import fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

// Application package information interface
interface AppPackageInfo {
  name: string;
  version: string;
  private?: boolean;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

// Applications to test
const APP_PACKAGES = [
  'apps/web',
  'apps/mobile'
];

// Expected @megamercado packages that should replace @retia packages
const EXPECTED_MEGAMERCADO_PACKAGES = [
  '@megamercado/auth',
  '@megamercado/api', 
  '@megamercado/ui',
  '@megamercado/configs'
];

// Legacy @retia packages that should be removed
const LEGACY_RETIA_PACKAGES = [
  '@retia/database',
  '@retia/types',
  '@retia/ui',
  '@retia/utils'
];

// Utility functions
function loadAppPackageJson(appPath: string): AppPackageInfo {
  const packageJsonPath = path.join(appPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`Package.json not found at ${packageJsonPath}`);
  }
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
}

function getAllDependencies(packageInfo: AppPackageInfo): Record<string, string> {
  return {
    ...packageInfo.dependencies,
    ...packageInfo.devDependencies,
    ...packageInfo.peerDependencies
  };
}

function hasWorkspaceReferences(dependencies: Record<string, string>): boolean {
  return Object.values(dependencies).some(version => version === '*' || version.includes('workspace:'));
}

function hasLegacyRetiaPackages(dependencies: Record<string, string>): boolean {
  return Object.keys(dependencies).some(packageName => 
    LEGACY_RETIA_PACKAGES.includes(packageName)
  );
}

function hasMegamercadoPackages(dependencies: Record<string, string>): boolean {
  return Object.keys(dependencies).some(packageName => 
    packageName.startsWith('@megamercado/')
  );
}

function isValidVersionRange(version: string): boolean {
  // Check for valid npm version ranges (^1.0.0, ~1.0.0, 1.0.0, >=1.0.0, etc.)
  const versionRangeRegex = /^(\^|~|>=|>|<=|<|=)?(\d+\.\d+\.\d+)(-[a-zA-Z0-9-]+)?(\+[a-zA-Z0-9-]+)?$/;
  return versionRangeRegex.test(version);
}

function checkNpmrcExists(appPath: string): boolean {
  const npmrcPath = path.join(appPath, '.npmrc');
  return fs.existsSync(npmrcPath);
}

function validateNpmrcContent(appPath: string): boolean {
  const npmrcPath = path.join(appPath, '.npmrc');
  if (!fs.existsSync(npmrcPath)) {
    return false;
  }
  
  const content = fs.readFileSync(npmrcPath, 'utf8');
  
  // Should contain GitHub Packages registry configuration for @megamercado scope
  const hasMegamercadoRegistry = content.includes('@megamercado:registry=https://npm.pkg.github.com');
  const hasAuthToken = content.includes('//npm.pkg.github.com/:_authToken=');
  const hasFallbackRegistry = content.includes('registry=https://registry.npmjs.org/');
  
  return hasMegamercadoRegistry && hasAuthToken && hasFallbackRegistry;
}

describe('Dependency Migration Property Tests', () => {
  describe('Property 6: Dependency Migration Completeness', () => {
    it('should replace all workspace references with external package versions', () => {
      // **Feature: external-sdk-transformation, Property 6: Dependency Migration Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...APP_PACKAGES),
        (appPath) => {
          const packageInfo = loadAppPackageJson(appPath);
          const allDependencies = getAllDependencies(packageInfo);
          
          // For any application package.json, after migration all workspace references should be replaced
          expect(hasWorkspaceReferences(allDependencies)).toBe(false);
          
          // Should not contain any dependencies with "*" version (workspace reference)
          Object.entries(allDependencies).forEach(([packageName, version]) => {
            expect(version).not.toBe('*');
            expect(version).not.toContain('workspace:');
          });
        }
      ), { numRuns: 100 });
    });

    it('should remove all legacy @retia package references', () => {
      // **Feature: external-sdk-transformation, Property 6: Dependency Migration Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...APP_PACKAGES),
        (appPath) => {
          const packageInfo = loadAppPackageJson(appPath);
          const allDependencies = getAllDependencies(packageInfo);
          
          // For any application, after migration no legacy @retia packages should remain
          expect(hasLegacyRetiaPackages(allDependencies)).toBe(false);
          
          // Explicitly check that none of the legacy packages are present
          LEGACY_RETIA_PACKAGES.forEach(legacyPackage => {
            expect(allDependencies[legacyPackage]).toBeUndefined();
          });
        }
      ), { numRuns: 100 });
    });

    it('should include appropriate @megamercado packages', () => {
      // **Feature: external-sdk-transformation, Property 6: Dependency Migration Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...APP_PACKAGES),
        (appPath) => {
          const packageInfo = loadAppPackageJson(appPath);
          const allDependencies = getAllDependencies(packageInfo);
          
          // For any application, after migration should include @megamercado packages
          expect(hasMegamercadoPackages(allDependencies)).toBe(true);
          
          // Should have at least one @megamercado package
          const megamercadoPackages = Object.keys(allDependencies).filter(packageName => 
            packageName.startsWith('@megamercado/')
          );
          expect(megamercadoPackages.length).toBeGreaterThan(0);
        }
      ), { numRuns: 100 });
    });

    it('should use valid version ranges for @megamercado packages', () => {
      // **Feature: external-sdk-transformation, Property 6: Dependency Migration Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...APP_PACKAGES),
        (appPath) => {
          const packageInfo = loadAppPackageJson(appPath);
          const allDependencies = getAllDependencies(packageInfo);
          
          // For any @megamercado package dependency, version should be a valid range
          Object.entries(allDependencies).forEach(([packageName, version]) => {
            if (packageName.startsWith('@megamercado/')) {
              expect(isValidVersionRange(version)).toBe(true);
              
              // Should use caret range for automatic minor updates (^1.0.0)
              expect(version).toMatch(/^\^1\.\d+\.\d+$/);
            }
          });
        }
      ), { numRuns: 100 });
    });

    it('should have proper .npmrc configuration for GitHub Packages', () => {
      // **Feature: external-sdk-transformation, Property 6: Dependency Migration Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...APP_PACKAGES),
        (appPath) => {
          // For any application, .npmrc file should exist and be properly configured
          expect(checkNpmrcExists(appPath)).toBe(true);
          expect(validateNpmrcContent(appPath)).toBe(true);
        }
      ), { numRuns: 100 });
    });

    it('should maintain application-specific dependencies', () => {
      // **Feature: external-sdk-transformation, Property 6: Dependency Migration Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...APP_PACKAGES),
        (appPath) => {
          const packageInfo = loadAppPackageJson(appPath);
          const allDependencies = getAllDependencies(packageInfo);
          
          // For any application, should maintain its specific dependencies
          if (appPath === 'apps/web') {
            // Web app should have Next.js and related dependencies
            expect(allDependencies['next']).toBeDefined();
            expect(allDependencies['react']).toBeDefined();
            expect(allDependencies['react-dom']).toBeDefined();
            expect(allDependencies['next-auth']).toBeDefined();
          }
          
          if (appPath === 'apps/mobile') {
            // Mobile app should have Expo and React Native dependencies
            expect(allDependencies['expo']).toBeDefined();
            expect(allDependencies['react']).toBeDefined();
            expect(allDependencies['react-native']).toBeDefined();
            expect(allDependencies['@react-navigation/native']).toBeDefined();
          }
        }
      ), { numRuns: 100 });
    });

    it('should have consistent @megamercado package versions across apps', () => {
      // **Feature: external-sdk-transformation, Property 6: Dependency Migration Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...EXPECTED_MEGAMERCADO_PACKAGES),
        (megamercadoPackage) => {
          const appVersions: string[] = [];
          
          APP_PACKAGES.forEach(appPath => {
            const packageInfo = loadAppPackageJson(appPath);
            const allDependencies = getAllDependencies(packageInfo);
            
            if (allDependencies[megamercadoPackage]) {
              appVersions.push(allDependencies[megamercadoPackage]);
            }
          });
          
          // For any @megamercado package used by multiple apps, versions should be consistent
          if (appVersions.length > 1) {
            const firstVersion = appVersions[0];
            appVersions.forEach(version => {
              expect(version).toBe(firstVersion);
            });
          }
        }
      ), { numRuns: 100 });
    });

    it('should not have circular dependencies between apps and SDKs', () => {
      // **Feature: external-sdk-transformation, Property 6: Dependency Migration Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...APP_PACKAGES),
        (appPath) => {
          const packageInfo = loadAppPackageJson(appPath);
          const allDependencies = getAllDependencies(packageInfo);
          
          // For any application, should not depend on itself or other apps
          expect(allDependencies[packageInfo.name]).toBeUndefined();
          
          // Should not depend on other app packages
          APP_PACKAGES.forEach(otherAppPath => {
            const otherPackageInfo = loadAppPackageJson(otherAppPath);
            if (otherAppPath !== appPath) {
              expect(allDependencies[otherPackageInfo.name]).toBeUndefined();
            }
          });
        }
      ), { numRuns: 100 });
    });

    it('should preserve environment-specific configurations', () => {
      // **Feature: external-sdk-transformation, Property 6: Dependency Migration Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...APP_PACKAGES),
        (appPath) => {
          const packageInfo = loadAppPackageJson(appPath);
          
          // For any application, should maintain its specific configuration
          expect(packageInfo.name).toMatch(/^@megamercado\/(web|mobile)$/);
          expect(packageInfo.version).toBeDefined();
          expect(packageInfo.private).toBe(true);
          
          // Should have application-specific scripts
          expect(packageInfo.scripts).toBeDefined();
          expect(Object.keys(packageInfo.scripts!).length).toBeGreaterThan(0);
        }
      ), { numRuns: 100 });
    });

    it('should maintain proper dependency types (dependencies vs devDependencies)', () => {
      // **Feature: external-sdk-transformation, Property 6: Dependency Migration Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...APP_PACKAGES),
        (appPath) => {
          const packageInfo = loadAppPackageJson(appPath);
          
          // For any application, @megamercado packages should be in dependencies (not devDependencies)
          if (packageInfo.dependencies) {
            Object.keys(packageInfo.dependencies).forEach(packageName => {
              if (packageName.startsWith('@megamercado/')) {
                // Should not also be in devDependencies
                expect(packageInfo.devDependencies?.[packageName]).toBeUndefined();
                expect(packageInfo.peerDependencies?.[packageName]).toBeUndefined();
              }
            });
          }
          
          // TypeScript and build tools should remain in devDependencies
          if (packageInfo.devDependencies) {
            const buildToolPackages = ['typescript', '@types/node', '@types/react', 'eslint'];
            buildToolPackages.forEach(buildTool => {
              if (packageInfo.devDependencies![buildTool]) {
                expect(packageInfo.dependencies?.[buildTool]).toBeUndefined();
              }
            });
          }
        }
      ), { numRuns: 100 });
    });
  });

  describe('Migration Validation', () => {
    it('should have complete migration for all applications', () => {
      fc.assert(fc.property(
        fc.constant(APP_PACKAGES),
        (appPaths) => {
          // For all applications, migration should be complete
          appPaths.forEach(appPath => {
            const packageInfo = loadAppPackageJson(appPath);
            const allDependencies = getAllDependencies(packageInfo);
            
            // No workspace references
            expect(hasWorkspaceReferences(allDependencies)).toBe(false);
            
            // No legacy packages
            expect(hasLegacyRetiaPackages(allDependencies)).toBe(false);
            
            // Has @megamercado packages
            expect(hasMegamercadoPackages(allDependencies)).toBe(true);
            
            // Has .npmrc configuration
            expect(checkNpmrcExists(appPath)).toBe(true);
            expect(validateNpmrcContent(appPath)).toBe(true);
          });
        }
      ), { numRuns: 100 });
    });

    it('should maintain functional equivalence after migration', () => {
      fc.assert(fc.property(
        fc.constantFrom(...APP_PACKAGES),
        (appPath) => {
          const packageInfo = loadAppPackageJson(appPath);
          const allDependencies = getAllDependencies(packageInfo);
          
          // For any application, after migration should have equivalent functionality
          // This is validated by ensuring all necessary @megamercado packages are present
          
          if (appPath === 'apps/web') {
            // Web app needs auth, api, ui, and configs
            expect(allDependencies['@megamercado/auth']).toBeDefined();
            expect(allDependencies['@megamercado/api']).toBeDefined();
            expect(allDependencies['@megamercado/ui']).toBeDefined();
            expect(allDependencies['@megamercado/configs']).toBeDefined();
          }
          
          if (appPath === 'apps/mobile') {
            // Mobile app needs api and ui (auth is handled differently in mobile)
            expect(allDependencies['@megamercado/api']).toBeDefined();
            expect(allDependencies['@megamercado/ui']).toBeDefined();
          }
        }
      ), { numRuns: 100 });
    });
  });
});