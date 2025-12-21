# Retia Mobile App - Expo

Aplicación móvil nativa (iOS/Android) construida con Expo y React Native que se conecta al sistema de autenticación Retia.

## 🚀 Características

- ✅ Autenticación con email/password
- ✅ Registro de nuevos usuarios
- ✅ OAuth con Google y Facebook
- ✅ Pantalla de perfil de usuario
- ✅ Almacenamiento seguro de tokens (Keychain/Keystore)
- ✅ Sincronización con backend Retia
- ✅ Soporte para iOS y Android
- ✅ Manejo de sesiones expiradas
- ✅ Interfaz responsive y moderna
- ✅ Manejo robusto de errores

## 📋 Requisitos Previos

- **Node.js** 18+ y **Yarn** 1.22+
- **Expo CLI**: `npm install -g expo-cli`
- **iOS**: Xcode (para simulador o dispositivo)
- **Android**: Android Studio (para emulador o dispositivo)
- **Backend**: Servidor Next.js corriendo en `http://localhost:3000`

## ⚡ Quick Start

Para empezar rápidamente, ve a [QUICKSTART.md](./QUICKSTART.md).

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

# Configuración de la app
EXPO_PUBLIC_APP_NAME=Retia Auth
EXPO_PUBLIC_PRIMARY_COLOR=#3b82f6
```

### 3. Iniciar el Servidor de Desarrollo

```bash
# Desde apps/mobile
yarn start

# O desde la raíz
yarn workspace @retia/mobile start
```

Esto abrirá el Expo CLI con opciones para:
- `i` - Abrir en simulador iOS
- `a` - Abrir en emulador Android
- `w` - Abrir en navegador web
- `r` - Recargar la app
- `m` - Cambiar modo

## 📱 Ejecutar en Diferentes Plataformas

### iOS

```bash
# Simulador
yarn ios

# O con Expo CLI
npx expo start --ios
```

**Requisitos:**
- Xcode instalado
- Simulador de iOS configurado

### Android

```bash
# Emulador
yarn android

# O con Expo CLI
npx expo start --android
```

**Requisitos:**
- Android Studio instalado
- Emulador de Android configurado

### Desarrollo General

```bash
# Iniciar servidor de desarrollo
yarn start

# O con npx
npx expo start

# Opciones adicionales:
npx expo start --clear    # Limpiar caché
npx expo start --tunnel   # Usar túnel para dispositivos remotos
npx expo start --lan      # Usar red local
```

### Web (Desarrollo)

```bash
yarn web
```

Útil para testing rápido, pero la experiencia no es idéntica a la app nativa.

### Dispositivo Físico

1. Instala **Expo Go** desde App Store o Google Play
2. Ejecuta `yarn start`
3. Escanea el código QR que aparece en la terminal
4. La app se abrirá en Expo Go

## 🔐 Autenticación

### Email/Password

1. Abre la app
2. Ingresa email y contraseña
3. Toca "Iniciar Sesión"
4. Serás redirigido a tu perfil

### Registro

1. En la pantalla de login, toca "Regístrate aquí"
2. Ingresa nombre, email y contraseña
3. Toca "Registrarse"
4. Serás automáticamente logueado

### OAuth (Google/Facebook)

1. En la pantalla de login, toca el botón del proveedor
2. Completa el flujo de autorización
3. Serás automáticamente logueado

**Nota:** Requiere configuración en el backend. Ver [OAUTH_SETUP.md](./OAUTH_SETUP.md).

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
import { loginSchema } from '@retia/utils';

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

- **@retia/types**: Tipos TypeScript compartidos
- **@retia/utils**: Validación (Zod), utilidades de email, etc.
- **@retia/database**: Modelos (solo tipos, no la conexión)

```typescript
// Importar desde packages compartidos
import { loginSchema, registerSchema } from '@retia/utils';
import type { User } from '@retia/types';
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

- [QUICKSTART.md](./QUICKSTART.md) - Guía rápida de inicio
- [OAUTH_SETUP.md](./OAUTH_SETUP.md) - Configuración de OAuth
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del sistema
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - Documentación de API
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Estado de implementación
- [PROGRESS_SUMMARY.md](./PROGRESS_SUMMARY.md) - Resumen de progreso

## 🔗 Recursos Externos

- [Expo Documentation](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [React Native](https://reactnative.dev)
- [Expo Secure Store](https://docs.expo.dev/modules/expo-secure-store/)
- [Expo Auth Session](https://docs.expo.dev/modules/expo-auth-session/)

## 🤝 Contribuir

Pull requests son bienvenidos. Para cambios mayores, abre un issue primero.

## 📄 Licencia

MIT

---

**¿Necesitas ayuda?** 
- Revisa la documentación en este directorio
- Consulta [QUICKSTART.md](./QUICKSTART.md) para empezar rápidamente
- Abre un issue en el repositorio

**Última actualización**: Diciembre 11, 2024
**Estado**: En Desarrollo (50% completado)
