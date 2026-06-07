// Force Node.js runtime — mongoose and @core/api are incompatible with Edge runtime
export const runtime = 'nodejs';

// Fix for ReferenceError: global is not defined in Vercel Edge Runtime
if (typeof global === 'undefined') {
  (globalThis as any).global = globalThis;
}

import { NextResponse } from 'next/server';
import { auth } from './src/lib/auth';

export default auth((request: any) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;
  const isAuthenticated = !!session;
  
  // Under NextAuth v5, session.user holds the custom properties if mapped in callbacks
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  // Configured route patterns
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const protectedRoutes = ['/dashboard', '/profile'];
  const adminRoutes = ['/admin'];

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
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect admin routes
  if (isAdminRoute && (!isAuthenticated || !isAdmin)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    } else {
      // Authenticated but not admin - redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect authenticated routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};