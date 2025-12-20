import { redirect } from 'next/navigation';
import { auth } from './auth';
import { connectDB, User } from '@retia/database';
import { getEnv } from './env';

/**
 * Protects a page by requiring authentication
 * Behavior depends on AUTH_MODE:
 * - required: Redirects to login if not authenticated
 * - disabled: Returns null (no auth required)
 * - optional: Returns session if available, null if not (no redirect)
 * @param callbackUrl - Optional URL to redirect to after login
 */
export async function requireAuth(callbackUrl?: string) {
    const env = getEnv();
    
    // If auth is disabled, return null session
    if (env.AUTH_MODE === 'disabled') {
        return null;
    }
    
    const session = await auth();

    // If auth is optional, return session (or null) without redirecting
    if (env.AUTH_MODE === 'optional') {
        return session;
    }

    // If auth is required and no session, redirect to login
    if (!session || !session.user) {
        const loginUrl = callbackUrl
            ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
            : '/login';
        redirect(loginUrl);
    }

    return session;
}

/**
 * Redirects authenticated users away from auth pages
 * Use this on login/register pages
 */
export async function redirectIfAuthenticated() {
    const session = await auth();

    if (session && session.user) {
        redirect('/');
    }
}

/**
 * Requires admin role
 * Redirects to home if not admin
 */
export async function requireAdmin() {
    const session = await requireAuth();

    if (session.user.role !== 'ADMIN') {
        redirect('/');
    }

    return session;
}

/**
 * Checks if there are any users in the database
 * If no users exist, redirects to register
 */
export async function checkFirstUser() {
    await connectDB();
    const userCount = await User.countDocuments();

    if (userCount === 0) {
        redirect('/register');
    }
}
