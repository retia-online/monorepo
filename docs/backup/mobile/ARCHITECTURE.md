# Mobile App Architecture

Documentación de la arquitectura de la app móvil con Expo.

## 📊 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP (Expo)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Navigation Layer                        │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  RootNavigator                                 │ │  │
│  │  │  ├─ AuthStack (Login/Register)                │ │  │
│  │  │  └─ AppStack (Profile)                        │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ▲                                 │
│                           │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Context Layer (State)                  │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  AuthContext                                   │ │  │
│  │  │  ├─ user: User | null                         │ │  │
│  │  │  ├─ isLoading: boolean                        │ │  │
│  │  │  ├─ isSignedIn: boolean                       │ │  │
│  │  │  ├─ login()                                   │ │  │
│  │  │  ├─ register()                                │ │  │
│  │  │  ├─ logout()                                  │ │  │
│  │  │  ├─ loginWithGoogle()                         │ │  │
│  │  │  └─ loginWithFacebook()                       │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ▲                                 │
│                           │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Service Layer                          │  │
│  │  ┌──────────────────┐  ┌──────────────────────────┐ │  │
│  │  │  api.ts          │  │  oauth.ts                │ │  │
│  │  │  ├─ login()      │  │  ├─ loginWithGoogle()   │ │  │
│  │  │  ├─ register()   │  │  ├─ loginWithFacebook() │ │  │
│  │  │  ├─ getProfile() │  │  └─ exchangeOAuthCode() │ │  │
│  │  │  └─ logout()     │  └──────────────────────────┘ │  │
│  │  └──────────────────┘                               │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  secure-storage.ts                              │ │  │
│  │  │  ├─ setToken()                                  │ │  │
│  │  │  ├─ getToken()                                  │ │  │
│  │  │  ├─ removeToken()                               │ │  │
│  │  │  ├─ setUser()                                   │ │  │
│  │  │  ├─ getUser()                                   │ │  │
│  │  │  └─ clear()                                     │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ▲                                 │
│                           │                                 │
│                    ┌──────┴──────┐                          │
│                    │             │                          │
│              ┌─────▼──┐    ┌─────▼──────┐                  │
│              │ Secure │    │  Expo Auth │                  │
│              │ Store  │    │  Session   │                  │
│              └────────┘    └────────────┘                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │ HTTP/HTTPS
                           │
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Next.js)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes                                          │  │
│  │  ├─ POST /api/auth/signin                           │  │
│  │  ├─ POST /api/register                              │  │
│  │  ├─ GET /api/auth/session                           │  │
│  │  ├─ POST /api/auth/signout                          │  │
│  │  └─ POST /api/auth/oauth/callback                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ▲                                 │
│                           │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Database (MongoDB)                                  │  │
│  │  └─ User Collection                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Estructura de Carpetas

```
apps/mobile/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx          # Pantalla de login con OAuth
│   │   ├── RegisterScreen.tsx       # Pantalla de registro
│   │   └── ProfileScreen.tsx        # Pantalla de perfil
│   │
│   ├── context/
│   │   └── AuthContext.tsx          # Estado global de autenticación
│   │
│   ├── lib/
│   │   ├── api.ts                   # Cliente HTTP para API
│   │   ├── oauth.ts                 # Lógica de OAuth
│   │   └── secure-storage.ts        # Almacenamiento seguro
│   │
│   ├── navigation/
│   │   └── RootNavigator.tsx        # Configuración de navegación
│   │
│   ├── types/
│   │   └── index.ts                 # Tipos TypeScript
│   │
│   └── App.tsx                      # Componente raíz
│
├── App.tsx                          # Punto de entrada
├── app.json                         # Configuración de Expo
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
├── OAUTH_SETUP.md
└── ARCHITECTURE.md
```

## 🔐 Flujo de Autenticación

### 1. Login con Email/Password

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

### 2. Login con OAuth (Google/Facebook)

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

### 3. Restauración de Sesión

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

## 📦 Dependencias Principales

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `expo` | ^51.0.0 | Framework React Native |
| `react-native` | ^0.74.0 | Framework nativo |
| `@react-navigation/*` | ^6.x | Navegación |
| `expo-auth-session` | ^5.4.0 | OAuth flows |
| `expo-secure-store` | ^13.0.0 | Almacenamiento seguro |
| `zod` | ^3.22.4 | Validación de esquemas |

## 🔄 Ciclo de Vida de la App

```
┌─────────────────────────────────────────┐
│  App Inicia                             │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  AuthProvider carga sesión guardada     │
│  (bootstrapAsync)                       │
└────────────────┬────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
         ▼                ▼
    Token existe    Sin token
         │                │
         ▼                ▼
    isSignedIn=true  isSignedIn=false
         │                │
         ▼                ▼
    AppStack          AuthStack
    (Profile)         (Login/Register)
```

## 🛡️ Seguridad

### Almacenamiento de Tokens

- **iOS**: Keychain (encriptado por el SO)
- **Android**: Keystore (encriptado por el SO)
- **Web**: localStorage (menos seguro, solo para desarrollo)

### Validación

- Todas las entradas se validan con Zod
- Esquemas compartidos con el backend
- Errores de validación se muestran al usuario

### Manejo de Errores

- Tokens expirados → Logout automático
- Errores de red → Mensajes claros al usuario
- Errores de OAuth → Reintentos disponibles

## 🚀 Escalabilidad

### Agregar Nuevas Pantallas

1. Crear componente en `src/screens/`
2. Agregar a navegación en `RootNavigator.tsx`
3. Usar `useAuth()` para acceder al estado

### Agregar Nuevos Providers OAuth

1. Agregar configuración en `src/lib/oauth.ts`
2. Crear función `loginWith<Provider>()`
3. Agregar botón en `LoginScreen.tsx`
4. Implementar endpoint en backend

### Agregar Nuevas Llamadas API

1. Agregar función en `src/lib/api.ts`
2. Usar en contexto o componentes
3. Manejar errores y loading states

## 📊 Performance

- **Code Splitting**: Cada pantalla se carga bajo demanda
- **Lazy Loading**: Componentes se cargan cuando se necesitan
- **Caching**: Datos de usuario se cachean en Secure Store
- **Optimización**: Uso de `React.memo` para componentes costosos

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

## 📱 Deployment

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

### Web (Desarrollo)

```bash
yarn web
```

## 🔗 Integración con Monorepo

La app móvil comparte:

- **@monorepo/types**: Tipos TypeScript
- **@monorepo/utils**: Validación (Zod), helpers
- **@monorepo/database**: Tipos de modelos (solo tipos, no conexión)

Esto asegura consistencia entre web y móvil.
