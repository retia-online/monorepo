# OAuth Setup Guide for Mobile App

Esta guía explica cómo configurar OAuth (Google y Facebook) para la app móvil con Expo.

## 🔧 Configuración Requerida

### 1. Backend - Crear Endpoint de OAuth Callback

Necesitas crear un nuevo endpoint en `apps/web/src/app/api/auth/oauth/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User, UserRole } from '@retia/database';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { provider, code, redirectUrl } = await request.json();

    if (!provider || !code) {
      return NextResponse.json(
        { error: 'Missing provider or code' },
        { status: 400 }
      );
    }

    // Validate provider
    if (!['google', 'facebook'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }

    // Exchange OAuth code for tokens (implementation depends on provider)
    // This is a simplified example - you'll need to implement the actual OAuth flow

    await connectDB();

    // For now, return a mock response
    // In production, you would:
    // 1. Exchange the code for an access token
    // 2. Fetch user info from the provider
    // 3. Create or update user in database
    // 4. Generate JWT token

    return NextResponse.json({
      token: 'jwt-token-here',
      user: {
        id: 'user-id',
        name: 'User Name',
        email: 'user@example.com',
        role: 'USER',
      },
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: 'OAuth callback failed' },
      { status: 500 }
    );
  }
}
```

### 2. Google OAuth Setup

#### En Google Cloud Console:

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita "Google+ API"
4. Ve a "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Selecciona "Web application"
6. Añade URIs autorizados:
   - `http://localhost:3000` (desarrollo)
   - `https://tu-dominio.com` (producción)
7. Copia el Client ID y Client Secret

#### En tu `.env.local` (apps/mobile):

```bash
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

#### En tu `.env.local` (apps/web):

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Facebook OAuth Setup

#### En Facebook Developers:

1. Ve a [Facebook Developers](https://developers.facebook.com)
2. Crea una nueva app o selecciona una existente
3. Añade producto "Facebook Login"
4. En Settings → Basic:
   - Copia App ID y App Secret
5. En Facebook Login → Settings:
   - Añade URIs autorizados:
     - `http://localhost:3000` (desarrollo)
     - `https://tu-dominio.com` (producción)

#### En tu `.env.local` (apps/mobile):

```bash
EXPO_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
```

#### En tu `.env.local` (apps/web):

```bash
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

## 🔄 Flujo de OAuth en la App Móvil

1. **Usuario toca botón OAuth** (Google o Facebook)
2. **Expo Auth Session abre navegador** con el proveedor
3. **Usuario autoriza** la app en el proveedor
4. **Proveedor redirige** a `exp://...` (deep link de Expo)
5. **App móvil recibe el código** de autorización
6. **App envía código al backend** (`/api/auth/oauth/callback`)
7. **Backend intercambia código por token** con el proveedor
8. **Backend retorna JWT token** a la app
9. **App almacena token** en Secure Store
10. **Usuario es redirigido** a pantalla de perfil

## 📱 Testing en Desarrollo

### Con Simulador/Emulador:

```bash
# Asegúrate de que el backend esté corriendo
yarn workspace @retia/web dev

# En otra terminal, inicia la app móvil
yarn workspace @retia/mobile start

# Selecciona 'i' para iOS o 'a' para Android
```

### Con Dispositivo Físico:

1. Instala Expo Go desde App Store o Google Play
2. Escanea el código QR que aparece en la terminal
3. La app se abrirá en Expo Go

## 🐛 Troubleshooting

### Error: "OAuth cancelled or failed"

- Verifica que los Client IDs estén correctamente configurados
- Asegúrate de que las redirect URIs estén registradas en los proveedores
- Revisa la consola del navegador para más detalles

### Error: "OAuth code exchange failed"

- Verifica que el endpoint `/api/auth/oauth/callback` esté implementado
- Asegúrate de que el backend pueda intercambiar el código por tokens
- Revisa los logs del backend

### Deep linking no funciona

- En iOS: Verifica que el scheme `retia://` esté configurado en `app.json`
- En Android: Verifica que el intent filter esté configurado en `AndroidManifest.xml`
- Usa `AuthSession.getRedirectUrl()` para obtener la URL correcta

## 📚 Recursos

- [Expo Auth Session](https://docs.expo.dev/modules/expo-auth-session/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [NextAuth.js OAuth Providers](https://next-auth.js.org/providers/)

## ⚠️ Notas de Seguridad

1. **Nunca expongas Client Secrets en la app móvil** - Solo usa Client IDs públicos
2. **Siempre valida tokens en el backend** - No confíes en tokens del cliente
3. **Usa HTTPS en producción** - OAuth requiere conexiones seguras
4. **Implementa PKCE** - Para mayor seguridad en flujos OAuth móviles
5. **Rota tokens regularmente** - Implementa refresh tokens

## 🚀 Próximos Pasos

1. Implementar el endpoint `/api/auth/oauth/callback` en el backend
2. Integrar con NextAuth.js para manejar OAuth providers
3. Agregar soporte para refresh tokens
4. Implementar PKCE para mayor seguridad
5. Agregar más providers (Apple Sign In, etc.)
