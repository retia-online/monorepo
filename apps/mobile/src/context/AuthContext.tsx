import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setSessionExpiredCallback } from '../lib/api';
import { secureStorage } from '../lib/secure-storage';
import { loginWithGoogle, loginWithFacebook } from '../lib/oauth';
import { User, AuthContextType, LoginCredentials, RegisterCredentials } from '../types';

interface ExtendedAuthContextType extends AuthContextType {
    loginWithGoogle: () => Promise<void>;
    loginWithFacebook: () => Promise<void>;
}

const AuthContext = createContext<ExtendedAuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSignedIn, setIsSignedIn] = useState(false);

    // Initialize auth state on app start
    useEffect(() => {
        bootstrapAsync();

        // Set callback for session expiration
        setSessionExpiredCallback(() => {
            setUser(null);
            setIsSignedIn(false);
        });
    }, []);

    const bootstrapAsync = async () => {
        console.log('--- AuthContext: bootstrapAsync started ---');
        try {
            console.log('--- AuthContext: calling secureStorage ---');
            // Try to restore token and user from secure storage
            const [token, storedUser] = await Promise.all([
                secureStorage.getToken(),
                secureStorage.getUser(),
            ]);

            if (token && storedUser) {
                console.log('--- AuthContext: restored session ---');
                setUser(storedUser as User);
                setIsSignedIn(true);
            } else {
                console.log('--- AuthContext: no restored session ---');
            }
        } catch (error) {
            console.error('--- AuthContext: Failed to restore session:', error);
        } finally {
            console.log('--- AuthContext: bootstrapAsync finished ---');
            setIsLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            const response = await api.login(credentials.email, credentials.password, credentials.provider);
            setUser(response.user);
            setIsSignedIn(true);
        } catch (error) {
            setIsSignedIn(false);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (credentials: RegisterCredentials) => {
        setIsLoading(true);
        try {
            const response = await api.register(
                credentials.name,
                credentials.email,
                credentials.password
            );
            setUser(response.user);
            setIsSignedIn(true);
        } catch (error) {
            setIsSignedIn(false);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await api.logout();
            setUser(null);
            setIsSignedIn(false);
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local state even if API call fails
            setUser(null);
            setIsSignedIn(false);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshProfile = async () => {
        try {
            const updatedUser = await api.getProfile();
            setUser(updatedUser);
        } catch (error) {
            console.error('Failed to refresh profile:', error);
            // If session expired, logout
            if (error instanceof Error && error.message === 'Session expired') {
                await logout();
            }
            throw error;
        }
    };

    const handleLoginWithGoogle = async () => {
        setIsLoading(true);
        try {
            const response = await loginWithGoogle();
            setUser(response.user as User);
            setIsSignedIn(true);
        } catch (error) {
            setIsSignedIn(false);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginWithFacebook = async () => {
        setIsLoading(true);
        try {
            const response = await loginWithFacebook();
            setUser(response.user as User);
            setIsSignedIn(true);
        } catch (error) {
            setIsSignedIn(false);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const value: ExtendedAuthContextType = {
        user,
        isLoading,
        isSignedIn,
        login,
        register,
        logout,
        refreshProfile,
        loginWithGoogle: handleLoginWithGoogle,
        loginWithFacebook: handleLoginWithFacebook,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
