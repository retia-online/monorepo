/**
 * Property-based tests for package publishing functionality
 * **Feature: external-sdk-transformation, Property 2: Semantic Versioning Compliance**
 * **Feature: external-sdk-transformation, Property 3: Package Metadata Completeness**
 * **Feature: external-sdk-transformation, Property 4: TypeScript Declaration Generation**
 * **Validates: Requirements 2.2, 2.3, 2.4**
 */

import fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

// Package information interface
interface PackageInfo {
  name: string;
  version: string;
  description: string;
  main: string;
  types?: string;
  files: string[];
  publishConfig?: {
    registry: string;
    [key: string]: string;
  };
  repository?: {
    type: string;
    url: string;
  };
  keywords?: string[];
  author?: string;
  license?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

// SDK packages to test
const SDK_PACKAGES = [
  'packages/auth',
  'packages/api', 
  'packages/ui-sdk',
  'packages/configs'
];

// Utility functions
function loadPackageJson(packagePath: string): PackageInfo {
  const packageJsonPath = path.join(packagePath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`Package.json not found at ${packageJsonPath}`);
  }
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
}

function isValidSemver(version: string): boolean {
  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*|[0-9a-zA-Z-]*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*|[0-9a-zA-Z-]*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return semverRegex.test(version);
}

function hasTypeScriptDeclarations(packagePath: string, packageInfo: PackageInfo): boolean {
  if (!packageInfo.types) {
    return false;
  }
  
  const typesPath = path.join(packagePath, packageInfo.types);
  return fs.existsSync(typesPath);
}

function getRequiredMetadataFields(): (keyof PackageInfo)[] {
  return ['name', 'version', 'description', 'main', 'files', 'publishConfig', 'repository', 'keywords', 'author', 'license'];
}

describe('Package Publishing Property Tests', () => {
  describe('Property 2: Semantic Versioning Compliance', () => {
    it('should have valid semantic version for all SDK packages', () => {
      // **Feature: external-sdk-transformation, Property 2: Semantic Versioning Compliance**
      fc.assert(fc.property(
        fc.constantFrom(...SDK_PACKAGES),
        (packagePath) => {
          const packageInfo = loadPackageJson(packagePath);
          
          // For any SDK package, the version should follow semantic versioning format
          expect(isValidSemver(packageInfo.version)).toBe(true);
          
          // Version should be parseable into major.minor.patch components
          const versionParts = packageInfo.version.split('.');
          expect(versionParts).toHaveLength(3);
          
          const [major, minor, patch] = versionParts.map(Number);
          expect(major).toBeGreaterThanOrEqual(0);
          expect(minor).toBeGreaterThanOrEqual(0);
          expect(patch).toBeGreaterThanOrEqual(0);
          
          // Version components should be integers
          expect(Number.isInteger(major)).toBe(true);
          expect(Number.isInteger(minor)).toBe(true);
          expect(Number.isInteger(patch)).toBe(true);
        }
      ), { numRuns: 100 });
    });

    it('should maintain semantic versioning format across version increments', () => {
      // **Feature: external-sdk-transformation, Property 2: Semantic Versioning Compliance**
      fc.assert(fc.property(
        fc.record({
          major: fc.integer({ min: 0, max: 99 }),
          minor: fc.integer({ min: 0, max: 99 }),
          patch: fc.integer({ min: 0, max: 99 })
        }),
        fc.constantFrom('major', 'minor', 'patch'),
        (currentVersion, incrementType) => {
          let nextVersion = { ...currentVersion };
          
          // Simulate version increment
          switch (incrementType) {
            case 'major':
              nextVersion.major += 1;
              nextVersion.minor = 0;
              nextVersion.patch = 0;
              break;
            case 'minor':
              nextVersion.minor += 1;
              nextVersion.patch = 0;
              break;
            case 'patch':
              nextVersion.patch += 1;
              break;
          }
          
          const versionString = `${nextVersion.major}.${nextVersion.minor}.${nextVersion.patch}`;
          
          // For any version increment, the result should follow semantic versioning format
          expect(isValidSemver(versionString)).toBe(true);
          
          // Version should be greater than the original
          const currentVersionNumber = currentVersion.major * 10000 + currentVersion.minor * 100 + currentVersion.patch;
          const nextVersionNumber = nextVersion.major * 10000 + nextVersion.minor * 100 + nextVersion.patch;
          expect(nextVersionNumber).toBeGreaterThan(currentVersionNumber);
        }
      ), { numRuns: 100 });
    });

    it('should handle pre-release and build metadata in semantic versions', () => {
      // **Feature: external-sdk-transformation, Property 2: Semantic Versioning Compliance**
      fc.assert(fc.property(
        fc.record({
          major: fc.integer({ min: 0, max: 99 }),
          minor: fc.integer({ min: 0, max: 99 }),
          patch: fc.integer({ min: 0, max: 99 })
        }),
        fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[0-9a-zA-Z-]+$/.test(s)), { nil: undefined }),
        fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[0-9a-zA-Z-]+$/.test(s)), { nil: undefined }),
        (version, prerelease, buildMetadata) => {
          let versionString = `${version.major}.${version.minor}.${version.patch}`;
          
          if (prerelease) {
            versionString += `-${prerelease}`;
          }
          
          if (buildMetadata) {
            versionString += `+${buildMetadata}`;
          }
          
          // For any semantic version with optional pre-release and build metadata, it should be valid
          expect(isValidSemver(versionString)).toBe(true);
        }
      ), { numRuns: 100 });
    });
  });

  describe('Property 3: Package Metadata Completeness', () => {
    it('should have all required metadata fields for all SDK packages', () => {
      // **Feature: external-sdk-transformation, Property 3: Package Metadata Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...SDK_PACKAGES),
        (packagePath) => {
          const packageInfo = loadPackageJson(packagePath);
          const requiredFields = getRequiredMetadataFields();
          
          // For any SDK package, all required metadata fields should be present and non-empty
          requiredFields.forEach(field => {
            expect(packageInfo[field]).toBeDefined();
            
            if (typeof packageInfo[field] === 'string') {
              expect((packageInfo[field] as string).trim()).not.toBe('');
            } else if (Array.isArray(packageInfo[field])) {
              expect((packageInfo[field] as any[]).length).toBeGreaterThan(0);
            } else if (typeof packageInfo[field] === 'object') {
              expect(Object.keys(packageInfo[field] as object).length).toBeGreaterThan(0);
            }
          });
        }
      ), { numRuns: 100 });
    });

    it('should have valid GitHub Packages registry configuration', () => {
      // **Feature: external-sdk-transformation, Property 3: Package Metadata Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...SDK_PACKAGES),
        (packagePath) => {
          const packageInfo = loadPackageJson(packagePath);
          
          // For any SDK package, publishConfig should point to GitHub Packages
          expect(packageInfo.publishConfig).toBeDefined();
          expect(packageInfo.publishConfig?.registry).toBe('https://npm.pkg.github.com');
          expect(packageInfo.publishConfig?.['@megamercado:registry']).toBe('https://npm.pkg.github.com');
        }
      ), { numRuns: 100 });
    });

    it('should have valid package name with @megamercado scope', () => {
      // **Feature: external-sdk-transformation, Property 3: Package Metadata Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...SDK_PACKAGES),
        (packagePath) => {
          const packageInfo = loadPackageJson(packagePath);
          
          // For any SDK package, name should start with @megamercado/ scope
          expect(packageInfo.name).toMatch(/^@megamercado\/.+$/);
          
          // Name should not contain invalid characters
          expect(packageInfo.name).toMatch(/^@[a-z0-9-~][a-z0-9-._~]*\/[a-z0-9-~][a-z0-9-._~]*$/);
        }
      ), { numRuns: 100 });
    });

    it('should have valid repository configuration', () => {
      // **Feature: external-sdk-transformation, Property 3: Package Metadata Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...SDK_PACKAGES),
        (packagePath) => {
          const packageInfo = loadPackageJson(packagePath);
          
          // For any SDK package, repository should be properly configured
          expect(packageInfo.repository).toBeDefined();
          expect(packageInfo.repository?.type).toBe('git');
          // Accept both git+https and https formats for GitHub URLs
          expect(packageInfo.repository?.url).toMatch(/^(git\+)?https:\/\/github\.com\/megamercado\/.+\.git$/);
        }
      ), { numRuns: 100 });
    });

    it('should have appropriate keywords for discoverability', () => {
      // **Feature: external-sdk-transformation, Property 3: Package Metadata Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...SDK_PACKAGES),
        (packagePath) => {
          const packageInfo = loadPackageJson(packagePath);
          
          // For any SDK package, keywords should be present and relevant
          expect(packageInfo.keywords).toBeDefined();
          expect(packageInfo.keywords).toBeInstanceOf(Array);
          expect(packageInfo.keywords!.length).toBeGreaterThan(0);
          
          // All keywords should be non-empty strings
          packageInfo.keywords!.forEach(keyword => {
            expect(typeof keyword).toBe('string');
            expect(keyword.trim()).not.toBe('');
          });
        }
      ), { numRuns: 100 });
    });

    it('should have valid license information', () => {
      // **Feature: external-sdk-transformation, Property 3: Package Metadata Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...SDK_PACKAGES),
        (packagePath) => {
          const packageInfo = loadPackageJson(packagePath);
          
          // For any SDK package, license should be specified
          expect(packageInfo.license).toBeDefined();
          expect(typeof packageInfo.license).toBe('string');
          expect(packageInfo.license!.trim()).not.toBe('');
          
          // License should be a valid SPDX identifier (common ones)
          const validLicenses = ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC', 'UNLICENSED'];
          expect(validLicenses.includes(packageInfo.license!)).toBe(true);
        }
      ), { numRuns: 100 });
    });
  });

  describe('Property 4: TypeScript Declaration Generation', () => {
    it('should generate TypeScript declaration files for all SDK packages', () => {
      // **Feature: external-sdk-transformation, Property 4: TypeScript Declaration Generation**
      fc.assert(fc.property(
        fc.constantFrom(...SDK_PACKAGES),
        (packagePath) => {
          const packageInfo = loadPackageJson(packagePath);
          
          // For any SDK package, TypeScript declarations should be generated and accessible
          expect(packageInfo.types).toBeDefined();
          expect(typeof packageInfo.types).toBe('string');
          expect(packageInfo.types!.trim()).not.toBe('');
          
          // Declaration file should exist
          expect(hasTypeScriptDeclarations(packagePath, packageInfo)).toBe(true);
          
          // Types field should point to a .d.ts file
          expect(packageInfo.types).toMatch(/\.d\.ts$/);
        }
      ), { numRuns: 100 });
    });

    it('should include declaration files in published package files', () => {
      // **Feature: external-sdk-transformation, Property 4: TypeScript Declaration Generation**
      fc.assert(fc.property(
        fc.constantFrom(...SDK_PACKAGES),
        (packagePath) => {
          const packageInfo = loadPackageJson(packagePath);
          
          // For any SDK package, declaration files should be included in the files array
          expect(packageInfo.files).toBeDefined();
          expect(packageInfo.files).toBeInstanceOf(Array);
          
          // Files array should include dist directory (where declarations are built)
          const hasDistFiles = packageInfo.files.some(file => 
            file.includes('dist') || file.includes('*.d.ts') || file === 'dist/**/*'
          );
          expect(hasDistFiles).toBe(true);
        }
      ), { numRuns: 100 });
    });

    it('should have both CommonJS and ESM declaration files', () => {
      // **Feature: external-sdk-transformation, Property 4: TypeScript Declaration Generation**
      fc.assert(fc.property(
        fc.constantFrom(...SDK_PACKAGES),
        (packagePath) => {
          const packageInfo = loadPackageJson(packagePath);
          const distPath = path.join(packagePath, 'dist');
          
          if (fs.existsSync(distPath)) {
            const distFiles = fs.readdirSync(distPath);
            
            // For any SDK package with a dist directory, both .d.ts and .d.mts files should exist
            const hasCjsDeclarations = distFiles.some(file => file.endsWith('.d.ts'));
            const hasEsmDeclarations = distFiles.some(file => file.endsWith('.d.mts'));
            
            expect(hasCjsDeclarations).toBe(true);
            expect(hasEsmDeclarations).toBe(true);
          }
        }
      ), { numRuns: 100 });
    });

    it('should have valid TypeScript declaration file content', () => {
      // **Feature: external-sdk-transformation, Property 4: TypeScript Declaration Generation**
      fc.assert(fc.property(
        fc.constantFrom(...SDK_PACKAGES),
        (packagePath) => {
          const packageInfo = loadPackageJson(packagePath);
          
          if (packageInfo.types && hasTypeScriptDeclarations(packagePath, packageInfo)) {
            const declarationPath = path.join(packagePath, packageInfo.types);
            const declarationContent = fs.readFileSync(declarationPath, 'utf8');
            
            // For any SDK package with TypeScript declarations, the content should be valid
            expect(declarationContent.trim()).not.toBe('');
            
            // Should contain TypeScript declaration syntax
            const hasDeclarations = /declare|export|interface|type|function|class|const|let|var/.test(declarationContent);
            expect(hasDeclarations).toBe(true);
            
            // Should not contain implementation code (only declarations)
            const hasImplementation = /\{[^}]*console\.log|function\s+\w+\s*\([^)]*\)\s*\{/.test(declarationContent);
            expect(hasImplementation).toBe(false);
          }
        }
      ), { numRuns: 100 });
    });

    it('should export all public APIs in declaration files', () => {
      // **Feature: external-sdk-transformation, Property 4: TypeScript Declaration Generation**
      fc.assert(fc.property(
        fc.constantFrom(...SDK_PACKAGES),
        (packagePath) => {
          const packageInfo = loadPackageJson(packagePath);
          
          if (packageInfo.types && hasTypeScriptDeclarations(packagePath, packageInfo)) {
            const declarationPath = path.join(packagePath, packageInfo.types);
            const declarationContent = fs.readFileSync(declarationPath, 'utf8');
            
            // For any SDK package, declaration files should contain export statements
            const hasExports = /export\s+/.test(declarationContent);
            expect(hasExports).toBe(true);
            
            // Should have at least one function, interface, type, or constant export
            // Check for various export patterns in TypeScript declaration files
            const hasPublicAPI = /export\s+(\{[^}]+\}|type\s+\{[^}]+\}|declare\s+(function|interface|type|const|let|class|enum)|type\s+\w+|interface\s+\w+|const\s+\w+|function\s+\w+|class\s+\w+)/.test(declarationContent);
            expect(hasPublicAPI).toBe(true);
          }
        }
      ), { numRuns: 100 });
    });
  });

  describe('Cross-Package Consistency', () => {
    it('should have consistent package structure across all SDK packages', () => {
      fc.assert(fc.property(
        fc.constantFrom(...SDK_PACKAGES),
        fc.constantFrom(...SDK_PACKAGES),
        (packagePath1, packagePath2) => {
          const package1 = loadPackageJson(packagePath1);
          const package2 = loadPackageJson(packagePath2);
          
          // For any two SDK packages, they should have consistent structure
          expect(package1.publishConfig?.registry).toBe(package2.publishConfig?.registry);
          expect(package1.license).toBe(package2.license);
          
          // Both should have the same scope
          expect(package1.name.split('/')[0]).toBe(package2.name.split('/')[0]);
          expect(package1.name.split('/')[0]).toBe('@megamercado');
        }
      ), { numRuns: 100 });
    });

    it('should have consistent version format across all SDK packages', () => {
      fc.assert(fc.property(
        fc.constantFrom(...SDK_PACKAGES),
        (packagePath) => {
          const packageInfo = loadPackageJson(packagePath);
          
          // For any SDK package, version should follow the same format as others
          expect(isValidSemver(packageInfo.version)).toBe(true);
          
          // All packages should start with version 1.0.0 for initial release
          expect(packageInfo.version).toBe('1.0.0');
        }
      ), { numRuns: 100 });
    });
  });
});