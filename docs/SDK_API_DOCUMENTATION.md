# SDK API Documentation

## Overview

This document provides comprehensive API documentation for all `@megamercado/*` SDK packages. Each SDK is designed to be independently versioned and consumed, providing specific functionality for authentication, data operations, UI components, and configuration management.

## Package Index

- [@megamercado/auth](#megamercadoauth) - Authentication and authorization
- [@megamercado/api](#megamercadoapi) - Database operations and services  
- [@megamercado/ui](#megamercadoui) - React components and layouts
- [@megamercado/configs](#megamercadoconfigs) - Configuration presets

---

## @megamercado/auth

**Version:** ^1.0.0  
**Purpose:** Centralized authentication configuration and route protection middleware

### Installation

```bash
npm install @megamercado/auth
```

### Configuration

```typescript
// .npmrc
@megamercado:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

### API Reference

#### authConfig

NextAuth configuration object with pre-configured providers and callbacks.

```typescript
import { authConfig } from '@megamercado/auth';

// Type
interface NextAuthConfig {
  providers: Provider[];
  callbacks: {
    jwt: (params: JWTParams) => Promise<JWT>;
    session: (params: SessionParams) => Promise<Session>;
  };
  adapter: Adapter;
  session: { strategy: "jwt" | "database" };
}

// Usage
export default NextAuth(authConfig);
```

**Example:**
```typescript
// apps/web/src/lib/auth.ts
import { authConfig } from '@megamercado/auth';
import NextAuth from 'next-auth';

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
```

#### handlers

Pre-configured NextAuth handlers for API routes.

```typescript
import { handlers } from '@megamercado/auth';

// Type
const handlers: {
  GET: (req: Request) => Promise<Response>;
  POST: (req: Request) => Promise<Response>;
}

// Usage in API routes
export const { GET, POST } = handlers;
```

**Example:**
```typescript
// apps/web/src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@megamercado/auth';

export const { GET, POST } = handlers;
```

#### auth

Authentication function for server-side session access.

```typescript
import { auth } from '@megamercado/auth';

// Type
function auth(): Promise<Session | null>;

// Usage
const session = await auth();
```

**Example:**
```typescript
// apps/web/src/app/profile/page.tsx
import { auth } from '@megamercado/auth';

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  return <div>Welcome, {session.user.name}</div>;
}
```

#### signIn / signOut

Client-side authentication functions.

```typescript
import { signIn, signOut } from '@megamercado/auth';

// Types
function signIn(provider?: string, options?: SignInOptions): Promise<SignInResponse>;
function signOut(options?: SignOutOptions): Promise<void>;

// Usage
await signIn('google');
await signOut();
```

**Example:**
```typescript
// apps/web/src/components/LoginButton.tsx
import { signIn, signOut } from '@megamercado/auth';

export function LoginButton() {
  return (
    <button onClick={() => signIn('google')}>
      Sign in with Google
    </button>
  );
}
```

#### requireAuth

Middleware function for protecting routes that require authentication.

```typescript
import { requireAuth } from '@megamercado/auth';

// Type
function requireAuth(request: NextRequest): Promise<NextResponse>;

// Usage in middleware
export default requireAuth;
```

**Example:**
```typescript
// apps/web/middleware.ts
import { requireAuth } from '@megamercado/auth';

export default requireAuth;

export const config = {
  matcher: ['/profile/:path*', '/admin/:path*']
};
```

#### requireAdmin

Middleware function for protecting admin-only routes.

```typescript
import { requireAdmin } from '@megamercado/auth';

// Type
function requireAdmin(request: NextRequest): Promise<NextResponse>;
```

**Example:**
```typescript
// apps/web/src/app/admin/middleware.ts
import { requireAdmin } from '@megamercado/auth';

export default requireAdmin;
```

#### redirectIfAuthenticated

Middleware function for redirecting authenticated users away from auth pages.

```typescript
import { redirectIfAuthenticated } from '@megamercado/auth';

// Type
function redirectIfAuthenticated(request: NextRequest): Promise<NextResponse>;
```

**Example:**
```typescript
// apps/web/src/app/login/middleware.ts
import { redirectIfAuthenticated } from '@megamercado/auth';

export default redirectIfAuthenticated;
```

### Types

```typescript
// Available types
export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  expires: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}
```

### Best Practices

1. **Environment Variables**: Always configure required environment variables:
   ```
   AUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   DATABASE_URL=mongodb://localhost:27017/your-db
   ```

2. **Middleware Configuration**: Use specific matchers to avoid protecting static assets:
   ```typescript
   export const config = {
     matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
   };
   ```

3. **Error Handling**: Always handle authentication errors gracefully:
   ```typescript
   try {
     await signIn('google');
   } catch (error) {
     console.error('Authentication failed:', error);
   }
   ```

---

## @megamercado/api

**Version:** ^1.0.0  
**Purpose:** Database operations, user services, and API utilities

### Installation

```bash
npm install @megamercado/api
```

### API Reference

#### connectDB

Database connection function with automatic retry and connection pooling.

```typescript
import { connectDB } from '@megamercado/api';

// Type
function connectDB(): Promise<typeof mongoose>;

// Usage
await connectDB();
```

**Example:**
```typescript
// apps/web/src/lib/db.ts
import { connectDB } from '@megamercado/api';

export async function initializeDatabase() {
  try {
    await connectDB();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}
```

#### User Model

Mongoose model for user data with built-in validation and methods.

```typescript
import { User, UserRole } from '@megamercado/api';

// Type
interface IUser {
  _id: ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Usage
const user = await User.findById(userId);
```

**Example:**
```typescript
// apps/web/src/app/api/users/route.ts
import { User } from '@megamercado/api';

export async function GET() {
  const users = await User.find({ role: 'user' });
  return Response.json(users);
}
```

#### Account Model

Mongoose model for OAuth account linking.

```typescript
import { Account } from '@megamercado/api';

// Type
interface IAccount {
  _id: ObjectId;
  userId: ObjectId;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
}
```

#### Session Model

Mongoose model for user sessions.

```typescript
import { Session } from '@megamercado/api';

// Type
interface ISession {
  _id: ObjectId;
  sessionToken: string;
  userId: ObjectId;
  expires: Date;
}
```

#### getUserBackup

Service function to retrieve user data backup.

```typescript
import { getUserBackup } from '@megamercado/api';

// Type
function getUserBackup(userId: string): Promise<UserBackup>;

interface UserBackup {
  user: IUser;
  accounts: IAccount[];
  sessions: ISession[];
  metadata: {
    exportDate: Date;
    version: string;
  };
}
```

**Example:**
```typescript
// apps/web/src/app/api/user/backup/route.ts
import { getUserBackup } from '@megamercado/api';
import { auth } from '@megamercado/auth';

export async function GET() {
  const session = await auth();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const backup = await getUserBackup(session.user.id);
  return Response.json(backup);
}
```

#### createUser

Service function to create new users with validation.

```typescript
import { createUser } from '@megamercado/api';

// Type
function createUser(userData: CreateUserData): Promise<IUser>;

interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  role?: UserRole;
}
```

**Example:**
```typescript
// apps/web/src/app/api/register/route.ts
import { createUser } from '@megamercado/api';

export async function POST(request: Request) {
  const { name, email, password } = await request.json();
  
  try {
    const user = await createUser({ name, email, password });
    return Response.json({ success: true, userId: user._id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
```

#### updateUser

Service function to update user information.

```typescript
import { updateUser } from '@megamercado/api';

// Type
function updateUser(userId: string, updates: Partial<IUser>): Promise<IUser>;
```

#### sendEmail

Email service function with template support.

```typescript
import { sendEmail } from '@megamercado/api';

// Type
function sendEmail(options: EmailOptions): Promise<void>;

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  templateData?: Record<string, any>;
}
```

**Example:**
```typescript
// apps/web/src/app/api/send-welcome/route.ts
import { sendEmail } from '@megamercado/api';

export async function POST(request: Request) {
  const { email, name } = await request.json();
  
  await sendEmail({
    to: email,
    subject: 'Welcome!',
    template: 'welcome',
    templateData: { name }
  });
  
  return Response.json({ success: true });
}
```

#### hashPassword / comparePassword

Cryptographic utilities for password handling.

```typescript
import { hashPassword, comparePassword } from '@megamercado/api';

// Types
function hashPassword(password: string): Promise<string>;
function comparePassword(password: string, hash: string): Promise<boolean>;
```

**Example:**
```typescript
// apps/web/src/app/api/change-password/route.ts
import { hashPassword, comparePassword } from '@megamercado/api';
import { User } from '@megamercado/api';

export async function POST(request: Request) {
  const { userId, currentPassword, newPassword } = await request.json();
  
  const user = await User.findById(userId);
  const isValid = await comparePassword(currentPassword, user.password);
  
  if (!isValid) {
    return Response.json({ error: 'Invalid password' }, { status: 400 });
  }
  
  const hashedPassword = await hashPassword(newPassword);
  await User.findByIdAndUpdate(userId, { password: hashedPassword });
  
  return Response.json({ success: true });
}
```

### Best Practices

1. **Database Connection**: Always connect to database before operations:
   ```typescript
   import { connectDB } from '@megamercado/api';
   
   export async function GET() {
     await connectDB();
     // Perform database operations
   }
   ```

2. **Error Handling**: Use try-catch blocks for database operations:
   ```typescript
   try {
     const user = await User.findById(userId);
   } catch (error) {
     return Response.json({ error: 'User not found' }, { status: 404 });
   }
   ```

3. **Validation**: Always validate input data:
   ```typescript
   import { z } from 'zod';
   
   const userSchema = z.object({
     name: z.string().min(1),
     email: z.string().email()
   });
   
   const validatedData = userSchema.parse(requestData);
   ```

---

## @megamercado/ui

**Version:** ^1.0.0  
**Purpose:** Reusable React components and layouts

### Installation

```bash
npm install @megamercado/ui
```

### API Reference

#### Button

Customizable button component with multiple variants.

```typescript
import { Button } from '@megamercado/ui';

// Type
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}
```

**Example:**
```typescript
// apps/web/src/app/page.tsx
import { Button } from '@megamercado/ui';

export default function HomePage() {
  return (
    <div>
      <Button variant="primary" size="lg">
        Get Started
      </Button>
      <Button variant="secondary" loading>
        Loading...
      </Button>
    </div>
  );
}
```

#### Card

Container component for content grouping.

```typescript
import { Card } from '@megamercado/ui';

// Type
interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}
```

**Example:**
```typescript
import { Card, Button } from '@megamercado/ui';

export function UserCard({ user }) {
  return (
    <Card 
      title={user.name}
      subtitle={user.email}
      actions={<Button size="sm">Edit</Button>}
    >
      <p>Role: {user.role}</p>
    </Card>
  );
}
```

#### Input

Form input component with validation support.

```typescript
import { Input } from '@megamercado/ui';

// Type
interface InputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}
```

**Example:**
```typescript
import { Input } from '@megamercado/ui';
import { useState } from 'react';

export function ContactForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  return (
    <form>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        error={error}
        required
      />
    </form>
  );
}
```

#### PasswordStrength

Password strength indicator component.

```typescript
import { PasswordStrength } from '@megamercado/ui';

// Type
interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}
```

**Example:**
```typescript
import { Input, PasswordStrength } from '@megamercado/ui';
import { useState } from 'react';

export function PasswordForm() {
  const [password, setPassword] = useState('');
  
  return (
    <div>
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
      />
      <PasswordStrength 
        password={password} 
        showRequirements 
      />
    </div>
  );
}
```

#### LoginForm

Pre-built login form with OAuth integration.

```typescript
import { LoginForm } from '@megamercado/ui';

// Type
interface LoginFormProps {
  onSubmit?: (credentials: LoginCredentials) => void;
  providers?: string[];
  redirectTo?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}
```

**Example:**
```typescript
// apps/web/src/app/login/page.tsx
import { LoginForm } from '@megamercado/ui';
import { signIn } from '@megamercado/auth';

export default function LoginPage() {
  const handleLogin = async (credentials) => {
    await signIn('credentials', credentials);
  };
  
  return (
    <LoginForm 
      onSubmit={handleLogin}
      providers={['google', 'github']}
      redirectTo="/dashboard"
    />
  );
}
```

#### Navbar

Navigation component with authentication integration.

```typescript
import { Navbar } from '@megamercado/ui';

// Type
interface NavbarProps {
  user?: AuthUser;
  onSignOut?: () => void;
  links?: NavLink[];
}

interface NavLink {
  href: string;
  label: string;
  requireAuth?: boolean;
}
```

**Example:**
```typescript
// apps/web/src/components/Layout.tsx
import { Navbar } from '@megamercado/ui';
import { auth, signOut } from '@megamercado/auth';

export async function Layout({ children }) {
  const session = await auth();
  
  const links = [
    { href: '/', label: 'Home' },
    { href: '/profile', label: 'Profile', requireAuth: true },
    { href: '/admin', label: 'Admin', requireAuth: true }
  ];
  
  return (
    <div>
      <Navbar 
        user={session?.user}
        onSignOut={signOut}
        links={links}
      />
      <main>{children}</main>
    </div>
  );
}
```

#### ProfileCard

User profile display component.

```typescript
import { ProfileCard } from '@megamercado/ui';

// Type
interface ProfileCardProps {
  user: AuthUser;
  editable?: boolean;
  onEdit?: (user: AuthUser) => void;
}
```

**Example:**
```typescript
// apps/web/src/app/profile/page.tsx
import { ProfileCard } from '@megamercado/ui';
import { auth } from '@megamercado/auth';

export default async function ProfilePage() {
  const session = await auth();
  
  return (
    <ProfileCard 
      user={session.user}
      editable
      onEdit={(user) => console.log('Edit user:', user)}
    />
  );
}
```

### Layout Components

#### BaseLayout

Basic page layout with header and footer.

```typescript
import { BaseLayout } from '@megamercado/ui';

// Type
interface BaseLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}
```

#### AuthLayout

Layout for authentication pages.

```typescript
import { AuthLayout } from '@megamercado/ui';

// Type
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}
```

### Styling

The UI package includes base CSS that should be imported in your application:

```typescript
// apps/web/src/app/layout.tsx
import '@megamercado/ui/styles.css';
```

### Best Practices

1. **Component Composition**: Use components together for better UX:
   ```typescript
   <Card>
     <Input label="Name" />
     <Button type="submit">Save</Button>
   </Card>
   ```

2. **Error Handling**: Always handle component errors:
   ```typescript
   <Input 
     error={errors.email}
     onChange={(value) => {
       setEmail(value);
       if (errors.email) setErrors({...errors, email: ''});
     }}
   />
   ```

3. **Accessibility**: Components include ARIA attributes, but ensure proper usage:
   ```typescript
   <Button aria-label="Close dialog" onClick={onClose}>
     ×
   </Button>
   ```

---

## @megamercado/configs

**Version:** ^1.0.0  
**Purpose:** Shared configuration presets for Tailwind, TypeScript, and ESLint

### Installation

```bash
npm install @megamercado/configs
```

### API Reference

#### tailwindPreset

Pre-configured Tailwind CSS preset with design system tokens.

```javascript
import { tailwindPreset } from '@megamercado/configs';

// Usage in tailwind.config.js
const { tailwindPreset } = require('@megamercado/configs');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  presets: [tailwindPreset]
};
```

**Example:**
```javascript
// apps/web/tailwind.config.js
const { tailwindPreset } = require('@megamercado/configs');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  presets: [tailwindPreset],
  theme: {
    extend: {
      // Additional customizations
    }
  }
};
```

**Included Configuration:**
- Color palette with primary, secondary, and semantic colors
- Typography scale with consistent font sizes and line heights
- Spacing scale following 8px grid system
- Border radius and shadow utilities
- Responsive breakpoints

**Available Colors:**
```css
/* Primary colors */
.text-primary-50 { color: #eff6ff; }
.text-primary-500 { color: #3b82f6; }
.text-primary-900 { color: #1e3a8a; }

/* Semantic colors */
.text-success-500 { color: #10b981; }
.text-warning-500 { color: #f59e0b; }
.text-error-500 { color: #ef4444; }
```

#### tsconfig

Base TypeScript configuration for all projects.

```typescript
import { tsconfig } from '@megamercado/configs';
```

**Example:**
```json
// tsconfig.json
{
  "extends": "@megamercado/configs/tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Included Settings:**
- Strict type checking enabled
- Modern ES target (ES2022)
- Module resolution for Node.js
- Declaration file generation
- Source map support

#### tsconfigReact

React-specific TypeScript configuration.

```typescript
import { tsconfigReact } from '@megamercado/configs';
```

**Example:**
```json
// tsconfig.json (React projects)
{
  "extends": "@megamercado/configs/tsconfig.react.json",
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Additional React Settings:**
- JSX support with React 18
- React hooks rules
- Component prop validation
- Event handler types

#### eslintConfig

Shared ESLint configuration with best practices.

```typescript
import { eslintConfig } from '@megamercado/configs';
```

**Example:**
```javascript
// eslint.config.js
const { eslintConfig } = require('@megamercado/configs');

module.exports = [
  ...eslintConfig,
  {
    // Project-specific overrides
    rules: {
      'no-console': 'warn'
    }
  }
];
```

**Included Rules:**
- TypeScript recommended rules
- React hooks rules
- Import/export validation
- Code formatting rules
- Security best practices

### Usage Examples

#### Complete Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  }
};

module.exports = nextConfig;

// tailwind.config.js
const { tailwindPreset } = require('@megamercado/configs');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  presets: [tailwindPreset]
};

// tsconfig.json
{
  "extends": "@megamercado/configs/tsconfig.react.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### React Native Configuration

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;

// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};

// tsconfig.json
{
  "extends": "@megamercado/configs/tsconfig.react.json",
  "compilerOptions": {
    "allowJs": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "jsx": "react-native"
  }
}
```

### Best Practices

1. **Extend, Don't Override**: Always extend configurations rather than replacing:
   ```json
   {
     "extends": "@megamercado/configs/tsconfig.base.json",
     "compilerOptions": {
       "baseUrl": "."
     }
   }
   ```

2. **Project-Specific Customization**: Add project-specific rules as needed:
   ```javascript
   module.exports = [
     ...eslintConfig,
     {
       files: ['**/*.test.ts'],
       rules: {
         'no-console': 'off'
       }
     }
   ];
   ```

3. **Version Consistency**: Keep config package versions consistent across projects:
   ```json
   {
     "devDependencies": {
       "@megamercado/configs": "^1.0.0"
     }
   }
   ```

---

## Breaking Changes and Migration Paths

### Version 1.x to 2.x Migration

When major version updates occur, follow these migration steps:

#### @megamercado/auth v2.0.0

**Breaking Changes:**
- `authConfig` now requires explicit provider configuration
- `requireAuth` middleware signature changed
- Removed deprecated `redirectIfAuthenticated` function

**Migration Steps:**
```typescript
// Before (v1.x)
import { authConfig, redirectIfAuthenticated } from '@megamercado/auth';

// After (v2.x)
import { authConfig, createAuthConfig } from '@megamercado/auth';

const config = createAuthConfig({
  providers: ['google', 'github'],
  // explicit configuration required
});
```

#### @megamercado/api v2.0.0

**Breaking Changes:**
- `getUserBackup` now returns Promise<UserBackupV2>
- Database connection requires explicit configuration
- Removed deprecated utility functions

**Migration Steps:**
```typescript
// Before (v1.x)
import { getUserBackup } from '@megamercado/api';
const backup = await getUserBackup(userId);

// After (v2.x)
import { getUserBackup, BackupOptions } from '@megamercado/api';
const backup = await getUserBackup(userId, { includeMetadata: true });
```

### Deprecation Notices

Functions and components marked for deprecation in future versions:

- `@megamercado/ui`: `BaseLayout` will be replaced with `Layout` in v2.0.0
- `@megamercado/auth`: `redirectIfAuthenticated` deprecated, use middleware config instead
- `@megamercado/api`: Direct model exports will be moved to separate package in v3.0.0

## Support and Contributing

### Getting Help

1. **Documentation**: Check this API documentation first
2. **GitHub Issues**: Create issues in respective SDK repositories
3. **Team Chat**: Contact the development team for urgent issues

### Contributing

1. **Fork** the SDK repository you want to contribute to
2. **Create** a feature branch: `git checkout -b feature/new-feature`
3. **Test** your changes thoroughly
4. **Submit** a pull request with detailed description

### Reporting Issues

When reporting issues, include:

- SDK package name and version
- Node.js and npm versions
- Minimal reproduction example
- Error messages and stack traces
- Expected vs actual behavior

---

## Changelog

### @megamercado/auth

#### v1.0.0 (2024-01-15)
- Initial release
- NextAuth configuration extraction
- Route protection middleware
- TypeScript support

### @megamercado/api

#### v1.0.0 (2024-01-15)
- Initial release
- Database models and connection
- User services including getUserBackup
- Email and crypto utilities

### @megamercado/ui

#### v1.0.0 (2024-01-15)
- Initial release
- Base components (Button, Card, Input)
- Auth components (LoginForm, Navbar)
- Layout components

### @megamercado/configs

#### v1.0.0 (2024-01-15)
- Initial release
- Tailwind CSS preset
- TypeScript configurations
- ESLint configuration