# @core/auth

Authentication SDK with NextAuth configuration and route protection middleware.

## Installation

```bash
npm install @core/auth
```

## Usage

### Basic Setup

```typescript
import { authConfig, handlers, auth } from '@core/auth';

// Use in your Next.js app
export const { GET, POST } = handlers;
```

### Route Protection

```typescript
import { requireAuth, requireAdmin } from '@core/auth';

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
import { createAuthMiddleware } from '@core/auth';

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

## Mobile Authentication

For mobile applications that don't use NextAuth on the client, you can use JWT-based authentication:

```typescript
import { generateMobileToken, verifyMobileToken } from '@core/auth';

// In your API route
const token = await generateMobileToken(user, process.env.NEXTAUTH_SECRET);

// Verify token
const payload = await verifyMobileToken(token, process.env.NEXTAUTH_SECRET);
```

## Features

- NextAuth.js configuration with multiple providers
- Route protection middleware
- Role-based access control
- OAuth integration (Google, Facebook)
- Email/password authentication
- TypeScript support