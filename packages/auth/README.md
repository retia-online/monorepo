# @megamercado/auth

Authentication SDK with NextAuth configuration and route protection middleware.

## Installation

```bash
npm install @megamercado/auth
```

## Usage

### Basic Setup

```typescript
import { authConfig, handlers, auth } from '@megamercado/auth';

// Use in your Next.js app
export const { GET, POST } = handlers;
```

### Route Protection

```typescript
import { requireAuth, requireAdmin } from '@megamercado/auth';

// Protect a page
export default async function ProtectedPage() {
  const session = await requireAuth();
  return <div>Hello {session.user.name}</div>;
}

// Admin only page
export default async function AdminPage() {
  const session = await requireAdmin();
  return <div>Admin Dashboard</div>;
}
```

### Middleware

```typescript
import { createAuthMiddleware } from '@megamercado/auth';

export const middleware = createAuthMiddleware({
  protectedRoutes: ['/dashboard', '/profile'],
  adminRoutes: ['/admin']
});
```

## Environment Variables

Required environment variables:

- `NEXTAUTH_SECRET` - Secret for JWT signing
- `AUTH_PROVIDERS` - Comma-separated list of enabled providers (email,google,facebook)
- `AUTH_MODE` - Authentication mode (required, optional, disabled)

Optional OAuth variables:
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `FACEBOOK_CLIENT_ID` & `FACEBOOK_CLIENT_SECRET` - For Facebook OAuth

## Features

- NextAuth.js configuration with multiple providers
- Route protection middleware
- Role-based access control
- OAuth integration (Google, Facebook)
- Email/password authentication
- TypeScript support