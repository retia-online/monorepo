# Monorepo Monorepo - Sistema de Autenticación

Monorepo con aplicaciones web y móvil que comparten un sistema de autenticación unificado.

## 🚀 Características Principales

- 🌐 **Aplicación Web**: Next.js 14 con NextAuth.js v5
- 📱 **Aplicación Móvil**: Expo/React Native con autenticación nativa
- 🔐 **Sistema unificado**: Usuarios compartidos entre web y móvil
- 🎨 **Personalizable**: Temas y configuración vía variables de entorno
- ☁️ **Listo para producción**: Optimizado para Vercel y MongoDB Atlas

## 📦 Estructura del Monorepo

```
/monorepo
├── apps/
│   ├── web/              # Aplicación Next.js (Web)
│   └── mobile/           # Aplicación Expo (iOS/Android)
├── docs/                 # Documentación del proyecto
├── scripts/              # Scripts de utilidad
├── __tests__/            # Tests del sistema
├── .kiro/specs/          # Especificaciones de features
└── package.json          # Workspace root
```

## 📱 Aplicaciones Disponibles

### 🌐 Web App (Next.js)
Sistema de autenticación web completo con dashboard y panel de administración.

**→ [Documentación Web App](./apps/web/README.md)**

### 📱 Mobile App (Expo)
Aplicación móvil nativa para iOS y Android con autenticación integrada.

**→ [Documentación Mobile App](./apps/mobile/README.md)**

## 🛠️ Requisitos Previos

- **Node.js** 18+ y **Yarn** 1.22+
- **MongoDB** local o cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- (Opcional) Credenciales de OAuth:
  - [Google Cloud Console](https://console.cloud.google.com) para Google OAuth
  - [Facebook Developers](https://developers.facebook.com) para Facebook OAuth

## ⚡ Inicio Rápido

### Opción A: Solo Web App
```bash
cd apps/web
yarn install
cp .env.template .env.local
# Editar .env.local con tu configuración
yarn dev
# → http://localhost:9001
```

### Opción B: Solo Mobile App
```bash
cd apps/mobile
yarn install
cp .env.example .env.local
# Editar .env.local con tu configuración
yarn start
# → Escanea QR con Expo Go
```

### Opción C: Sistema Completo
```bash
# 1. Instalar dependencias
yarn install

# 2. Configurar variables
cp apps/web/.env.template apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local

# 3. Iniciar ambas apps
cd apps/web && yarn dev &
cd apps/mobile && yarn start
```

**→ [Documentación Completa](./docs/README.md)**

## 👤 Sistema de Usuarios

- **Primer usuario**: Automáticamente administrador
- **Roles**: Admin (gestión completa) y User (acceso básico)
- **Integración**: Usuarios compartidos entre web y móvil
- **OAuth**: Google y Facebook disponibles en ambas plataformas

## 🎨 Personalización

Ambas aplicaciones soportan personalización vía variables de entorno:

```bash
# Colores del tema
PRIMARY_COLOR=#3b82f6      # Azul
SECONDARY_COLOR=#10b981    # Verde  
BACKGROUND_COLOR=#ffffff   # Blanco
TEXT_COLOR=#1f2937        # Gris oscuro

# Configuración de autenticación (móvil)
EXPO_PUBLIC_AUTH_MODE=required    # required/optional/disabled
EXPO_PUBLIC_AUTH_METHODS=email,google,facebook
```

## 🚀 Despliegue

### Web App → Vercel
```bash
cd apps/web
vercel --prod
```

### Mobile App → Expo/EAS
```bash
cd apps/mobile
eas build --platform all
```

Ver documentación específica de cada app para instrucciones detalladas.

## 📁 Scripts Útiles

```bash
# Desde la raíz del monorepo
yarn install              # Instalar todas las dependencias
yarn build                # Build de todas las apps
yarn lint                 # Linting de todas las apps
yarn clean                # Limpiar node_modules

# Web App (apps/web)
yarn workspace @monorepo/web dev      # Desarrollo
yarn workspace @monorepo/web build    # Build
yarn workspace @monorepo/web start    # Producción

# Mobile App (apps/mobile)
yarn workspace @monorepo/mobile start # Desarrollo
yarn workspace @monorepo/mobile ios   # iOS
yarn workspace @monorepo/mobile android # Android
```

## 🐛 Troubleshooting

### Error: "Cannot connect to MongoDB"
- Verifica que MongoDB esté corriendo: `brew services list` (macOS)
- Verifica la cadena de conexión en `MONGODB_URI`
- En Atlas, verifica Network Access y Database Access

### Error: "Invalid secret"
- Asegúrate de que `NEXTAUTH_SECRET` esté definido
- Genera uno nuevo con `openssl rand -base64 32`

### OAuth no funciona
- Verifica que las redirect URIs estén correctamente configuradas
- Revisa que Client ID y Secret sean correctos
- Asegúrate de que el provider esté en `AUTH_PROVIDERS`

### Emails no se envían
- Verifica configuración SMTP
- Para Gmail, usa "App Password" en vez de tu contraseña normal
- Habilita "Allow less secure apps" en configuración de Gmail

## 📚 Tecnologías Utilizadas

### Web App
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js v5
- **Base de Datos**: MongoDB con Mongoose
- **Email**: Nodemailer
- **Deployment**: Vercel

### Mobile App
- **Framework**: Expo, React Native
- **Lenguaje**: TypeScript
- **Navegación**: React Navigation
- **Autenticación**: Expo Auth Session
- **Almacenamiento**: Expo Secure Store
- **Validación**: Zod

### Compartido
- **Monorepo**: Yarn Workspaces
- **Validación**: Zod
- **Seguridad**: bcryptjs para hashing de contraseñas
- **Tipos**: TypeScript compartidos entre apps

## 📄 Licencia

MIT

## 🤝 Contribuir

Pull requests son bienvenidos. Para cambios mayores, por favor abre un issue primero.

## 📚 Documentación

### 📖 Documentación General
- [**Documentación Completa**](./docs/README.md) - Índice de toda la documentación
- [**Setup Local**](./docs/LOCAL_SETUP.md) - Configuración de desarrollo
- [**Autenticación**](./docs/AUTH.md) - Sistema de autenticación
- [**Seguridad**](./docs/SECURITY.md) - Mejores prácticas de seguridad

### 🌐 Web App
- [**README Web**](./apps/web/README.md) - Documentación completa de la web app

### 📱 Mobile App  
- [**README Mobile**](./apps/mobile/README.md) - Documentación completa de la mobile app
- [**OAuth Setup**](./docs/mobile/OAUTH_SETUP.md) - Configuración de OAuth
- [**Arquitectura**](./docs/mobile/ARCHITECTURE.md) - Arquitectura del sistema móvil
- [**API Endpoints**](./docs/mobile/API_ENDPOINTS.md) - Documentación de endpoints

## 🆘 Soporte

**¿Necesitas ayuda?**
- 📖 **Documentación**: [docs/README.md](./docs/README.md)
- 🌐 **Web**: [apps/web/README.md](./apps/web/README.md)
- 📱 **Mobile**: [apps/mobile/README.md](./apps/mobile/README.md)
- 🐛 **Issues**: Abre un issue en el repositorio
