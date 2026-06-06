import { NextResponse } from 'next/server';
import { auth } from './auth-config';

export interface AuthMiddlewareConfig {
  protectedRoutes?: string[];
  adminRoutes?: string[];
  publicRoutes?: string[];
  loginPath?: string;
  homePath?: string;
}

/**
 * Creates a Next.js middleware function for route protection
 * @param config Configuration for route protection
 * @returns Middleware function
 */
export function createAuthMiddleware(config: AuthMiddlewareConfig = {}) {
  const {
    protectedRoutes = [],
    adminRoutes = [],
    publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'],
    loginPath = '/login',
    homePath = '/',
  } = config;

  return auth(async function middleware(request: any) {
    const { pathname } = request.nextUrl;
    const session = request.auth;
    
    const isAuthenticated = !!session;
    const isAdmin = (session?.user as any)?.role === 'ADMIN';

    // Check if route is public
    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    // Check if route requires authentication
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    // Check if route requires admin
    const isAdminRoute = adminRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && isPublicRoute && !pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL(homePath, request.url));
    }

    // Protect admin routes
    if (isAdminRoute && (!isAuthenticated || !isAdmin)) {
      if (!isAuthenticated) {
        const loginUrl = new URL(loginPath, request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      } else {
        // Authenticated but not admin - redirect to home
        return NextResponse.redirect(new URL(homePath, request.url));
      }
    }

    // Protect authenticated routes
    if (isProtectedRoute && !isAuthenticated) {
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  });
}

/**
 * Default middleware configuration for common use cases
 */
export const defaultMiddlewareConfig: AuthMiddlewareConfig = {
  protectedRoutes: ['/dashboard', '/profile'],
  adminRoutes: ['/admin'],
  publicRoutes: ['/login', '/register', '/forgot-password', '/reset-password'],
  loginPath: '/login',
  homePath: '/',
};