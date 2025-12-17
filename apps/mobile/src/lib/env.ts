/**
 * Environment variable validation and configuration
 */

export type AuthMode = 'required' | 'disabled' | 'optional';
export type AuthMethod = 'email' | 'phone' | 'facebook' | 'google';

interface EnvConfig {
  apiUrl: string;
  appName: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  isDevelopment: boolean;
  isProduction: boolean;
  googleClientId: string | null;
  facebookAppId: string | null;
  authMode: AuthMode;
  authMethods: AuthMethod[];
  mainScreenMessage: string;
}

/**
 * Validate and get environment configuration
 */
export function getEnvConfig(): EnvConfig {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const appName = process.env.EXPO_PUBLIC_INSTANCE || 'monorepo';
  const primaryColor = process.env.EXPO_PUBLIC_PRIMARY_COLOR || '#3b82f6';
  const secondaryColor = process.env.EXPO_PUBLIC_SECONDARY_COLOR || '#10b981';
  const backgroundColor = process.env.EXPO_PUBLIC_BACKGROUND_COLOR || '#ffffff';
  const textColor = process.env.EXPO_PUBLIC_TEXT_COLOR || '#1f2937';
  const nodeEnv = process.env.NODE_ENV || 'development';
  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || null;
  const facebookAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || null;

  // Auth configuration
  const authModeRaw = process.env.EXPO_PUBLIC_AUTH_MODE || 'required';
  const authMethodsRaw = process.env.EXPO_PUBLIC_AUTH_METHODS || 'email';
  const mainScreenMessage = process.env.EXPO_PUBLIC_MAIN_SCREEN_MESSAGE || 'Hola Mundo';

  // Validate auth mode
  const validAuthModes: AuthMode[] = ['required', 'disabled', 'optional'];
  const authMode: AuthMode = validAuthModes.includes(authModeRaw as AuthMode)
    ? (authModeRaw as AuthMode)
    : 'required';

  // Parse auth methods
  const validAuthMethods: AuthMethod[] = ['email', 'phone', 'facebook', 'google'];
  const authMethods: AuthMethod[] = authMethodsRaw
    .split(',')
    .map((method: string) => method.trim() as AuthMethod)
    .filter((method: AuthMethod) => validAuthMethods.includes(method));

  // Validate required variables
  if (!apiUrl) {
    console.warn('⚠️  EXPO_PUBLIC_API_URL is not set. Using default: http://localhost:3000');
  }

  // Validate colors
  if (!isValidColor(primaryColor)) {
    console.warn(`⚠️  EXPO_PUBLIC_PRIMARY_COLOR is invalid: ${primaryColor}`);
  }
  if (!isValidColor(secondaryColor)) {
    console.warn(`⚠️  EXPO_PUBLIC_SECONDARY_COLOR is invalid: ${secondaryColor}`);
  }

  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';

  return {
    apiUrl: apiUrl || 'http://localhost:3000',
    appName,
    primaryColor,
    secondaryColor,
    backgroundColor,
    textColor,
    isDevelopment,
    isProduction,
    googleClientId,
    facebookAppId,
    authMode,
    authMethods,
    mainScreenMessage,
  };
}

/**
 * Validate if a string is a valid color
 */
function isValidColor(color: string): boolean {
  // Check if it's a hex color
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return true;
  }

  // Check if it's a named CSS color (basic check)
  const namedColors = [
    'red', 'green', 'blue', 'white', 'black', 'gray', 'yellow', 'orange', 'purple', 'pink',
  ];
  if (namedColors.includes(color.toLowerCase())) {
    return true;
  }

  return false;
}

/**
 * Get API URL with fallback
 */
export function getApiUrl(): string {
  return getEnvConfig().apiUrl;
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnvConfig().isDevelopment;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnvConfig().isProduction;
}

/**
 * Get OAuth provider configuration
 */
export function getOAuthConfig() {
  const config = getEnvConfig();
  return {
    google: {
      enabled: !!config.googleClientId && config.authMethods.includes('google'),
      clientId: config.googleClientId,
    },
    facebook: {
      enabled: !!config.facebookAppId && config.authMethods.includes('facebook'),
      appId: config.facebookAppId,
    },
  };
}

/**
 * Get authentication configuration
 */
export function getAuthConfig() {
  const config = getEnvConfig();
  return {
    mode: config.authMode,
    methods: config.authMethods,
    isRequired: config.authMode === 'required',
    isDisabled: config.authMode === 'disabled',
    isOptional: config.authMode === 'optional',
    allowsEmail: config.authMethods.includes('email'),
    allowsPhone: config.authMethods.includes('phone'),
    allowsGoogle: config.authMethods.includes('google') && !!config.googleClientId,
    allowsFacebook: config.authMethods.includes('facebook') && !!config.facebookAppId,
  };
}

/**
 * Get main screen configuration
 */
export function getMainScreenConfig() {
  const config = getEnvConfig();
  return {
    message: config.mainScreenMessage,
  };
}

// Export singleton instance
export const envConfig = getEnvConfig();
