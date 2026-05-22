# API Endpoints Documentation

This document describes all API endpoints used by the mobile app and their expected request/response formats.

## Base URL

```
http://localhost:3000  (development)
https://your-domain.com (production)
```

## Authentication Endpoints

### 1. Login (Email/Password)

**Endpoint**: `POST /api/auth/signin`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success - 200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "USER",
    "image": null
  }
}
```

**Response (Error - 401)**:
```json
{
  "error": "Email o contraseña incorrectos"
}
```

**Response (Error - 400)**:
```json
{
  "error": "Datos inválidos",
  "details": [
    {
      "code": "invalid_string",
      "message": "Invalid email",
      "path": ["email"]
    }
  ]
}
```

---

### 2. Register

**Endpoint**: `POST /api/register`

**Request**:
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success - 201)**:
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

**Response (Error - 400 - Email exists)**:
```json
{
  "error": "Email ya registrado"
}
```

**Response (Error - 400 - Validation)**:
```json
{
  "error": "Datos inválidos",
  "details": [
    {
      "code": "too_small",
      "message": "Password must be at least 6 characters",
      "path": ["password"]
    }
  ]
}
```

---

### 3. Get Session/Profile

**Endpoint**: `GET /api/auth/session`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "USER",
    "image": null
  }
}
```

**Response (Error - 401 - Token expired)**:
```json
{
  "error": "Unauthorized"
}
```

---

### 4. Logout

**Endpoint**: `POST /api/auth/signout`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "message": "Logged out successfully"
}
```

---

### 5. OAuth Callback (Mobile)

**Endpoint**: `POST /api/auth/oauth/callback`

**Request**:
```json
{
  "provider": "google",
  "code": "authorization-code-from-provider",
  "redirectUrl": "exp://..."
}
```

**Response (Success - 200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "USER",
    "image": "https://..."
  }
}
```

**Response (Error - 400)**:
```json
{
  "error": "OAuth callback failed"
}
```

---

## Error Handling

### Common Error Codes

| Status | Code | Message | Meaning |
|--------|------|---------|---------|
| 400 | VALIDATION_ERROR | Datos inválidos | Input validation failed |
| 400 | EMAIL_EXISTS | Email ya registrado | Email already registered |
| 401 | INVALID_CREDENTIALS | Email o contraseña incorrectos | Wrong email or password |
| 401 | UNAUTHORIZED | Unauthorized | Token expired or invalid |
| 500 | SERVER_ERROR | Error al procesar la solicitud | Server error |

### Error Response Format

```json
{
  "error": "Error message",
  "details": [
    {
      "code": "error_code",
      "message": "Detailed error message",
      "path": ["field_name"]
    }
  ]
}
```

---

## Authentication

All authenticated endpoints require the `Authorization` header with a Bearer token:

```
Authorization: Bearer <jwt-token>
```

The token is obtained from the login or register endpoints and should be stored securely in the device's Secure Store.

---

## Rate Limiting

The backend implements rate limiting on authentication endpoints:

- **Login**: 5 attempts per 15 minutes per IP
- **Register**: 3 attempts per hour per IP
- **Forgot Password**: 3 attempts per hour per email

When rate limited, the response will be:

```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 900
}
```

---

## CORS

The backend should be configured to accept requests from:

- `http://localhost:3000` (web development)
- `http://localhost:19000` (Expo development)
- `exp://` (Expo production)
- Your production domain

---

## Testing Endpoints

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Register
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"user@example.com","password":"password123"}'

# Get Session
curl -X GET http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer <token>"

# Logout
curl -X POST http://localhost:3000/api/auth/signout \
  -H "Authorization: Bearer <token>"
```

### Using Postman

1. Create a new collection
2. Add requests for each endpoint
3. Use the `Authorization` tab to set Bearer token
4. Test with different payloads

---

## Implementation Checklist

- [ ] Login endpoint returns correct token and user data
- [ ] Register endpoint creates user and returns correct role
- [ ] Get session endpoint returns current user data
- [ ] Logout endpoint clears session
- [ ] OAuth callback endpoint exchanges code for token
- [ ] 401 responses trigger logout in mobile app
- [ ] Error messages are user-friendly
- [ ] Rate limiting is working
- [ ] CORS is properly configured
- [ ] All endpoints validate input with Zod

---

## Notes

- All timestamps are in ISO 8601 format
- All IDs are MongoDB ObjectIds (24-character hex strings)
- Passwords are hashed with bcryptjs before storage
- Tokens are JWT with 24-hour expiration
- First user registered automatically gets ADMIN role
