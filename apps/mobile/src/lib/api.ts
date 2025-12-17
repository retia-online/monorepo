import { loginSchema, registerSchema } from '@retia/utils';
import { secureStorage } from './secure-storage';
import { getApiUrl } from './env';

const API_URL = getApiUrl();

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Callback for session expiration
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredCallback(callback: () => void) {
  onSessionExpired = callback;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await secureStorage.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function handleUnauthorized() {
  // Clear storage
  await secureStorage.clear();
  
  // Call callback if set
  if (onSessionExpired) {
    onSessionExpired();
  }
}

export const api = {
  async login(email: string, password: string) {
    try {
      // Validate input
      const validated = loginSchema.parse({ email, password });

      // Use mobile-specific login endpoint
      const response = await fetch(`${API_URL}/api/mobile/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validated),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      // Store token and user
      if (data.token) {
        await secureStorage.setToken(data.token);
      }
      if (data.user) {
        await secureStorage.setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(name: string, email: string, password: string) {
    try {
      // Validate input
      const validated = registerSchema.parse({ name, email, password });

      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validated),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      
      // Auto-login after registration
      if (data.user) {
        await secureStorage.setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async getProfile() {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_URL}/api/mobile/auth/profile`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          await handleUnauthorized();
          throw new Error('Session expired');
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      
      if (data.user) {
        await secureStorage.setUser(data.user);
        return data.user;
      }

      throw new Error('No user data received');
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      // For mobile, we just clear the local token
      // The JWT will expire naturally on the server
      await secureStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear storage even if operation fails
      await secureStorage.clear();
      throw error;
    }
  },
};
