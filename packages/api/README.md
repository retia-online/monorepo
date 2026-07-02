# @core/api

API services and database models for the Monorepo platform.

## Installation

```bash
npm install @core/api
```

## Usage

### Database Connection

```typescript
import { connectDB } from '@core/api';

await connectDB();
```

### Models

```typescript
import { User, Account, Session } from '@core/api';

// Create a new user
const user = new User({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'USER'
});

await user.save();
```

### Services

```typescript
import { getUserBackup, sendEmail } from '@core/api';

// Get user backup data
const backup = await getUserBackup(userId);

// Send email
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<h1>Welcome!</h1>'
});
```

## Environment Variables

The following environment variables are required:

- `MONGODB_URI` - MongoDB connection string
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASSWORD` - SMTP password
- `NEXTAUTH_URL` - Base URL for the application
- `PRIMARY_COLOR` - Primary color for email templates (optional)

## API Reference

### Database Models

- `User` - User model with authentication and authorization
- `Account` - OAuth account model
- `Session` - User session model

### Services

- `getUserBackup(userId)` - Get user backup data
- `createUser(userData)` - Create a new user
- `updateUser(userId, userData)` - Update user data
- `sendEmail(options)` - Send email
- `sendPasswordResetEmail(email, token)` - Send password reset email
- `sendWelcomeEmail(name, email)` - Send welcome email
- `sendPendingApprovalEmail(name, email)` - Send pending approval email

### Utilities

- `hashPassword(password)` - Hash a password
- `comparePassword(password, hash)` - Compare password with hash
- `connectDB()` - Connect to MongoDB database

