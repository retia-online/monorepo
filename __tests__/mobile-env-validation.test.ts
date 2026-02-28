/**
 * Environment variable validation tests for mobile application
 * Validates that environment configuration is preserved after SDK migration
 */

describe('Mobile App Environment Configuration', () => {
  
  describe('Environment Files Exist', () => {
    it('should have .env.development file with required variables', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), 'apps/mobile/.env.development');
      expect(fs.existsSync(envPath)).toBe(true);
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check for critical mobile variables
      expect(envContent).toMatch(/EXPO_PUBLIC_API_URL=/);
      expect(envContent).toMatch(/EXPO_PUBLIC_AUTH_MODE=/);
      expect(envContent).toMatch(/EXPO_PUBLIC_AUTH_METHODS=/);
      expect(envContent).toMatch(/EXPO_PUBLIC_INSTANCE=/);
    });

    it('should have .env.template file as reference', () => {
      const fs = require('fs');
      const path = require('path');
      
      const templatePath = path.join(process.cwd(), 'apps/mobile/.env.template');
      expect(fs.existsSync(templatePath)).toBe(true);
      
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      
      // Check template has all required sections
      expect(templateContent).toMatch(/Backend API Configuration/);
      expect(templateContent).toMatch(/Authentication Configuration/);
      expect(templateContent).toMatch(/OAuth Configuration/);
      expect(templateContent).toMatch(/App Configuration/);
    });
  });

  describe('Environment Configuration Structure', () => {
    it('should have env.ts file with proper validation functions', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envTsPath = path.join(process.cwd(), 'apps/mobile/src/lib/env.ts');
      expect(fs.existsSync(envTsPath)).toBe(true);
      
      const envTsContent = fs.readFileSync(envTsPath, 'utf8');
      
      // Check for key validation functions
      expect(envTsContent).toMatch(/getEnvConfig/);
      expect(envTsContent).toMatch(/getApiUrl/);
      expect(envTsContent).toMatch(/getAuthConfig/);
      expect(envTsContent).toMatch(/getOAuthConfig/);
      expect(envTsContent).toMatch(/getThemeConfig/);
    });

    it('should validate mobile-specific environment variables', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envTsPath = path.join(process.cwd(), 'apps/mobile/src/lib/env.ts');
      const envTsContent = fs.readFileSync(envTsPath, 'utf8');
      
      // Check that mobile-specific fields are handled
      expect(envTsContent).toMatch(/EXPO_PUBLIC_API_URL/);
      expect(envTsContent).toMatch(/EXPO_PUBLIC_AUTH_MODE/);
      expect(envTsContent).toMatch(/EXPO_PUBLIC_AUTH_METHODS/);
      expect(envTsContent).toMatch(/EXPO_PUBLIC_GOOGLE_CLIENT_ID/);
      expect(envTsContent).toMatch(/EXPO_PUBLIC_FACEBOOK_APP_ID/);
    });
  });

  describe('API Configuration', () => {
    it('should have API_URL configured in .env.development', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), 'apps/mobile/.env.development');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Extract API URL value
      const apiUrlMatch = envContent.match(/EXPO_PUBLIC_API_URL=(.+)/);
      expect(apiUrlMatch).toBeTruthy();
      expect(apiUrlMatch[1]).toMatch(/^https?:\/\//);
      expect(apiUrlMatch[1]).not.toBe('');
    });

    it('should not have direct database configuration', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), 'apps/mobile/.env.development');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Mobile should NOT have direct database access
      expect(envContent).not.toMatch(/MONGODB_URI=/);
      expect(envContent).not.toMatch(/DATABASE_URL=/);
      expect(envContent).not.toMatch(/NEXTAUTH_SECRET=/);
    });
  });

  describe('Authentication Configuration', () => {
    it('should have mobile auth configuration preserved', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), 'apps/mobile/.env.development');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check mobile auth configuration
      const authModeMatch = envContent.match(/EXPO_PUBLIC_AUTH_MODE=(.+)/);
      const authMethodsMatch = envContent.match(/EXPO_PUBLIC_AUTH_METHODS=(.+)/);
      
      expect(authModeMatch).toBeTruthy();
      expect(['required', 'disabled', 'optional', 'whitelist', 'invite-only']).toContain(authModeMatch[1]);
      
      expect(authMethodsMatch).toBeTruthy();
      expect(authMethodsMatch[1]).not.toBe('');
    });

    it('should have OAuth configuration for mobile', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), 'apps/mobile/.env.development');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check OAuth configuration (should be present even if not enabled)
      expect(envContent).toMatch(/EXPO_PUBLIC_GOOGLE_CLIENT_ID=/);
      expect(envContent).toMatch(/EXPO_PUBLIC_FACEBOOK_APP_ID=/);
    });
  });

  describe('Theme Configuration', () => {
    it('should have theme variables preserved', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), 'apps/mobile/.env.development');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check theme colors
      expect(envContent).toMatch(/EXPO_PUBLIC_PRIMARY_COLOR=/);
      expect(envContent).toMatch(/EXPO_PUBLIC_SECONDARY_COLOR=/);
      expect(envContent).toMatch(/EXPO_PUBLIC_BACKGROUND_COLOR=/);
      expect(envContent).toMatch(/EXPO_PUBLIC_TEXT_COLOR=/);
    });

    it('should have valid hex colors', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), 'apps/mobile/.env.development');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      
      const primaryColorMatch = envContent.match(/EXPO_PUBLIC_PRIMARY_COLOR=(.+)/);
      const secondaryColorMatch = envContent.match(/EXPO_PUBLIC_SECONDARY_COLOR=(.+)/);
      
      if (primaryColorMatch) {
        expect(primaryColorMatch[1]).toMatch(hexColorRegex);
      }
      if (secondaryColorMatch) {
        expect(secondaryColorMatch[1]).toMatch(hexColorRegex);
      }
    });
  });

  describe('Mobile-Specific Configuration', () => {
    it('should have instance name configured', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), 'apps/mobile/.env.development');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      const instanceMatch = envContent.match(/EXPO_PUBLIC_INSTANCE=(.+)/);
      expect(instanceMatch).toBeTruthy();
      expect(instanceMatch[1]).not.toBe('');
    });

    it('should have main screen message configured', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), 'apps/mobile/.env.development');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Main screen message should be present
      expect(envContent).toMatch(/EXPO_PUBLIC_MAIN_SCREEN_MESSAGE=/);
    });

    it('should use EXPO_PUBLIC_ prefix for public variables', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), 'apps/mobile/.env.development');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Count EXPO_PUBLIC_ variables
      const expoPublicMatches = envContent.match(/EXPO_PUBLIC_/g);
      expect(expoPublicMatches).toBeTruthy();
      expect(expoPublicMatches.length).toBeGreaterThan(5); // Should have multiple EXPO_PUBLIC_ vars
    });
  });

  describe('Development Configuration', () => {
    it('should have NODE_ENV configured', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), 'apps/mobile/.env.development');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      const nodeEnvMatch = envContent.match(/NODE_ENV=(.+)/);
      if (nodeEnvMatch) {
        expect(['development', 'production', 'test']).toContain(nodeEnvMatch[1]);
      }
    });
  });

});