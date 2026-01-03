// Main exports for @tu-org/auth package
export { authConfig, handlers, auth, signIn, signOut } from './auth-config';
export { requireAuth, requireAdmin, redirectIfAuthenticated, checkFirstUser } from './middleware';
export { createAuthMiddleware } from './route-middleware';

// Types
export type { AuthSession, AuthUser } from './types';