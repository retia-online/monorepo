/**
 * Bug Condition Exploration Test for Remove External Package Dependencies
 * **Feature: remove-external-package-dependencies, Property 1: Bug Condition - Package Resolution Without Private Registry**
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT attempt to fix the test or the code when it fails
 * NOTE: This test encodes the expected behavior - it will validate the fix when it passes after implementation
 * GOAL: Surface counterexamples that demonstrate the bug exists
 * 
 * Bug Condition from design: 
 * isBugCondition(input) where input.packageScope = "@retia-online" 
 * AND registryConfig(input.packageScope) = "https://npm.pkg.github.com" 
 * AND NOT hasRegistryAccess(input.packageScope) 
 * AND packageExistsInRegistry(input.packageName) = false
 * 
 * NOTE: Actual code uses @retia-global scope, not @retia-online as mentioned in spec
 */

import fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';



// Application package information
interface AppPackageInfo {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  publishConfig?: {
    registry?: string;
    [key: string]: string | undefined;
  };
}

// Utility functions
function loadPackageJson(filePath: string): AppPackageInfo {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Package.json not found at ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getAllDependencies(packageInfo: AppPackageInfo): Record<string, string> {
  return {
    ...packageInfo.dependencies,
    ...packageInfo.devDependencies,
    ...packageInfo.peerDependencies
  };
}

function hasRetiaGlobalDependencies(dependencies: Record<string, string>): boolean {
  return Object.keys(dependencies).some(packageName => 
    packageName.startsWith('@retia-global/')
  );
}

function getRetiaGlobalPackages(dependencies: Record<string, string>): string[] {
  return Object.keys(dependencies).filter(packageName => 
    packageName.startsWith('@retia-global/')
  );
}

function checkNpmrcConfig(): boolean {
  const npmrcPath = '.npmrc';
  const npmrcTemplatePath = '.npmrc.template';
  
  // Check if .npmrc exists (users might have created it from template)
  if (fs.existsSync(npmrcPath)) {
    const content = fs.readFileSync(npmrcPath, 'utf8');
    return content.includes('@retia-global:registry=https://npm.pkg.github.com');
  }
  
  // Check .npmrc.template (this is what new users would see)
  if (fs.existsSync(npmrcTemplatePath)) {
    const content = fs.readFileSync(npmrcTemplatePath, 'utf8');
    return content.includes('@retia-global:registry=https://npm.pkg.github.com');
  }
  
  return false;
}

function checkPackagePublishConfig(): boolean {
  // Check packages/*/package.json files for publishConfig pointing to private registry
  const packagesDir = 'packages';
  if (!fs.existsSync(packagesDir)) {
    return false;
  }
  
  const packageDirs = fs.readdirSync(packagesDir);
  for (const packageDir of packageDirs) {
    const packageJsonPath = path.join(packagesDir, packageDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageInfo = loadPackageJson(packageJsonPath);
      if (packageInfo.publishConfig && 
          (packageInfo.publishConfig.registry === 'https://npm.pkg.github.com' ||
           packageInfo.publishConfig['@retia-global:registry'] === 'https://npm.pkg.github.com')) {
        return true;
      }
    }
  }
  
  return false;
}





describe('Bug Condition Exploration Tests', () => {
  describe('Property 1: Bug Condition - Package Resolution Without Private Registry', () => {
    // Test 1: Verify package resolution works without private registry access
    it('should successfully resolve @retia-global packages without private registry access', () => {
      // **Feature: remove-external-package-dependencies, Property 1: Bug Condition**
      // **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
      
      // Check actual repository configuration
      const hasPrivateRegistryConfig = checkNpmrcConfig();
      const hasPublishConfig = checkPackagePublishConfig();
      
      // After fix, there should be no private registry configuration
      expect(hasPrivateRegistryConfig).toBe(false);
      expect(hasPublishConfig).toBe(false);
      
      // Check that @retia-global packages are referenced as workspace dependencies
      const rootPackage = loadPackageJson('package.json');
      const rootDeps = getAllDependencies(rootPackage);
      const hasRootRetiaDeps = hasRetiaGlobalDependencies(rootDeps);
      
      const webPackage = loadPackageJson('apps/web/package.json');
      const webDeps = getAllDependencies(webPackage);
      const hasWebRetiaDeps = hasRetiaGlobalDependencies(webDeps);
      
      const mobilePackage = loadPackageJson('apps/mobile/package.json');
      const mobileDeps = getAllDependencies(mobilePackage);
      const hasMobileRetiaDeps = hasRetiaGlobalDependencies(mobileDeps);
      
      // Check if dependencies use workspace references
      const checkWorkspaceReferences = (dependencies: Record<string, string>, packages: string[]): boolean => {
        return packages.every(pkg => {
          const version = dependencies[pkg];
          return version && version.includes('workspace:');
        });
      };
      
      const rootRetiaPackages = getRetiaGlobalPackages(rootDeps);
      const webRetiaPackages = getRetiaGlobalPackages(webDeps);
      const mobileRetiaPackages = getRetiaGlobalPackages(mobileDeps);
      
      const rootUsesWorkspace = checkWorkspaceReferences(rootDeps, rootRetiaPackages);
      const webUsesWorkspace = checkWorkspaceReferences(webDeps, webRetiaPackages);
      const mobileUsesWorkspace = checkWorkspaceReferences(mobileDeps, mobileRetiaPackages);
      
      // All @retia-global dependencies should use workspace references
      if (hasRootRetiaDeps) expect(rootUsesWorkspace).toBe(true);
      if (hasWebRetiaDeps) expect(webUsesWorkspace).toBe(true);
      if (hasMobileRetiaDeps) expect(mobileUsesWorkspace).toBe(true);
      
      // At least one should have @retia-global dependencies (to verify we're checking something)
      expect(hasRootRetiaDeps || hasWebRetiaDeps || hasMobileRetiaDeps).toBe(true);
    });

    // Test 2: Verify package resolution works without private registry access
    it('should successfully resolve @retia-global packages without private registry access', () => {
      // **Feature: remove-external-package-dependencies, Property 1: Bug Condition**
      // **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
      
      // Check that @retia-global packages are configured to use workspace resolution
      // not private registry
      const hasPrivateRegistryConfig = checkNpmrcConfig();
      
      // After fix, there should be no private registry configuration
      expect(hasPrivateRegistryConfig).toBe(false);
      
      // Check that all @retia-global dependencies use workspace references
      const rootPackage = loadPackageJson('package.json');
      const rootDeps = getAllDependencies(rootPackage);
      const rootRetiaPackages = getRetiaGlobalPackages(rootDeps);
      
      const webPackage = loadPackageJson('apps/web/package.json');
      const webDeps = getAllDependencies(webPackage);
      const webRetiaPackages = getRetiaGlobalPackages(webDeps);
      
      const mobilePackage = loadPackageJson('apps/mobile/package.json');
      const mobileDeps = getAllDependencies(mobilePackage);
      const mobileRetiaPackages = getRetiaGlobalPackages(mobileDeps);
      
      // All @retia-global dependencies should use workspace:* references
      const checkWorkspaceReferences = (dependencies: Record<string, string>, packages: string[]): boolean => {
        return packages.every(pkg => {
          const version = dependencies[pkg];
          return version && version.includes('workspace:');
        });
      };
      
      const rootUsesWorkspace = checkWorkspaceReferences(rootDeps, rootRetiaPackages);
      const webUsesWorkspace = checkWorkspaceReferences(webDeps, webRetiaPackages);
      const mobileUsesWorkspace = checkWorkspaceReferences(mobileDeps, mobileRetiaPackages);
      
      expect(rootUsesWorkspace).toBe(true);
      expect(webUsesWorkspace).toBe(true);
      expect(mobileUsesWorkspace).toBe(true);
    });

    // Test 3: Check that .npmrc.template does NOT configure private registry
    it('should NOT have .npmrc.template configuring @retia-global scope to private registry', () => {
      // **Feature: remove-external-package-dependencies, Property 1: Bug Condition**
      // **Validates: Requirements 1.4**
      
      const npmrcTemplatePath = '.npmrc.template';
      expect(fs.existsSync(npmrcTemplatePath)).toBe(true);
      
      const content = fs.readFileSync(npmrcTemplatePath, 'utf8');
      
      // Should NOT contain private registry configuration after fix
      expect(content).not.toContain('@retia-global:registry=https://npm.pkg.github.com');
      expect(content).not.toContain('//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN');
      
      // Should indicate repository is self-contained
      expect(content).toContain('This repository is self-contained');
      expect(content).toContain('does not require private registry access');
    });

    // Test 4: Check that internal packages do NOT have publishConfig pointing to private registry
    it('should NOT have internal packages with publishConfig pointing to private registry', () => {
      // **Feature: remove-external-package-dependencies, Property 1: Bug Condition**
      // **Validates: Requirements 1.3**
      
      const hasPublishConfig = checkPackagePublishConfig();
      
      // After fix, no publishConfig should point to private registry
      expect(hasPublishConfig).toBe(false);
    });

    // Test 5: Check that apps depend on @retia-global packages as workspace references
    it('should have apps depending on @retia-global packages as workspace references', () => {
      // **Feature: remove-external-package-dependencies, Property 1: Bug Condition**
      // **Validates: Requirements 1.5**
      
      const webPackage = loadPackageJson('apps/web/package.json');
      const webDeps = getAllDependencies(webPackage);
      const webRetiaPackages = getRetiaGlobalPackages(webDeps);
      
      const mobilePackage = loadPackageJson('apps/mobile/package.json');
      const mobileDeps = getAllDependencies(mobilePackage);
      const mobileRetiaPackages = getRetiaGlobalPackages(mobileDeps);
      
      // Check if dependencies use workspace references or external versions
      const hasExternalDependencies = (dependencies: Record<string, string>, packages: string[]): boolean => {
        return packages.some(pkg => {
          const version = dependencies[pkg];
          // External dependencies have version ranges like ^1.0.0, not workspace:*
          return version && !version.includes('workspace:');
        });
      };
      
      const webHasExternal = hasExternalDependencies(webDeps, webRetiaPackages);
      const mobileHasExternal = hasExternalDependencies(mobileDeps, mobileRetiaPackages);
      
      // After fix, apps should NOT have external dependencies on @retia-global packages
      expect(webHasExternal).toBe(false);
      expect(mobileHasExternal).toBe(false);
    });
  });

  describe('Bug Condition Documentation', () => {
    // This test documents the counterexamples found
    it('should document counterexamples demonstrating the bug', () => {
      console.log('=== FIX VERIFICATION ===');
      console.log('The following checks verify the bug has been fixed:');
      console.log('');
      
      // Check 1: Private registry configuration
      if (!checkNpmrcConfig()) {
        console.log('✓ 1. .npmrc.template does NOT configure @retia-global scope to use private GitHub registry');
        console.log('   - No authentication token required for access');
        console.log('   - External users can resolve packages without private registry access');
      } else {
        console.log('✗ 1. .npmrc.template still configures private registry (BUG NOT FIXED)');
      }
      
      // Check 2: Package publish configuration
      if (!checkPackagePublishConfig()) {
        console.log('✓ 2. Internal packages do NOT have publishConfig pointing to private registry');
        console.log('   - Packages resolve locally without registry access');
        console.log('   - No attempts to fetch from private registry');
      } else {
        console.log('✗ 2. Internal packages still have publishConfig pointing to private registry (BUG NOT FIXED)');
      }
      
      // Check 3: Workspace dependencies
      const webPackage = loadPackageJson('apps/web/package.json');
      const webDeps = getAllDependencies(webPackage);
      const webRetiaPackages = getRetiaGlobalPackages(webDeps);
      
      const mobilePackage = loadPackageJson('apps/mobile/package.json');
      const mobileDeps = getAllDependencies(mobilePackage);
      const mobileRetiaPackages = getRetiaGlobalPackages(mobileDeps);
      
      const checkWorkspaceReferences = (dependencies: Record<string, string>, packages: string[]): boolean => {
        return packages.every(pkg => {
          const version = dependencies[pkg];
          return version && version.includes('workspace:');
        });
      };
      
      const webUsesWorkspace = checkWorkspaceReferences(webDeps, webRetiaPackages);
      const mobileUsesWorkspace = checkWorkspaceReferences(mobileDeps, mobileRetiaPackages);
      
      if (webRetiaPackages.length > 0 || mobileRetiaPackages.length > 0) {
        console.log('3. Apps depend on @retia-global packages:');
        webRetiaPackages.forEach(pkg => {
          const isWorkspace = webDeps[pkg] && webDeps[pkg].includes('workspace:');
          console.log(`   ${isWorkspace ? '✓' : '✗'} Web app: ${pkg} = ${webDeps[pkg]} ${isWorkspace ? '(workspace reference)' : '(EXTERNAL - BUG NOT FIXED)'}`);
        });
        mobileRetiaPackages.forEach(pkg => {
          const isWorkspace = mobileDeps[pkg] && mobileDeps[pkg].includes('workspace:');
          console.log(`   ${isWorkspace ? '✓' : '✗'} Mobile app: ${pkg} = ${mobileDeps[pkg]} ${isWorkspace ? '(workspace reference)' : '(EXTERNAL - BUG NOT FIXED)'}`);
        });
      }
      
      // Check 4: Root dependency
      const rootPackage = loadPackageJson('package.json');
      const rootDeps = getAllDependencies(rootPackage);
      const rootRetiaPackages = getRetiaGlobalPackages(rootDeps);
      
      const rootUsesWorkspace = checkWorkspaceReferences(rootDeps, rootRetiaPackages);
      
      if (rootRetiaPackages.length > 0) {
        console.log('4. Root package depends on @retia-global packages:');
        rootRetiaPackages.forEach(pkg => {
          const isWorkspace = rootDeps[pkg] && rootDeps[pkg].includes('workspace:');
          console.log(`   ${isWorkspace ? '✓' : '✗'} ${pkg} = ${rootDeps[pkg]} ${isWorkspace ? '(workspace reference)' : '(EXTERNAL - BUG NOT FIXED)'}`);
        });
      }
      
      console.log('');
      console.log('=== SUMMARY ===');
      console.log('The bug fix has been successfully implemented if:');
      console.log('1. All checks above show ✓ (not ✗)');
      console.log('2. No private registry configuration exists');
      console.log('3. All @retia-global dependencies use workspace:* references');
      console.log('4. Fresh repository clones can install dependencies successfully');
      
      // This test always passes - it's just for documentation
      expect(true).toBe(true);
    });
  });
});