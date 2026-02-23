# Guía de Variables de Entorno

## Validación Automática

El proyecto utiliza **Zod** para validar todas las variables de entorno al inicio de la aplicación. Esto garantiza que:

- Todas las variables requeridas estén presentes
- Los valores tengan el formato correcto
- Las dependencias entre variables se cumplan
- Los errores se detecten antes de que la aplicación se ejecute

## Configuración

### 1. Copiar el Template

```bash
cp apps/web/.env.example apps/web/.env.local
```

### 2. Editar Variables

Abre `apps/web/.env.local` y configura tus valores:

```env
# Requerido
MONGODB_URI=mongodb://localhost:27017/megamercado
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secreto-de-al-menos-32-caracteres

# Opcional
AUTH_PROVIDERS=email,google
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
```

## Variables Requeridas

### NODE_ENV
- **Tipo**: `'development' | 'production' | 'test'`
- **Default**: `'development'`
- **Descripción**: Entorno de ejecución

### MONGODB_URI
- **Tipo**: `string`
- **Requerido**: ✅
- **Descripción**: URI de conexión a MongoDB
- **Ejemplo**: `mongodb://localhost:27017/mydb`
- **Ejemplo (Atlas)**: `mongodb+srv://user:pass@cluster.mongodb.net/mydb`

### NEXTAUTH_URL
- **Tipo**: `string` (URL válida)
- **Requerido**: ✅
- **Descripción**: URL base de la aplicación
- **Desarrollo**: `http://localhost:3000`
- **Producción**: `https://tudominio.com`

### NEXTAUTH_SECRET
- **Tipo**: `string` (mínimo 32 caracteres)
- **Requerido**: ✅
- **Descripción**: Secreto para firmar tokens JWT
- **Generar**: `openssl rand -base64 32`
- **⚠️ IMPORTANTE**: Usa diferentes secretos en desarrollo y producción

## Variables Opcionales

### AUTH_PROVIDERS
- **Tipo**: `string`
- **Default**: `'email'`
- **Opciones**: `'email'`, `'google'`, `'facebook'` (separados por comas)
- **Ejemplo**: `'email,google,facebook'`

### OAuth Providers

#### Google
Si incluyes `'google'` en `AUTH_PROVIDERS`, debes configurar:

- **GOOGLE_CLIENT_ID**: Client ID de Google Cloud Console
- **GOOGLE_CLIENT_SECRET**: Client Secret de Google Cloud Console

Obtener credenciales:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Crea un proyecto o selecciona uno existente
3. Crea credenciales OAuth 2.0
4. Configura URIs de redirección: `http://localhost:3000/api/auth/callback/google`

#### Facebook
Si incluyes `'facebook'` en `AUTH_PROVIDERS`, debes configurar:

- **FACEBOOK_CLIENT_ID**: App ID de Facebook Developers
- **FACEBOOK_CLIENT_SECRET**: App Secret de Facebook Developers

Obtener credenciales:
1. Ve a [Facebook Developers](https://developers.facebook.com/apps/)
2. Crea una app o selecciona una existente
3. Agrega el producto "Facebook Login"
4. Configura URIs de redirección: `http://localhost:3000/api/auth/callback/facebook`

### SMTP (Email)

Si configuras **cualquier** variable SMTP, **todas** son requeridas:

- **SMTP_HOST**: Servidor SMTP (ej: `smtp.gmail.com`)
- **SMTP_PORT**: Puerto SMTP (ej: `587`)
- **SMTP_USER**: Usuario SMTP (ej: `tu-email@gmail.com`)
- **SMTP_PASSWORD**: Contraseña o app password
- **SMTP_FROM**: Email remitente (ej: `noreply@tudominio.com`)

#### Gmail
Para usar Gmail:
1. Habilita verificación en 2 pasos
2. Genera una "App Password" en tu cuenta de Google
3. Usa esa contraseña en `SMTP_PASSWORD`

### LOG_LEVEL
- **Tipo**: `'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'`
- **Default**: `'debug'` en desarrollo, `'info'` en producción
- **Descripción**: Nivel mínimo de logs a mostrar

## Validación en Tiempo de Ejecución

### Errores de Validación

Si hay errores en las variables de entorno, verás un mensaje como:

```
❌ Invalid environment variables:

  • MONGODB_URI: Required
  • NEXTAUTH_SECRET: String must contain at least 32 character(s)
  • GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required when Google is enabled in AUTH_PROVIDERS

Please check your .env.local file and ensure all required variables are set correctly.
```

### Comportamiento

- **Desarrollo**: La aplicación lanza un error y muestra los problemas
- **Producción**: La aplicación termina con `process.exit(1)`

## Uso en el Código

### Obtener Variables Validadas

```typescript
import { getEnv } from '@/lib/env';

// Obtener todas las variables (type-safe)
const env = getEnv();

console.log(env.MONGODB_URI);  // ✅ Type-safe
console.log(env.NEXTAUTH_URL); // ✅ Type-safe
```

### Helpers Útiles

```typescript
import { isProviderEnabled, isSMTPConfigured } from '@/lib/env';

// Verificar si Google está habilitado y configurado
if (isProviderEnabled('google')) {
    // Mostrar botón de login con Google
}

// Verificar si SMTP está configurado
if (isSMTPConfigured()) {
    // Enviar emails
}
```

## Mejores Prácticas

### 1. Nunca Commitear Secretos

```bash
# ✅ Correcto - en .gitignore
.env.local
.env.production

# ❌ Incorrecto - nunca commitear
.env
```

### 2. Diferentes Secretos por Entorno

```env
# .env.local (desarrollo)
NEXTAUTH_SECRET=dev-secret-at-least-32-chars-long

# .env.production (producción)
NEXTAUTH_SECRET=prod-different-secret-32-chars-min
```

### 3. Documentar Variables Nuevas

Si agregas una nueva variable de entorno:

1. Actualiza `apps/web/src/lib/env.ts`
2. Actualiza `apps/web/.env.example`
3. Actualiza esta documentación

### 4. Validar Dependencias

Si una variable requiere otra, agrégala en `env.ts`:

```typescript
.refine(
    (data) => {
        if (data.FEATURE_X_ENABLED) {
            return !!data.FEATURE_X_API_KEY;
        }
        return true;
    },
    {
        message: 'FEATURE_X_API_KEY is required when FEATURE_X_ENABLED is true',
        path: ['FEATURE_X_API_KEY'],
    }
)
```

## Troubleshooting

### Error: "Environment variables have not been validated"

**Causa**: Intentas usar `getEnv()` antes de que se validen las variables.

**Solución**: Las variables se validan automáticamente al inicio. Si ves este error, verifica que `instrumentation.ts` esté configurado correctamente.

### Error: "NEXTAUTH_SECRET must be at least 32 characters"

**Causa**: Tu secreto es muy corto.

**Solución**: Genera uno nuevo:
```bash
openssl rand -base64 32
```

### Error: "MONGODB_URI is required"

**Causa**: Falta la variable o está vacía.

**Solución**: Agrega la URI en `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/mydb
```

### Error: "SMTP fields must all be provided"

**Causa**: Configuraste algunas variables SMTP pero no todas.

**Solución**: O configura todas las variables SMTP o elimina todas:
```env
# Opción 1: Configurar todas
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-password
SMTP_FROM=noreply@tudominio.com

# Opción 2: Eliminar todas (emails deshabilitados)
# SMTP_HOST=
# SMTP_PORT=
# ...
```

## Testing

### Variables de Test

Crea un archivo `.env.test` para testing:

```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/megamercado-test
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=test-secret-at-least-32-characters-long
AUTH_PROVIDERS=email
```

### Mockear Variables en Tests

```typescript
// En tus tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.NEXTAUTH_SECRET = 'test-secret-32-chars-minimum-here';

// Resetear cache de validación
jest.resetModules();
```

## Seguridad

### ⚠️ Nunca Expongas Variables al Cliente

```typescript
// ❌ Incorrecto - expone secretos al cliente
export const config = {
    mongoUri: process.env.MONGODB_URI, // ¡Peligro!
};

// ✅ Correcto - solo en servidor
export async function getServerData() {
    const env = getEnv();
    const data = await fetchFromDB(env.MONGODB_URI);
    return data;
}
```

### Variables Públicas en Next.js

Si necesitas exponer una variable al cliente, usa el prefijo `NEXT_PUBLIC_`:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

Pero **nunca** uses esto para secretos o credenciales.

## Recursos

- [Zod Documentation](https://zod.dev/)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [NextAuth Environment Variables](https://next-auth.js.org/configuration/options#environment-variables)
