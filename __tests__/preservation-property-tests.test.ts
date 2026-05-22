/**
 * Preservation Property Tests for Remove External Package Dependencies
 * **Feature: remove-external-package-dependencies, Property 2: Preservation - Existing Functionality and Workspace Structure**
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 * 
 * IMPORTANT: Follow observation-first methodology
 * Observe behavior on UNFIXED code for non-buggy inputs: repository operations that do NOT involve resolving `@retia-global` packages from external registries
 * Write property-based tests capturing observed behavior patterns from Preservation Requirements: monorepo workspace structure, package.json dependency resolution, build scripts, authorized team member access
 * Property-based testing generates many test cases for stronger guarantees
 * Run tests on UNFIXED code
 * EXPECTED OUTCOME: Tests PASS (this confirms baseline behavior to preserve)
 * 
 * Preservation Requirements from design:
 * - Monorepo workspace structure must continue to support local package development and linking
 * - Package.json dependency resolution within the workspace must remain unchanged
 * - Build scripts must continue to build and test packages successfully
 * - The repository must continue to work for authorized team members with private registry access
 * - Package versioning and semantic versioning must remain unchanged
 * - All existing functionality in web and mobile apps must be preserved
 */

import fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Package information interface
interface PackageInfo {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  workspaces?: string[];
  scripts?: Record<string, string>;
  publishConfig?: {
    registry?: string;
    [key: string]: string | undefined;
  };
}

// Workspace package reference
interface WorkspacePackage {
  path: string;
  name: string;
  version: string;
  hasBuildScript: boolean;
  hasTestScript: boolean;
}

// Utility functions
function loadPackageJson(filePath: string): PackageInfo {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Package.json not found at ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getAllDependencies(packageInfo: PackageInfo): Record<string, string> {
  return {
    ...packageInfo.dependencies,
    ...packageInfo.devDependencies,
    ...packageInfo.peerDependencies
  };
}

function isRetiaGlobalPackage(packageName: string): boolean {
  return packageName.startsWith('@retia-global/');
}

function isWorkspaceReference(version: string): boolean {
  return version.includes('workspace:');
}

function getWorkspacePackages(): WorkspacePackage[] {
  const packages: WorkspacePackage[] = [];
  const packagesDir = 'packages';
  
  if (!fs.existsSync(packagesDir)) {
    return packages;
  }
  
  const packageDirs = fs.readdirSync(packagesDir);
  for (const packageDir of packageDirs) {
    const packageJsonPath = path.join(packagesDir, packageDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageInfo = loadPackageJson(packageJsonPath);
      packages.push({
        path: path.join(packagesDir, packageDir),
        name: packageInfo.name,
        version: packageInfo.version,
        hasBuildScript: !!(packageInfo.scripts && packageInfo.scripts.build),
        hasTestScript: !!(packageInfo.scripts && packageInfo.scripts.test)
      });
    }
  }
  
  return packages;
}

function getAppPackages(): WorkspacePackage[] {
  const apps: WorkspacePackage[] = [];
  const appsDir = 'apps';
  
  if (!fs.existsSync(appsDir)) {
    return apps;
  }
  
  const appDirs = fs.readdirSync(appsDir);
  for (const appDir of appDirs) {
    const packageJsonPath = path.join(appsDir, appDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageInfo = loadPackageJson(packageJsonPath);
      apps.push({
        path: path.join(appsDir, appDir),
        name: packageInfo.name,
        version: packageInfo.version,
        hasBuildScript: !!(packageInfo.scripts && packageInfo.scripts.build),
        hasTestScript: !!(packageInfo.scripts && packageInfo.scripts.test)
      });
    }
  }
  
  return apps;
}

function checkWorkspaceStructure(): boolean {
  const rootPackage = loadPackageJson('package.json');
  
  // Check if workspaces are defined
  if (!rootPackage.workspaces || !Array.isArray(rootPackage.workspaces)) {
    return false;
  }
  
  // Check workspace patterns
  const workspacePatterns = rootPackage.workspaces;
  const hasAppsPattern = workspacePatterns.some((pattern: string) => pattern.includes('apps/'));
  const hasPackagesPattern = workspacePatterns.some((pattern: string) => pattern.includes('packages/'));
  
  return hasAppsPattern && hasPackagesPattern;
}

function checkBuildScriptsExist(): boolean {
  const rootPackage = loadPackageJson('package.json');
  
  // Check for essential build scripts
  const requiredScripts = ['build', 'build:packages', 'build:web'];
  return requiredScripts.every(script => rootPackage.scripts && rootPackage.scripts[script]);
}

function checkNonRetiaDependencies(): string[] {
  const rootPackage = loadPackageJson('package.json');
  const allDeps = getAllDependencies(rootPackage);
  
  // Get non-@retia-global dependencies
  return Object.keys(allDeps).filter(packageName => !isRetiaGlobalPackage(packageName));
}

function checkAppNonRetiaDependencies(appPath: string): string[] {
  const appPackage = loadPackageJson(path.join(appPath, 'package.json'));
  const allDeps = getAllDependencies(appPackage);
  
  // Get non-@retia-global dependencies
  return Object.keys(allDeps).filter(packageName => !isRetiaGlobalPackage(packageName));
}

function checkPackageJsonFilesExist(): boolean {
  const requiredFiles = [
    'package.json',
    'apps/web/package.json',
    'apps/mobile/package.json',
    'packages/api/package.json',
    'packages/auth/package.json',
    'packages/ui/package.json',
    'packages/configs/package.json'
  ];
  
  return requiredFiles.every(filePath => fs.existsSync(filePath));
}

function checkTypeScriptConfigsExist(): boolean {
  const requiredFiles = [
    'tsconfig.json',
    'apps/web/tsconfig.json',
    'apps/mobile/tsconfig.json'
  ];
  
  return requiredFiles.every(filePath => fs.existsSync(filePath));
}

function checkEnvTemplateFilesExist(): boolean {
  const requiredFiles = [
    'apps/web/.env.template',
    'apps/mobile/.env.template'
  ];
  
  return requiredFiles.every(filePath => fs.existsSync(filePath));
}

function checkSourceCodeFilesExist(): boolean {
  const requiredDirs = [
    'apps/web/src',
    'apps/mobile/src',
    'packages/api/src',
    'packages/auth/src',
    'packages/ui/src'
  ];
  
  return requiredDirs.every(dirPath => fs.existsSync(dirPath));
}

describe('Preservation Property Tests', () => {
  describe('Property 2: Preservation - Existing Functionality and Workspace Structure', () => {
    
    // Test 1: Workspace structure preservation
    it('should preserve monorepo workspace structure', () => {
      // **Feature: remove-external-package-dependencies, Property 2: Preservation**
      // **Validates: Requirements 3.1**
      
      // For any repository state, the workspace structure should be preserved
      const hasWorkspaceStructure = checkWorkspaceStructure();
      expect(hasWorkspaceStructure).toBe(true);
      
      // Check workspace packages exist
      const workspacePackages = getWorkspacePackages();
      expect(workspacePackages.length).toBeGreaterThan(0);
      
      // Check app packages exist
      const appPackages = getAppPackages();
      expect(appPackages.length).toBeGreaterThan(0);
      
      // All workspace packages should have names
      workspacePackages.forEach(pkg => {
        expect(pkg.name).toBeTruthy();
        expect(pkg.version).toBeTruthy();
      });
      
      // All app packages should have names
      appPackages.forEach(app => {
        expect(app.name).toBeTruthy();
        expect(app.version).toBeTruthy();
      });
    });

    // Test 2: Build scripts preservation
    it('should preserve all build scripts', () => {
      // **Feature: remove-external-package-dependencies, Property 2: Preservation**
      // **Validates: Requirements 3.3**
      
      // For any repository state, build scripts should exist and be executable
      const hasBuildScripts = checkBuildScriptsExist();
      expect(hasBuildScripts).toBe(true);
      
      // Check workspace packages have build scripts
      const workspacePackages = getWorkspacePackages();
      const packagesWithBuildScripts = workspacePackages.filter(pkg => pkg.hasBuildScript);
      
      // At least some packages should have build scripts
      expect(packagesWithBuildScripts.length).toBeGreaterThan(0);
      
      // Check app packages have build scripts
      const appPackages = getAppPackages();
      const appsWithBuildScripts = appPackages.filter(app => app.hasBuildScript);
      
      // At least some apps should have build scripts
      expect(appsWithBuildScripts.length).toBeGreaterThan(0);
    });

    // Test 3: Non-@retia-global dependency preservation
    it('should preserve all non-@retia-global dependencies', () => {
      // **Feature: remove-external-package-dependencies, Property 2: Preservation**
      // **Validates: Requirements 3.2**
      
      // Property-based test: For any non-@retia-global dependency, it should be preserved
      fc.assert(fc.property(
        fc.constantFrom('root', 'web', 'mobile'),
        (packageType) => {
          let nonRetiaDeps: string[];
          
          if (packageType === 'root') {
            nonRetiaDeps = checkNonRetiaDependencies();
          } else if (packageType === 'web') {
            nonRetiaDeps = checkAppNonRetiaDependencies('apps/web');
          } else {
            nonRetiaDeps = checkAppNonRetiaDependencies('apps/mobile');
          }
          
          // For any package type, there should be non-@retia-global dependencies
          expect(nonRetiaDeps.length).toBeGreaterThan(0);
          
          // All non-@retia-global dependencies should have valid names
          nonRetiaDeps.forEach(dep => {
            expect(dep).toBeTruthy();
            expect(dep).not.toMatch(/^@retia-global\//);
          });
        }
      ), { numRuns: 10 });
    });

    // Test 4: Package.json file preservation
    it('should preserve all package.json files', () => {
      // **Feature: remove-external-package-dependencies, Property 2: Preservation**
      // **Validates: Requirements 3.2**
      
      // For any repository state, all package.json files should exist
      const hasPackageJsonFiles = checkPackageJsonFilesExist();
      expect(hasPackageJsonFiles).toBe(true);
      
      // All package.json files should be valid JSON
      const packageJsonFiles = [
        'package.json',
        'apps/web/package.json',
        'apps/mobile/package.json',
        'packages/api/package.json',
        'packages/auth/package.json',
        'packages/ui/package.json',
        'packages/configs/package.json'
      ];
      
      packageJsonFiles.forEach(filePath => {
        const content = fs.readFileSync(filePath, 'utf8');
        const packageInfo = JSON.parse(content);
        
        // Basic package.json validation
        expect(packageInfo.name).toBeTruthy();
        expect(packageInfo.version).toBeTruthy();
      });
    });

    // Test 5: TypeScript configuration preservation
    it('should preserve TypeScript configuration files', () => {
      // **Feature: remove-external-package-dependencies, Property 2: Preservation**
      // **Validates: Requirements 3.3**
      
      // For any repository state, TypeScript configs should exist
      const hasTypeScriptConfigs = checkTypeScriptConfigsExist();
      expect(hasTypeScriptConfigs).toBe(true);
      
      // Check tsconfig.json exists and has basic structure
      const rootTsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      expect(rootTsConfig.compilerOptions).toBeTruthy();
      
      // Check app tsconfig files exist
      const webTsConfig = JSON.parse(fs.readFileSync('apps/web/tsconfig.json', 'utf8'));
      expect(webTsConfig.compilerOptions).toBeTruthy();
      
      const mobileTsConfig = JSON.parse(fs.readFileSync('apps/mobile/tsconfig.json', 'utf8'));
      expect(mobileTsConfig.compilerOptions).toBeTruthy();
    });

    // Test 6: Environment template preservation
    it('should preserve environment template files', () => {
      // **Feature: remove-external-package-dependencies, Property 2: Preservation**
      // **Validates: Requirements 3.3**
      
      // For any repository state, environment template files should exist
      const hasEnvTemplates = checkEnvTemplateFilesExist();
      expect(hasEnvTemplates).toBe(true);
      
      // Check template files have content
      const webTemplate = fs.readFileSync('apps/web/.env.template', 'utf8');
      expect(webTemplate).toBeTruthy();
      expect(webTemplate.length).toBeGreaterThan(0);
      
      const mobileTemplate = fs.readFileSync('apps/mobile/.env.template', 'utf8');
      expect(mobileTemplate).toBeTruthy();
      expect(mobileTemplate.length).toBeGreaterThan(0);
    });

    // Test 7: Source code preservation
    it('should preserve all source code directories and files', () => {
      // **Feature: remove-external-package-dependencies, Property 2: Preservation**
      // **Validates: Requirements 3.5**
      
      // For any repository state, source code directories should exist
      const hasSourceCode = checkSourceCodeFilesExist();
      expect(hasSourceCode).toBe(true);
      
      // Check that key source files exist
      const keySourceFiles = [
        'apps/web/src/app/page.tsx',
        'apps/mobile/src/App.tsx',
        'packages/api/src/index.ts',
        'packages/auth/src/index.ts',
        'packages/ui/src/index.ts'
      ];
      
      // At least some key source files should exist
      const existingSourceFiles = keySourceFiles.filter(filePath => fs.existsSync(filePath));
      expect(existingSourceFiles.length).toBeGreaterThan(0);
    });

    // Test 8: Semantic versioning preservation
    it('should preserve semantic versioning in all packages', () => {
      // **Feature: remove-external-package-dependencies, Property 2: Preservation**
      // **Validates: Requirements 3.5**
      
      // Property-based test: For any package, version should follow semantic versioning
      fc.assert(fc.property(
        fc.constantFrom(...getWorkspacePackages(), ...getAppPackages()),
        (pkg) => {
          // For any package, version should be valid semver
          const semverRegex = /^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/;
          expect(pkg.version).toMatch(semverRegex);
        }
      ), { numRuns: 20 });
    });

    // Test 9: Test script preservation
    it('should preserve test scripts and configuration', () => {
      // **Feature: remove-external-package-dependencies, Property 2: Preservation**
      // **Validates: Requirements 3.3**
      
      // Check root test script exists
      const rootPackage = loadPackageJson('package.json');
      expect(rootPackage.scripts?.test).toBeTruthy();
      
      // Check test directory exists
      expect(fs.existsSync('__tests__')).toBe(true);
      
      // Check some test files exist
      const testFiles = fs.readdirSync('__tests__');
      expect(testFiles.length).toBeGreaterThan(0);
      
      // Check that test files have .test.ts extension
      const hasTestFiles = testFiles.some(file => file.endsWith('.test.ts'));
      expect(hasTestFiles).toBe(true);
    });

    // Test 10: Documentation preservation
    it('should preserve documentation files', () => {
      // **Feature: remove-external-package-dependencies, Property 2: Preservation**
      // **Validates: Requirements 3.5**
      
      // Check key documentation files exist
      const docsFiles = [
        'README.md',
        'QUICKSTART.md',
        'ENVIRONMENT.md'
      ];
      
      const existingDocs = docsFiles.filter(filePath => fs.existsSync(filePath));
      
      // At least some documentation should exist
      expect(existingDocs.length).toBeGreaterThan(0);
      
      // Check README has content
      if (fs.existsSync('README.md')) {
        const readmeContent = fs.readFileSync('README.md', 'utf8');
        expect(readmeContent.length).toBeGreaterThan(0);
      }
    });

    // Test 11: Property-based test for workspace package consistency
    it('should maintain consistent workspace package structure', () => {
      // **Feature: remove-external-package-dependencies, Property 2: Preservation**
      // **Validates: Requirements 3.1, 3.2**
      
      fc.assert(fc.property(
        fc.constantFrom(...getWorkspacePackages()),
        (workspacePackage) => {
          // For any workspace package, it should have:
          // 1. A valid package.json
          const packageJsonPath = path.join(workspacePackage.path, 'package.json');
          expect(fs.existsSync(packageJsonPath)).toBe(true);
          
          const packageInfo = loadPackageJson(packageJsonPath);
          
          // 2. A name matching the directory structure
          expect(packageInfo.name).toBe(workspacePackage.name);
          
          // 3. A version
          expect(packageInfo.version).toBe(workspacePackage.version);
          
          // 4. Either build script or test script (or both)
          expect(workspacePackage.hasBuildScript || workspacePackage.hasTestScript).toBe(true);
        }
      ), { numRuns: 20 });
    });

    // Test 12: Property-based test for app package consistency
    it('should maintain consistent app package structure', () => {
      // **Feature: remove-external-package-dependencies, Property 2: Preservation**
      // **Validates: Requirements 3.1, 3.2**
      
      fc.assert(fc.property(
        fc.constantFrom(...getAppPackages()),
        (appPackage) => {
          // For any app package, it should have:
          // 1. A valid package.json
          const packageJsonPath = path.join(appPackage.path, 'package.json');
          expect(fs.existsSync(packageJsonPath)).toBe(true);
          
          const packageInfo = loadPackageJson(packageJsonPath);
          
          // 2. A name
          expect(packageInfo.name).toBe(appPackage.name);
          
          // 3. A version
          expect(packageInfo.version).toBe(appPackage.version);
          
          // 4. Dependencies
          const allDeps = getAllDependencies(packageInfo);
          expect(Object.keys(allDeps).length).toBeGreaterThan(0);
        }
      ), { numRuns: 10 });
    });

    // Test 13: Check for existing functionality markers
    it('should preserve markers of existing functionality', () => {
      // **Feature: remove-external-package-dependencies, Property 2: Preservation**
      // **Validates: Requirements 3.5**
      
      // Check for authentication functionality
      const authFilesExist = fs.existsSync('packages/auth/src') && 
                            fs.existsSync('apps/web/src/app/api/auth');
      expect(authFilesExist).toBe(true);
      
      // Check for API functionality
      const apiFilesExist = fs.existsSync('packages/api/src') &&
                           fs.existsSync('apps/web/src/app/api');
      expect(apiFilesExist).toBe(true);
      
      // Check for UI components
      const uiFilesExist = fs.existsSync('packages/ui/src') &&
                          fs.existsSync('apps/web/src/components');
      expect(uiFilesExist).toBe(true);
      
      // Check for mobile app structure
      const mobileAppExists = fs.existsSync('apps/mobile/App.tsx') &&
                             fs.existsSync('apps/mobile/src/screens');
      expect(mobileAppExists).toBe(true);
    });

    // Test 14: Property-based test for dependency resolution patterns
    it('should preserve dependency resolution patterns for non-@retia-global packages', () => {
      // **Feature: remove-external-package-dependencies, Property 2: Preservation**
      // **Validates: Requirements 3.2**
      
      fc.assert(fc.property(
        fc.constantFrom('root', 'web', 'mobile'),
        (packageType) => {
          let packageInfo: PackageInfo;
          
          if (packageType === 'root') {
            packageInfo = loadPackageJson('package.json');
          } else if (packageType === 'web') {
            packageInfo = loadPackageJson('apps/web/package.json');
          } else {
            packageInfo = loadPackageJson('apps/mobile/package.json');
          }
          
          const allDeps = getAllDependencies(packageInfo);
          const nonRetiaDeps = Object.keys(allDeps).filter(dep => !isRetiaGlobalPackage(dep));
          
          // For any package type, non-@retia-global dependencies should have valid version ranges
          nonRetiaDeps.forEach(dep => {
            const version = allDeps[dep];
            expect(version).toBeTruthy();
            
            // Version should be a valid npm version range
            // Common patterns: ^1.0.0, ~1.0.0, 1.0.0, *, etc.
            const versionRegex = /^[\^~]?\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$|^\*$|^workspace:/;
            expect(version).toMatch(versionRegex);
          });
        }
      ), { numRuns: 10 });
    });

    // Test 15: Final preservation validation
    it('should validate overall preservation of repository structure and functionality', () => {
      // **Feature: remove-external-package-dependencies, Property 2: Preservation**
      // **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
      
      console.log('=== PRESERVATION VALIDATION SUMMARY ===');
      console.log('');
      
      // Workspace structure
      const workspaceStructure = checkWorkspaceStructure();
      console.log(`1. Workspace structure: ${workspaceStructure ? 'PRESERVED' : 'MISSING'}`);
      
      // Build scripts
      const buildScripts = checkBuildScriptsExist();
      console.log(`2. Build scripts: ${buildScripts ? 'PRESERVED' : 'MISSING'}`);
      
      // Package.json files
      const packageJsonFiles = checkPackageJsonFilesExist();
      console.log(`3. Package.json files: ${packageJsonFiles ? 'PRESERVED' : 'MISSING'}`);
      
      // TypeScript configs
      const tsConfigs = checkTypeScriptConfigsExist();
      console.log(`4. TypeScript configs: ${tsConfigs ? 'PRESERVED' : 'MISSING'}`);
      
      // Source code
      const sourceCode = checkSourceCodeFilesExist();
      console.log(`5. Source code directories: ${sourceCode ? 'PRESERVED' : 'MISSING'}`);
      
      // Workspace packages
      const workspacePackages = getWorkspacePackages();
      console.log(`6. Workspace packages: ${workspacePackages.length} found`);
      
      // App packages
      const appPackages = getAppPackages();
      console.log(`7. App packages: ${appPackages.length} found`);
      
      // Non-@retia-global dependencies in root
      const nonRetiaDeps = checkNonRetiaDependencies();
      console.log(`8. Non-@retia-global dependencies in root: ${nonRetiaDeps.length} found`);
      
      console.log('');
      console.log('=== PRESERVATION STATUS ===');
      console.log('All non-@retia-global functionality should be preserved.');
      console.log('These tests PASSING confirms baseline behavior to preserve.');
      
      // Overall validation
      const overallPreservation = workspaceStructure && 
                                 buildScripts && 
                                 packageJsonFiles && 
                                 tsConfigs && 
                                 sourceCode &&
                                 workspacePackages.length > 0 &&
                                 appPackages.length > 0;
      
      expect(overallPreservation).toBe(true);
    });

  });
});
