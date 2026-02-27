# 📱 Monorepo Mobile App - Expo

Aplicación móvil nativa (iOS/Android) construida con Expo y React Native que se conecta al sistema de autenticación Monorepo.

## 🚀 Características

- ✅ Autenticación con email/password
- ✅ Registro de nuevos usuarios
- ✅ OAuth con Google y Facebook
- ✅ Pantalla de perfil de usuario
- ✅ Almacenamiento seguro de tokens (Keychain/Keystore)
- ✅ Sincronización con backend Monorepo
- ✅ Soporte para iOS y Android
- ✅ Manejo de sesiones expiradas
- ✅ Interfaz responsive y moderna
- ✅ Manejo robusto de errores

## ⚡ Inicio Rápido (5 Minutos)

### 1. Instalar Dependencias (1 min)

```bash
# Desde la raíz del monorepo
yarn install
```

### 2. Configurar Variables de Entorno (1 min)

```bash
# Copiar template
cp .env.example .env.local

# Editar .env.local con configuración mínima
```

**Variables requeridas:**

```bash
# Backend API - Debe apuntar a tu servidor Next.js
EXPO_PUBLIC_API_URL=http://localhost:9001

# OAuth (opcional)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id

# Configuración
EXPO_PUBLIC_APP_NAME=Monorepo Auth
```

### 3. Iniciar el Servidor de Desarrollo (1 min)

```bash
yarn start
```

### 4. Abrir en Simulador (1 min)

**iOS:**
```bash
# Presiona 'i' en la terminal o ejecuta:
yarn ios
```

**Android:**
```bash
# Presiona 'a' en la terminal o ejecuta:
yarn android
```

**Dispositivo Físico:**
1. Instala Expo Go desde App Store o Google Play
2. Escanea el código QR que aparece en la terminal

### 5. Probar Autenticación (1 min)

1. **Registro**: Toca "Regístrate aquí" y crea una cuenta
2. **Login**: Usa las credenciales que acabas de crear
3. **Perfil**: Verás tu información de usuario

¡Listo! 🎉

## 🛠️ Instalación Completa

### 1. Instalar Dependencias

```bash
# Desde la raíz del monorepo
yarn install

# O desde el directorio de la app
cd apps/mobile
yarn install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar template
cp .env.example .env.local

# Editar .env.local con tus valores
nano .env.local
```

**Variables requeridas:**

```bash
# Backend API - Debe apuntar a tu servidor Next.js
EXPO_PUBLIC_API_URL=http://localhost:3000

# OAuth (opcional)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id

# Configuración
EXPO_PUBLIC_APP_NAME=Monorepo Auth

# Theme colors (hex format)
EXPO_PUBLIC_PRIMARY_COLOR=#6366f1
EXPO_PUBLIC_SECONDARY_COLOR=#ec4899
EXPO_PUBLIC_BACKGROUND_COLOR=#f8fafc
EXPO_PUBLIC_TEXT_COLOR=#1e293b

# Font family
EXPO_PUBLIC_FONT_FAMILY=Manrope
```

### 3. Iniciar el Servidor de Desarrollo

```bash
# Desde apps/mobile
yarn start

# O desde la raíz
yarn workspace @monorepo/mobile start
```

Esto abrirá el Expo CLI con opciones para:
- `i` - Abrir en simulador iOS
- `a` - Abrir en emulador Android
- `w` - Abrir en navegador web
- `r` - Recargar la app
- `m` - Cambiar modo

## 🚀 Comandos de Despliegue

### Desarrollo

```bash
# Iniciar servidor de desarrollo
yarn start

# iOS
yarn ios

# Android
yarn android

# Web (para testing rápido)
yarn web
```

### Producción

#### iOS

```bash
# Crear build para TestFlight/App Store
eas build --platform ios

# O usar Xcode directamente
eas build --platform ios --local
```

#### Android

```bash
# Crear APK o AAB
eas build --platform android

# O generar APK localmente
eas build --platform android --local
```

### Utilidades

```bash
# Linting
yarn lint

# Type checking
yarn type-check

# Limpiar caché
yarn start --clear
```

## 📁 Estructura del Proyecto

```
apps/mobile/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx          # Pantalla de login
│   │   ├── RegisterScreen.tsx       # Pantalla de registro
│   │   └── ProfileScreen.tsx        # Pantalla de perfil
│   │
│   ├── context/
│   │   └── AuthContext.tsx          # Estado global
│   │
│   ├── lib/
│   │   ├── api.ts                   # Cliente HTTP
│   │   ├── oauth.ts                 # OAuth flows
│   │   ├── secure-storage.ts        # Almacenamiento seguro
│   │   ├── error-handler.ts         # Manejo de errores
│   │   └── env.ts                   # Configuración
│   │
│   ├── navigation/
│   │   └── RootNavigator.tsx        # Navegación
│   │
│   ├── types/
│   │   └── index.ts                 # Tipos TypeScript
│   │
│   └── App.tsx                      # Componente raíz
│
├── app.json                         # Configuración de Expo
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
├── QUICKSTART.md
├── OAUTH_SETUP.md
├── ARCHITECTURE.md
├── API_ENDPOINTS.md
└── IMPLEMENTATION_STATUS.md
```

## 🔄 Flujos de Autenticación

### Login con Email/Password

```
Usuario ingresa credenciales
         ↓
   Validación (Zod)
         ↓
   POST /api/auth/signin
         ↓
   Backend valida y retorna JWT
         ↓
   Token guardado en Secure Store
         ↓
   Usuario redirigido a Profile
```

### Login con OAuth

```
Usuario toca botón OAuth
         ↓
   Expo Auth Session abre navegador
         ↓
   Usuario autoriza en proveedor
         ↓
   Proveedor redirige con código
         ↓
   App recibe código
         ↓
   POST /api/auth/oauth/callback
         ↓
   Backend intercambia código por JWT
         ↓
   Token guardado en Secure Store
         ↓
   Usuario redirigido a Profile
```

### Restauración de Sesión

```
App inicia
         ↓
   Intenta leer token de Secure Store
         ↓
   Si existe token válido
         ↓
   Muestra Profile directamente
         ↓
   Si no existe o es inválido
         ↓
   Muestra Login
```

## 🔐 Seguridad

### Almacenamiento de Tokens

Los tokens JWT se almacenan en **Secure Store** (encriptado a nivel de dispositivo):
- **iOS**: Keychain
- **Android**: Keystore

```typescript
// Ejemplo de uso
import { secureStorage } from '@/lib/secure-storage';

// Guardar token
await secureStorage.setToken(token);

// Recuperar token
const token = await secureStorage.getToken();

// Eliminar token
await secureStorage.removeToken();
```

### Validación de Entrada

Todas las entradas se validan usando Zod (mismo que en el backend):

```typescript
import { loginSchema } from '@monorepo-vzla/api';

const validated = loginSchema.parse({ email, password });
```

### Manejo de Errores

Los errores se manejan de forma segura sin exponer información sensible:

```typescript
import { getErrorMessage } from '@/lib/error-handler';

try {
  await login(credentials);
} catch (error) {
  const message = getErrorMessage(error);
  // Mostrar mensaje amigable al usuario
}
```

## 🌐 Conectar con Backend

La app se conecta al backend Next.js mediante:

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Endpoints utilizados:
// POST /api/auth/signin - Login
// POST /api/register - Registro
// GET /api/auth/session - Obtener perfil
// POST /api/auth/signout - Logout
// POST /api/auth/oauth/callback - OAuth callback
```

### Configuración para Dispositivo Físico

Si ejecutas la app en un dispositivo físico:

```bash
# Obtén tu IP local
ifconfig | grep "inet " | grep -v 127.0.0.1

# Usa esa IP en .env.local
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

## 📦 Compartir Código con Web

La app móvil reutiliza:

- **@monorepo-vzla/api**: Servicios de API y validación
- **@monorepo-vzla/ui**: Componentes UI compartidos (cuando sea compatible con React Native)

```typescript
// Importar desde SDKs externos
import { loginSchema, registerSchema } from '@monorepo-vzla/api';
import type { User } from '@monorepo-vzla/api';
```

## 🧪 Testing

```bash
# Linting
yarn lint

# Type checking
yarn type-check

# En el futuro: Unit tests
yarn test

# En el futuro: E2E tests
yarn e2e
```

## 📱 Compilar para Producción

### iOS

```bash
# Crear build para TestFlight/App Store
eas build --platform ios

# O usar Xcode directamente
eas build --platform ios --local
```

### Android

```bash
# Crear APK o AAB
eas build --platform android

# O generar APK localmente
eas build --platform android --local
```

## 🐛 Troubleshooting

### Error: "Cannot connect to API"

- Verifica que el backend esté corriendo en `http://localhost:3000`
- En dispositivo físico, usa tu IP local en lugar de `localhost`
- Verifica que `EXPO_PUBLIC_API_URL` esté correctamente configurado

### Error: "Secure Store not available"

- En web, Secure Store usa localStorage (menos seguro)
- En dispositivos reales, usa Keychain (iOS) o Keystore (Android)

### Token expirado

- La app detecta automáticamente tokens expirados (401)
- Redirige a login y limpia el almacenamiento

### Problemas con dependencias

```bash
# Limpiar y reinstalar
rm -rf node_modules
yarn install

# Limpiar caché de Expo
npx expo start --clear
```

### OAuth no funciona

- Verifica que los Client IDs estén configurados en `.env.local`
- Asegúrate de que el backend tenga el endpoint `/api/auth/oauth/callback`
- Revisa los logs en la consola del navegador

### Simulador/Emulador no inicia

```bash
# Reiniciar Expo
npx expo start --clear

# Reiniciar simulador
xcrun simctl erase all  # iOS
emulator -avd <name> -wipe-data  # Android
```

## 📚 Documentación Adicional

- [docs/mobile/OAUTH_SETUP.md](../../docs/mobile/OAUTH_SETUP.md) - Configuración de OAuth
- [docs/mobile/ARCHITECTURE.md](../../docs/mobile/ARCHITECTURE.md) - Arquitectura del sistema
- [docs/mobile/API_ENDPOINTS.md](../../docs/mobile/API_ENDPOINTS.md) - Documentación de API

## 🆘 Soporte

- 🌐 **Web App**: [../web/README.md](../web/README.md)
- 🏠 **Monorepo**: [../../README.md](../../README.md)
- 🐛 **Issues**: Abre un issue en el repositorio
