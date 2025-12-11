# Mejoras de Seguridad - Sistema de Autenticación

## Resumen de Cambios

### 1. ✅ Recuperación de Contraseña Completa

**Problema anterior:**
- El endpoint `/api/forgot-password` generaba un token pero nunca lo guardaba en la base de datos
- El modelo `User` no tenía campos para almacenar tokens de reset
- La funcionalidad no era funcional

**Solución implementada:**
- ✅ Agregados campos `resetPasswordToken` y `resetPasswordExpires` al modelo `User`
- ✅ El token se guarda hasheado (SHA-256) en la base de datos con expiración de 1 hora
- ✅ Creado endpoint `/api/reset-password` para validar token y actualizar contraseña
- ✅ Creada página `/reset-password` para que el usuario ingrese su nueva contraseña

**Archivos modificados:**
- `packages/database/src/models/User.ts` - Modelo actualizado
- `apps/web/src/app/api/forgot-password/route.ts` - Guarda token en DB
- `apps/web/src/app/api/reset-password/route.ts` - Nuevo endpoint
- `apps/web/src/app/reset-password/page.tsx` - Nueva página

### 2. ✅ Rate Limiting Implementado

**Problema anterior:**
- Los endpoints de autenticación eran vulnerables a ataques de fuerza bruta
- No había límites en la cantidad de intentos

**Solución implementada:**
- ✅ Instalada librería `rate-limiter-flexible`
- ✅ Creado middleware de rate limiting en `apps/web/src/lib/rate-limit.ts`
- ✅ Implementado rate limiting en todos los endpoints críticos:

**Límites configurados:**

| Endpoint | Intentos | Período | Bloqueo |
|----------|----------|---------|---------|
| `/api/register` | 3 | 1 hora | 1 hora |
| `/api/forgot-password` | 3 | 1 hora | 1 hora |
| `/api/reset-password` | 5 | 15 min | 15 min |
| Login (NextAuth) | 5 | 15 min | 15 min |

**Características:**
- Basado en dirección IP del cliente
- Respuestas HTTP 429 con header `Retry-After`
- Mensajes de error informativos en español

### 3. ✅ Validación de Contraseña Fuerte (Solo Producción)

**Problema anterior:**
- Solo se requería un mínimo de 6 caracteres
- No había requisitos de complejidad
- Contraseñas débiles eran aceptadas

**Solución implementada:**
- ✅ Validación diferenciada por entorno (desarrollo vs producción)
- ✅ En **desarrollo**: Mínimo 6 caracteres (para facilitar testing)
- ✅ En **producción**: Requisitos estrictos de complejidad
- ✅ Componente visual `PasswordStrength` que muestra requisitos en tiempo real
- ✅ Validación tanto en frontend como backend

**Requisitos de Contraseña en Producción:**
- Mínimo 8 caracteres
- Al menos una letra mayúscula (A-Z)
- Al menos una letra minúscula (a-z)
- Al menos un número (0-9)
- Al menos un carácter especial (!@#$%^&*)

**Archivos modificados:**
- `packages/utils/src/validation.ts` - Esquemas de validación por entorno
- `packages/ui/src/PasswordStrength.tsx` - Nuevo componente visual
- `apps/web/src/app/register/page.tsx` - Integración del indicador
- `apps/web/src/app/reset-password/page.tsx` - Integración del indicador

**Características del componente PasswordStrength:**
- Muestra lista de requisitos con checkmarks visuales
- Actualización en tiempo real mientras el usuario escribe
- Indicadores verdes para requisitos cumplidos
- Indicadores grises para requisitos pendientes
- Mensajes claros en español

### 4. ✅ Protección de Rutas con Helpers

**Problema anterior:**
- No había protección automática de rutas
- Cada página debía implementar su propia verificación de autenticación
- Posibilidad de olvidar proteger nuevas rutas

**Solución implementada:**
- ✅ Creados helpers de protección en `apps/web/src/lib/route-protection.ts`
- ✅ Funciones reutilizables para diferentes escenarios de protección
- ✅ Compatible con Edge Runtime y Server Components
- ✅ Soporte para callback URL (redirige al usuario a la página que intentaba acceder después del login)

**Nota sobre Middleware:**
Inicialmente se intentó usar middleware de Next.js, pero debido a limitaciones del Edge Runtime con MongoDB (error `global is not defined`), se optó por un enfoque basado en helpers que se llaman en cada página protegida.

**Helpers Disponibles:**

1. **`requireAuth(callbackUrl?)`** - Requiere autenticación
   ```typescript
   const session = await requireAuth('/dashboard');
   ```

2. **`redirectIfAuthenticated()`** - Redirige si ya está autenticado (para login/register)
   ```typescript
   await redirectIfAuthenticated();
   ```

3. **`requireAdmin()`** - Requiere rol de administrador
   ```typescript
   const session = await requireAdmin();
   ```

4. **`checkFirstUser()`** - Verifica si existen usuarios
   ```typescript
   await checkFirstUser();
   ```

**Ejemplo de uso:**
```typescript
// app/dashboard/page.tsx
import { requireAuth } from '@/lib/route-protection';

export default async function DashboardPage() {
    const session = await requireAuth('/dashboard');
    return <div>Dashboard de {session.user.name}</div>;
}
```

**Archivos creados:**
- `apps/web/src/lib/route-protection.ts` - Helpers de protección
- `docs/ROUTE_PROTECTION.md` - Guía completa de uso

**Archivos modificados:**
- `apps/web/src/app/page.tsx` - Usa `requireAuth`
- `apps/web/src/app/login/page.tsx` - Usa `redirectIfAuthenticated`

### 5. ✅ Logging Estructurado con Pino

**Problema anterior:**
- Solo se usaba `console.error` para logging
- No había estructura en los logs
- Difícil de buscar y analizar logs en producción
- Información sensible podía filtrarse en logs

**Solución implementada:**
- ✅ Instalado Pino para logging estructurado de alto rendimiento
- ✅ Creado logger configurado en `apps/web/src/lib/logger.ts`
- ✅ Helpers especializados para diferentes tipos de eventos
- ✅ Redacción automática de información sensible (passwords, tokens, etc.)
- ✅ Pretty printing en desarrollo, JSON en producción
- ✅ Niveles de log configurables por entorno

**Helpers de Logging:**

1. **`logAuth`** - Eventos de autenticación
   - Login exitoso/fallido
   - Registro de usuarios
   - Logout
   - Reset de contraseña

2. **`logAPI`** - Eventos de API
   - Requests
   - Errores
   - Rate limiting

3. **`logDB`** - Eventos de base de datos
   - Conexiones
   - Desconexiones
   - Errores

4. **`logSecurity`** - Eventos de seguridad
   - Actividad sospechosa
   - Accesos no autorizados
   - Tokens expirados

**Ejemplo de uso:**
```typescript
import { logAuth, logAPI } from '@/lib/logger';

// Log de login
logAuth.login('user@example.com', true, '192.168.1.1');

// Log de error de API
logAPI.error('POST', '/api/users', error, '192.168.1.1');
```

**Archivos creados:**
- `apps/web/src/lib/logger.ts` - Configuración del logger
- `docs/LOGGING.md` - Guía completa de uso

**Archivos modificados:**
- `apps/web/src/app/api/register/route.ts` - Usa logging estructurado
- `apps/web/src/app/api/forgot-password/route.ts` - Usa logging estructurado
- `apps/web/src/app/api/reset-password/route.ts` - Usa logging estructurado
- `apps/web/src/lib/auth.ts` - Logs de autenticación

**Información redactada automáticamente:**
- Contraseñas
- Tokens
- Secrets
- API Keys
- Headers de autorización
- Cookies

### 6. ✅ Validación de Variables de Entorno con Zod

**Problema anterior:**
- Variables de entorno sin validación
- Errores en runtime por configuración incorrecta
- Difícil detectar problemas de configuración
- No había type-safety para variables de entorno

**Solución implementada:**
- ✅ Validación con Zod al inicio de la aplicación
- ✅ Type-safe access a variables de entorno
- ✅ Validación de dependencias entre variables
- ✅ Mensajes de error claros y descriptivos
- ✅ Diferentes comportamientos en desarrollo vs producción
- ✅ Helpers para verificar configuraciones opcionales

**Variables Validadas:**

**Requeridas:**
- `MONGODB_URI` - URI de MongoDB
- `NEXTAUTH_URL` - URL de la aplicación
- `NEXTAUTH_SECRET` - Secreto para JWT (mínimo 32 caracteres)

**Opcionales con Validación:**
- `AUTH_PROVIDERS` - Proveedores habilitados
- `GOOGLE_CLIENT_ID/SECRET` - Si Google está habilitado
- `FACEBOOK_CLIENT_ID/SECRET` - Si Facebook está habilitado
- `SMTP_*` - Si SMTP está configurado, todos los campos son requeridos
- `LOG_LEVEL` - Nivel de logging

**Ejemplo de uso:**
```typescript
import { getEnv, isProviderEnabled } from '@/lib/env';

// Type-safe access
const env = getEnv();
console.log(env.MONGODB_URI); // ✅ Validado y type-safe

// Helpers
if (isProviderEnabled('google')) {
    // Google está habilitado y configurado
}
```

**Archivos creados:**
- `apps/web/src/lib/env.ts` - Esquema de validación
- `apps/web/src/lib/init.ts` - Inicialización de la app
- `apps/web/src/instrumentation.ts` - Hook de Next.js
- `apps/web/.env.example` - Template de variables
- `docs/ENVIRONMENT.md` - Guía completa

**Archivos modificados:**
- `apps/web/next.config.js` - Habilitado `instrumentationHook`

**Características:**
- Validación automática al inicio
- Errores claros con path específico
- Exit en producción si hay errores
- Validación de formatos (URLs, emails, números)
- Validación de dependencias entre variables

### 7. ✅ Mejoras Adicionales de Seguridad

**Tokens de Reset:**
- Tokens aleatorios de 32 bytes
- Almacenados hasheados (SHA-256) en la base de datos
- Expiración automática después de 1 hora
- Tokens de un solo uso (se eliminan después de usarse)

**Campos sensibles:**
- `resetPasswordToken` y `resetPasswordExpires` tienen `select: false`
- No se devuelven en consultas normales
- Solo se acceden cuando es necesario

## Flujo de Recuperación de Contraseña

1. Usuario solicita reset en `/forgot-password`
2. Sistema genera token aleatorio y lo hashea
3. Token hasheado se guarda en DB con expiración de 1 hora
4. Email enviado con link: `/reset-password?token=<token_original>`
5. Usuario hace clic en el link
6. Página valida que el token existe en la URL
7. Usuario ingresa nueva contraseña
8. Sistema hashea el token recibido y lo compara con el de la DB
9. Si es válido y no expiró, actualiza la contraseña
10. Token y expiración se eliminan de la DB
11. Usuario es redirigido al login

## Próximos Pasos Recomendados

### Seguridad Adicional
- [ ] Implementar CAPTCHA en login y registro
- [ ] Agregar autenticación de dos factores (2FA)
- [ ] Implementar detección de dispositivos sospechosos
- [ ] Agregar logs de auditoría para acciones sensibles

### Rate Limiting Avanzado
- [ ] Migrar a Redis para rate limiting en producción (múltiples instancias)
- [ ] Implementar rate limiting por usuario además de por IP
- [ ] Agregar whitelist de IPs confiables

### Monitoreo
- [ ] Configurar alertas para intentos de fuerza bruta
- [ ] Dashboard de métricas de seguridad
- [ ] Logs centralizados de eventos de autenticación

## Configuración de Producción

### Variables de Entorno Requeridas

```env
# NextAuth
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=<secret-aleatorio-seguro>

# MongoDB
MONGODB_URI=mongodb+srv://...

# Email (para envío de tokens)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-password
SMTP_FROM=noreply@tu-dominio.com
```

### Consideraciones de Producción

1. **Rate Limiting con Redis:**
   ```typescript
   import { RateLimiterRedis } from 'rate-limiter-flexible';
   import Redis from 'ioredis';
   
   const redisClient = new Redis({
       host: process.env.REDIS_HOST,
       port: parseInt(process.env.REDIS_PORT || '6379'),
   });
   
   const limiter = new RateLimiterRedis({
       storeClient: redisClient,
       points: 5,
       duration: 900,
   });
   ```

2. **HTTPS Obligatorio:**
   - Asegurar que todas las comunicaciones usen HTTPS
   - Configurar headers de seguridad (HSTS, CSP, etc.)

3. **Monitoreo:**
   - Implementar logging de todos los intentos de autenticación
   - Alertas para patrones sospechosos

## Testing

### Probar Rate Limiting

```bash
# Hacer múltiples requests rápidos
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.com","password":"123456"}'
done
```

Después del 3er intento, deberías recibir un error 429.

### Probar Reset de Contraseña

1. Ir a `/forgot-password`
2. Ingresar email registrado
3. Revisar logs del servidor para ver el token generado
4. Ir a `/reset-password?token=<token>`
5. Ingresar nueva contraseña
6. Verificar que puedes hacer login con la nueva contraseña

## Notas de Seguridad

⚠️ **Importante:**
- Los tokens de reset son de un solo uso
- Los tokens expiran después de 1 hora
- Las contraseñas se hashean con bcrypt (10 rounds)
- Los tokens se almacenan hasheados en la DB
- Rate limiting previene ataques de fuerza bruta

✅ **Buenas prácticas implementadas:**
- Mensajes de error genéricos (no revelan si el email existe)
- Tokens criptográficamente seguros
- Expiración automática de tokens
- Límites de intentos por IP
- Campos sensibles no expuestos en queries
