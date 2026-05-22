# Guía de Logging Estructurado

## Configuración

El proyecto utiliza **Pino** para logging estructurado, que ofrece:
- Alto rendimiento
- Formato JSON estructurado
- Pretty printing en desarrollo
- Redacción automática de información sensible
- Niveles de log configurables

## Configuración de Logger

El logger está configurado en `apps/web/src/lib/logger.ts` con las siguientes características:

### Niveles de Log

- `trace`: Información muy detallada (raramente usado)
- `debug`: Información de depuración (solo en desarrollo)
- `info`: Eventos informativos normales
- `warn`: Advertencias que no son errores
- `error`: Errores que requieren atención
- `fatal`: Errores críticos que causan terminación

### Variables de Entorno

```env
# Nivel de log (trace, debug, info, warn, error, fatal)
# Por defecto: 'debug' en desarrollo, 'info' en producción
LOG_LEVEL=info

# NODE_ENV determina el formato de salida
# development: Pretty print con colores
# production: JSON estructurado
NODE_ENV=production
```

## Uso Básico

### Logger Principal

```typescript
import { logger } from '@/lib/logger';

// Log simple
logger.info('Aplicación iniciada');

// Log con contexto
logger.info({
    userId: '123',
    action: 'profile_update',
}, 'Usuario actualizó su perfil');

// Log de error
logger.error({
    error: error.message,
    stack: error.stack,
}, 'Error al procesar solicitud');
```

### Helpers Especializados

El logger incluye helpers para casos de uso comunes:

#### 1. Autenticación (`logAuth`)

```typescript
import { logAuth } from '@/lib/logger';

// Login exitoso
logAuth.login('user@example.com', true, '192.168.1.1');

// Login fallido
logAuth.login('user@example.com', false, '192.168.1.1');

// Registro
logAuth.register('user@example.com', 'USER', '192.168.1.1');

// Logout
logAuth.logout('user@example.com', '192.168.1.1');

// Reset de contraseña
logAuth.passwordReset('user@example.com', '192.168.1.1');
```

#### 2. API (`logAPI`)

```typescript
import { logAPI } from '@/lib/logger';

// Request
logAPI.request('POST', '/api/users', '192.168.1.1');

// Error de API
logAPI.error('POST', '/api/users', error, '192.168.1.1');

// Rate limiting
logAPI.rateLimited('192.168.1.1', '/api/login');
```

#### 3. Base de Datos (`logDB`)

```typescript
import { logDB } from '@/lib/logger';

// Conexión exitosa
logDB.connected('mongodb://localhost:27017/mydb');

// Desconexión
logDB.disconnected();

// Error de base de datos
logDB.error(error, 'findUser');
```

#### 4. Seguridad (`logSecurity`)

```typescript
import { logSecurity } from '@/lib/logger';

// Actividad sospechosa
logSecurity.suspiciousActivity(
    'Múltiples intentos de login fallidos',
    '192.168.1.1',
    { attempts: 5, timeWindow: '5min' }
);

// Acceso no autorizado
logSecurity.unauthorized('/admin', '192.168.1.1', 'No es administrador');

// Token expirado
logSecurity.tokenExpired('user@example.com', 'password_reset');
```

## Redacción de Información Sensible

El logger automáticamente redacta información sensible:

```typescript
logger.info({
    email: 'user@example.com',
    password: 'secret123',  // Será redactado
    token: 'abc123',        // Será redactado
}, 'Usuario creado');

// Output:
// {
//   email: 'user@example.com',
//   password: '[REDACTED]',
//   token: '[REDACTED]',
//   msg: 'Usuario creado'
// }
```

Campos redactados automáticamente:
- `password`
- `token`
- `secret`
- `apiKey`
- `req.headers.authorization`
- `req.headers.cookie`

## Formato de Salida

### Desarrollo (Pretty Print)

```
[14:30:45 UTC] INFO: Usuario actualizó su perfil
    userId: "123"
    action: "profile_update"
```

### Producción (JSON)

```json
{
  "level": 30,
  "time": 1639567845000,
  "msg": "Usuario actualizó su perfil",
  "userId": "123",
  "action": "profile_update",
  "env": "production"
}
```

## Mejores Prácticas

### 1. Usa el Nivel Correcto

```typescript
// ✅ Correcto
logger.info('Usuario registrado');
logger.warn('Tasa de error elevada');
logger.error('Fallo al conectar a la base de datos');

// ❌ Incorrecto
logger.error('Usuario registrado'); // No es un error
logger.info('Fallo crítico');       // Debería ser error
```

### 2. Incluye Contexto Relevante

```typescript
// ✅ Correcto
logger.info({
    userId: user.id,
    email: user.email,
    role: user.role,
}, 'Usuario creado');

// ❌ Incorrecto
logger.info('Usuario creado'); // Falta contexto
```

### 3. Usa Helpers Cuando Sea Posible

```typescript
// ✅ Correcto
logAuth.login(email, success, ip);

// ❌ Menos ideal
logger.info({ email, success, ip }, 'Login attempt');
```

### 4. No Loguees Información Sensible

```typescript
// ✅ Correcto
logger.info({
    email: user.email,
    // password no incluido
}, 'Usuario autenticado');

// ❌ Incorrecto
logger.info({
    email: user.email,
    password: user.password, // Aunque será redactado, mejor no incluirlo
}, 'Usuario autenticado');
```

### 5. Loguea Errores Completos

```typescript
// ✅ Correcto
logger.error({
    error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
    },
    context: 'user_registration',
}, 'Error al registrar usuario');

// ❌ Incorrecto
logger.error('Error'); // Sin detalles
```

## Monitoreo en Producción

### Agregación de Logs

En producción, los logs en formato JSON pueden ser enviados a servicios de agregación:

- **Datadog**: `pino-datadog`
- **Elasticsearch**: `pino-elasticsearch`
- **CloudWatch**: `pino-cloudwatch`
- **Logtail**: `@logtail/pino`

Ejemplo con Datadog:

```typescript
import pino from 'pino';
import pinoms from 'pino-multi-stream';

const streams = [
    { stream: process.stdout },
    {
        level: 'info',
        stream: pinoDatadog({
            apiKey: process.env.DATADOG_API_KEY,
            service: 'my-app',
        }),
    },
];

export const logger = pino({
    level: 'info',
}, pinoms.multistream(streams));
```

### Alertas

Configura alertas basadas en logs:

```typescript
// Log que puede disparar una alerta
logger.error({
    event: 'database.connection_failed',
    severity: 'critical',
    retries: 3,
}, 'No se pudo conectar a la base de datos después de 3 intentos');
```

## Debugging

### Ver Logs en Desarrollo

Los logs se muestran automáticamente en la consola con formato pretty:

```bash
yarn dev
```

### Ver Logs en Producción

Si usas PM2 o similar:

```bash
# Ver logs en tiempo real
pm2 logs

# Ver solo errores
pm2 logs --err

# Ver logs de una app específica
pm2 logs my-app
```

### Filtrar por Nivel

```bash
# Solo errores y fatales
LOG_LEVEL=error yarn start

# Todo incluyendo debug
LOG_LEVEL=debug yarn dev
```

## Testing

En tests, puedes silenciar los logs:

```typescript
import { logger } from '@/lib/logger';

beforeAll(() => {
    logger.level = 'silent';
});
```

O capturar logs para assertions:

```typescript
import pino from 'pino';

const stream = {
    write: jest.fn(),
};

const logger = pino(stream);

// ... ejecutar código ...

expect(stream.write).toHaveBeenCalledWith(
    expect.stringContaining('Usuario creado')
);
```

## Migración de console.log

Para migrar código existente:

```typescript
// Antes
console.log('Usuario creado');
console.error('Error:', error);
console.warn('Advertencia');

// Después
logger.info('Usuario creado');
logger.error({ error }, 'Error');
logger.warn('Advertencia');
```

## Recursos

- [Documentación de Pino](https://getpino.io/)
- [Pino Pretty](https://github.com/pinojs/pino-pretty)
- [Best Practices](https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-pino-to-log-node-js-applications/)
