import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let token = null;
  try {
    // Get session token directly avoiding mongoose in edge runtime
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || 'fallback-secret'
    });
  } catch (error) {
    console.error('Middleware getToken error:', error);
  }

  const isAuthenticated = !!token;
  const isAdmin = token?.role === 'ADMIN';

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
}

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