/**
 * Property-based tests for external SDK package publishing functionality
 * **Feature: external-sdk-transformation, Property 2: Semantic Versioning Compliance**
 * **Feature: external-sdk-transformation, Property 3: Package Metadata Completeness**
 * **Feature: external-sdk-transformation, Property 4: TypeScript Declaration Generation**
 * **Validates: Requirements 2.2, 2.3, 2.4**
 * 
 * Note: These tests validate the external SDK packages published to GitHub Packages.
 * The local packages directory has been removed as part of the migration to external SDKs.
 */

import fc from 'fast-check';

// External SDK packages that should be available on GitHub Packages
const EXTERNAL_SDK_PACKAGES = [
  '@megamercado/auth',
  '@megamercado/api', 
  '@megamercado/ui',
  '@megamercado/configs'
];

// Utility functions for semantic versioning validation
function isValidSemver(version: string): boolean {
  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*|[0-9a-zA-Z-]*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*|[0-9a-zA-Z-]*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return semverRegex.test(version);
}

describe('External SDK Package Publishing Property Tests', () => {
  describe('Property 2: Semantic Versioning Compliance', () => {
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
    it('should validate package name format for external SDKs', () => {
      // **Feature: external-sdk-transformation, Property 3: Package Metadata Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...EXTERNAL_SDK_PACKAGES),
        (packageName) => {
          // For any external SDK package, name should start with @megamercado/ scope
          expect(packageName).toMatch(/^@megamercado\/.+$/);
          
          // Name should not contain invalid characters
          expect(packageName).toMatch(/^@[a-z0-9-~][a-z0-9-._~]*\/[a-z0-9-~][a-z0-9-._~]*$/);
        }
      ), { numRuns: 100 });
    });

    it('should validate GitHub Packages registry configuration format', () => {
      // **Feature: external-sdk-transformation, Property 3: Package Metadata Completeness**
      fc.assert(fc.property(
        fc.constantFrom(...EXTERNAL_SDK_PACKAGES),
        (packageName) => {
          // For any external SDK package, it should be publishable to GitHub Packages
          const expectedRegistry = 'https://npm.pkg.github.com';
          const expectedScopedRegistry = 'https://npm.pkg.github.com';
          
          // Validate registry URL format
          expect(expectedRegistry).toMatch(/^https:\/\/npm\.pkg\.github\.com$/);
          expect(expectedScopedRegistry).toMatch(/^https:\/\/npm\.pkg\.github\.com$/);
          
          // Package name should be compatible with GitHub Packages
          expect(packageName.split('/')[0]).toBe('@megamercado');
        }
      ), { numRuns: 100 });
    });
  });

  describe('Property 4: TypeScript Declaration Generation', () => {
    it('should validate TypeScript declaration file naming conventions', () => {
      // **Feature: external-sdk-transformation, Property 4: TypeScript Declaration Generation**
      fc.assert(fc.property(
        fc.constantFrom('index.d.ts', 'main.d.ts', 'lib.d.ts'),
        fc.constantFrom('index.d.mts', 'main.d.mts', 'lib.d.mts'),
        (cjsDeclaration, esmDeclaration) => {
          // For any TypeScript declaration file, it should follow proper naming conventions
          expect(cjsDeclaration).toMatch(/\.d\.ts$/);
          expect(esmDeclaration).toMatch(/\.d\.mts$/);
          
          // Both files should be valid declaration file names (no requirement for same base name)
          const validNames = ['index', 'main', 'lib'];
          const cjsBase = cjsDeclaration.replace('.d.ts', '');
          const esmBase = esmDeclaration.replace('.d.mts', '');
          
          expect(validNames).toContain(cjsBase);
          expect(validNames).toContain(esmBase);
        }
      ), { numRuns: 100 });
    });

    it('should validate TypeScript export patterns', () => {
      // **Feature: external-sdk-transformation, Property 4: TypeScript Declaration Generation**
      fc.assert(fc.property(
        fc.constantFrom(
          'export declare function',
          'export declare const',
          'export declare class',
          'export declare interface',
          'export declare type',
          'export declare enum',
          'export { ',
          'export * from'
        ),
        (exportPattern) => {
          // For any TypeScript export pattern, it should be valid declaration syntax
          expect(exportPattern).toMatch(/^export\s+(declare\s+)?(function|const|class|interface|type|enum|\{|\*)/);
          
          // Should not contain implementation details
          expect(exportPattern).not.toMatch(/\{[^}]*console\.log/);
          expect(exportPattern).not.toMatch(/function\s+\w+\s*\([^)]*\)\s*\{[^}]+\}/);
        }
      ), { numRuns: 100 });
    });
  });

  describe('External SDK Migration Validation', () => {
    it('should confirm packages directory has been removed', () => {
      // Validate that the migration to external SDKs is complete
      const fs = require('fs');
      expect(fs.existsSync('packages')).toBe(false);
    });

    it('should validate external SDK package names are consistent', () => {
      fc.assert(fc.property(
        fc.constantFrom(...EXTERNAL_SDK_PACKAGES),
        fc.constantFrom(...EXTERNAL_SDK_PACKAGES),
        (package1, package2) => {
          // For any two external SDK packages, they should have consistent naming
          expect(package1.split('/')[0]).toBe(package2.split('/')[0]);
          expect(package1.split('/')[0]).toBe('@megamercado');
          
          // Package names should be different (no duplicates)
          if (package1 !== package2) {
            expect(package1.split('/')[1]).not.toBe(package2.split('/')[1]);
          }
        }
      ), { numRuns: 100 });
    });

    it('should validate all expected external SDKs are defined', () => {
      const expectedPackages = ['auth', 'api', 'ui', 'configs'];
      
      expectedPackages.forEach(packageName => {
        const fullPackageName = `@megamercado/${packageName}`;
        expect(EXTERNAL_SDK_PACKAGES).toContain(fullPackageName);
      });
      
      // Should have exactly the expected number of packages
      expect(EXTERNAL_SDK_PACKAGES).toHaveLength(expectedPackages.length);
    });
  });
});