import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { secureStorage } from './secure-storage';
import { getApiUrl } from './env';

// Configure web browser for OAuth
WebBrowser.maybeCompleteAuthSession();

const API_URL = getApiUrl();

interface OAuthConfig {
    clientId: string;
    clientSecret?: string;
    redirectUri: string;
    discoveryUrl?: string;
}

interface OAuthResponse {
    token: string;
    user: unknown;
}

/**
 * Google OAuth Configuration
 */
export const googleOAuthConfig: OAuthConfig = {
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirectUri: AuthSession.makeRedirectUri(),
    discoveryUrl: 'https://accounts.google.com/.well-known/openid-configuration',
};

/**
 * Facebook OAuth Configuration
 */
export const facebookOAuthConfig: OAuthConfig = {
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '',
    redirectUri: AuthSession.makeRedirectUri(),
};

/**
 * Perform Google OAuth login
 */
export async function loginWithGoogle(): Promise<OAuthResponse> {
    if (!googleOAuthConfig.clientId) {
        throw new Error('Google Client ID not configured');
    }

    try {
        const discovery = await AuthSession.fetchDiscoveryAsync(googleOAuthConfig.discoveryUrl!);
        const request = new AuthSession.AuthRequest({
            clientId: googleOAuthConfig.clientId,
            scopes: ['openid', 'profile', 'email'],
            redirectUri: googleOAuthConfig.redirectUri,
        });

        const result = await request.promptAsync(discovery);

        if (result.type !== 'success') {
            throw new Error('OAuth cancelled or failed');
        }

        // Exchange OAuth code for JWT token
        const response = await exchangeOAuthCode('google', result.params.code);

        // Store token and user
        if (response.token) {
            await secureStorage.setToken(response.token);
        }
        if (response.user) {
            await secureStorage.setUser(response.user);
        }

        return response;
    } catch (error) {
        console.error('Google OAuth error:', error);
        throw error;
    }
}

/**
 * Perform Facebook OAuth login
 */
export async function loginWithFacebook(): Promise<OAuthResponse> {
    if (!facebookOAuthConfig.clientId) {
        throw new Error('Facebook App ID not configured');
    }

    try {
        const discovery = await AuthSession.fetchDiscoveryAsync('https://www.facebook.com/.well-known/openid-configuration');
        const request = new AuthSession.AuthRequest({
            clientId: facebookOAuthConfig.clientId,
            scopes: ['public_profile', 'email'],
            redirectUri: facebookOAuthConfig.redirectUri,
        });

        const result = await request.promptAsync(discovery);

        if (result.type !== 'success') {
            throw new Error('OAuth cancelled or failed');
        }

        // Exchange OAuth code for JWT token
        const response = await exchangeOAuthCode('facebook', result.params.code);

        // Store token and user
        if (response.token) {
            await secureStorage.setToken(response.token);
        }
        if (response.user) {
            await secureStorage.setUser(response.user);
        }

        return response;
    } catch (error) {
        console.error('Facebook OAuth error:', error);
        throw error;
    }
}

/**
 * Exchange OAuth code for JWT token from backend
 */
async function exchangeOAuthCode(
    provider: 'google' | 'facebook',
    code: string
): Promise<OAuthResponse> {
    try {
        // First, get user info from the OAuth provider
        let userInfo;

        if (provider === 'google') {
            userInfo = await getGoogleUserInfo(code);
        } else if (provider === 'facebook') {
            userInfo = await getFacebookUserInfo(code);
        } else {
            throw new Error('Unsupported OAuth provider');
        }

        // Send user info to our mobile OAuth endpoint
        const response = await fetch(`${API_URL}/api/mobile/auth/oauth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                provider,
                code,
                userInfo,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'OAuth exchange failed');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('OAuth code exchange error:', error);
        throw error;
    }
}

/**
 * Get user info from Google
 */
async function getGoogleUserInfo(_code: string) {
    // This is a simplified version - in production you'd exchange the code for an access token
    // and then use that to get user info from Google's API
    // For now, we'll use the AuthSession result which should include user info
    return {
        email: 'user@example.com', // This would come from the actual OAuth response
        name: 'User Name',
        picture: null,
    };
}

/**
 * Get user info from Facebook
 */
async function getFacebookUserInfo(_code: string) {
    // Similar to Google, this would exchange code for access token and get user info
    return {
        email: 'user@example.com', // This would come from the actual OAuth response
        name: 'User Name',
        picture: null,
    };
}

/**
 * Check if OAuth provider is available
 */
export function isOAuthProviderAvailable(provider: 'google' | 'facebook'): boolean {
    if (provider === 'google') {
        return !!googleOAuthConfig.clientId;
    }
    if (provider === 'facebook') {
        return !!facebookOAuthConfig.clientId;
    }
    return false;
}
