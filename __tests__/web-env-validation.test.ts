/**
 * Environment variable validation tests for web application
 * Validates that environment configuration is preserved after SDK migration
 */

describe('Web App Environment Configuration', () => {
  
  describe('Environment Files Exist', () => {
    it('should have .env.local file with required variables', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), 'apps/web/.env.local');
      expect(fs.existsSync(envPath)).toBe(true);
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check for critical variables
      expect(envContent).toMatch(/MONGODB_URI=/);
      expect(envContent).toMatch(/NEXTAUTH_SECRET=/);
      expect(envContent).toMatch(/NEXTAUTH_URL=/);
      expect(envContent).toMatch(/AUTH_MODE=/);
      expect(envContent).toMatch(/AUTH_PROVIDERS=/);
    });

    it('should have .env.template file as reference', () => {
      const fs = require('fs');
      const path = require('path');
      
      const templatePath = path.join(process.cwd(), 'apps/web/.env.template');
      expect(fs.existsSync(templatePath)).toBe(true);
      
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      
      // Check template has all required sections
      expect(templateContent).toMatch(/Database Configuration/);
      expect(templateContent).toMatch(/NextAuth Configuration/);
      expect(templateContent).toMatch(/Authentication Mode/);
      expect(templateContent).toMatch(/OAuth Configuration/);
    });
  });

  describe('Environment Configuration Structure', () => {
    it('should have env.ts file with proper validation schema', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envTsPath = path.join(process.cwd(), 'apps/web/src/lib/env.ts');
      expect(fs.existsSync(envTsPath)).toBe(true);
      
      const envTsContent = fs.readFileSync(envTsPath, 'utf8');
      
      // Check for key validation functions
      expect(envTsContent).toMatch(/validateEnv/);
      expect(envTsContent).toMatch(/getEnv/);
      expect(envTsContent).toMatch(/isProviderEnabled/);
      expect(envTsContent).toMatch(/isSMTPConfigured/);
      
      // Check for required schema fields
      expect(envTsContent).toMatch(/MONGODB_URI/);
      expect(envTsContent).toMatch(/NEXTAUTH_SECRET/);
      expect(envTsContent).toMatch(/NEXTAUTH_URL/);
      expect(envTsContent).toMatch(/AUTH_MODE/);
      expect(envTsContent).toMatch(/AUTH_PROVIDERS/);
    });

    it('should validate critical environment variables in schema', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envTsPath = path.join(process.cwd(), 'apps/web/src/lib/env.ts');
      const envTsContent = fs.readFileSync(envTsPath, 'utf8');
      
      // Check that required fields are marked as required
      expect(envTsContent).toMatch(/MONGODB_URI.*string.*min.*required/);
      expect(envTsContent).toMatch(/NEXTAUTH_SECRET.*string.*min.*32/);
      expect(envTsContent).toMatch(/NEXTAUTH_URL.*string.*url/);
    });
  });

  describe('Database Configuration', () => {
    it('should have DATABASE_URL configured in .env.local', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), 'apps/web/.env.local');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Extract MONGODB_URI value
      const mongoUriMatch = envContent.match(/MONGODB_URI=(.+)/);
      expect(mongoUriMatch).toBeTruthy();
      expect(mongoUriMatch[1]).toMatch(/mongodb/);
      expect(mongoUriMatch[1]).not.toBe('');
    });
  });

  describe('Authentication Configuration', () => {
    it('should have NextAuth configuration preserved', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), 'apps/web/.env.local');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check NextAuth configuration
      const nextAuthUrlMatch = envContent.match(/NEXTAUTH_URL=(.+)/);
      const nextAuthSecretMatch = envContent.match(/NEXTAUTH_SECRET=(.+)/);
      
      expect(nextAuthUrlMatch).toBeTruthy();
      expect(nextAuthUrlMatch[1]).toMatch(/^https?:\/\//);
      
      expect(nextAuthSecretMatch).toBeTruthy();
      expect(nextAuthSecretMatch[1].length).toBeGreaterThanOrEqual(32);
    });

    it('should have auth mode and providers configured', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), 'apps/web/.env.local');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      const authModeMatch = envContent.match(/AUTH_MODE=(.+)/);
      const authProvidersMatch = envContent.match(/AUTH_PROVIDERS=(.+)/);
      
      expect(authModeMatch).toBeTruthy();
      expect(['required', 'disabled', 'optional', 'whitelist', 'invite-only']).toContain(authModeMatch[1]);
      
      expect(authProvidersMatch).toBeTruthy();
      expect(authProvidersMatch[1]).not.toBe('');
    });
  });

  describe('Theme Configuration', () => {
    it('should have theme variables preserved', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), 'apps/web/.env.local');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check theme colors
      expect(envContent).toMatch(/NEXT_PUBLIC_PRIMARY_COLOR=/);
      expect(envContent).toMatch(/NEXT_PUBLIC_SECONDARY_COLOR=/);
      expect(envContent).toMatch(/NEXT_PUBLIC_BACKGROUND_COLOR=/);
      expect(envContent).toMatch(/NEXT_PUBLIC_TEXT_COLOR=/);
      expect(envContent).toMatch(/NEXT_PUBLIC_FONT_FAMILY=/);
    });

    it('should have valid hex colors', () => {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), 'apps/web/.env.local');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Accept hex colors with or without # prefix (Tailwind colors don't use #)
      const hexColorRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      
      const primaryColorMatch = envContent.match(/NEXT_PUBLIC_PRIMARY_COLOR=(.+)/);
      const secondaryColorMatch = envContent.match(/NEXT_PUBLIC_SECONDARY_COLOR=(.+)/);
      
      if (primaryColorMatch) {
        expect(primaryColorMatch[1]).toMatch(hexColorRegex);
      }
      if (secondaryColorMatch) {
        expect(secondaryColorMatch[1]).toMatch(hexColorRegex);
      }
    });
  });

});