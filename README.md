# Retia Monorepo - Sistema de Autenticación

Monorepo completo con aplicaciones web y móvil que comparten un sistema de autenticación unificado.

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
├── packages/
│   ├── database/         # Modelos y conexión MongoDB
│   ├── types/            # Tipos TypeScript compartidos
│   ├── utils/            # Utilidades compartidas
│   └── ui/               # Componentes UI compartidos
├── scripts/              # Scripts de utilidad
├── .kiro/specs/          # Especificaciones de features
├── .env.template         # Variables de entorno compartidas
└── package.json          # Workspace root
```

## 📱 Aplicaciones Disponibles

### 🌐 Web App (Next.js)
Sistema de autenticación web completo con dashboard y panel de administración.

**→ [Documentación Web App](./apps/web/README.md)**  
**→ [Inicio Rápido Web (5 min)](./apps/web/QUICKSTART.md)**

### 📱 Mobile App (Expo)
Aplicación móvil nativa para iOS y Android con autenticación integrada.

**→ [Documentación Mobile App](./apps/mobile/README.md)**  
**→ [Inicio Rápido Mobile (5 min)](./apps/mobile/QUICKSTART.md)**

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
# → http://localhost:3000
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
cp .env.template .env.local
cp apps/web/.env.template apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local

# 3. Iniciar ambas apps
cd apps/web && yarn dev &
cd apps/mobile && yarn start
```

**→ [Guía Completa de Desarrollo](./DEVELOPMENT_SETUP.md)**

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
yarn workspace @retia/web dev      # Desarrollo
yarn workspace @retia/web build    # Build
yarn workspace @retia/web start    # Producción

# Mobile App (apps/mobile)
yarn workspace @retia/mobile start # Desarrollo
yarn workspace @retia/mobile ios   # iOS
yarn workspace @retia/mobile android # Android
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

## � Doocumentación Completa

### 🌐 Web App
- 📖 [Documentación completa](./apps/web/README.md)
- 🚀 [Inicio rápido (5 min)](./apps/web/QUICKSTART.md)

### 📱 Mobile App  
- 📖 [Documentación completa](./apps/mobile/README.md)
- 🚀 [Inicio rápido (5 min)](./apps/mobile/QUICKSTART.md)
- 📱 [Guía móvil](./MOBILE_GETTING_STARTED.md)
- 🏗️ [Arquitectura](./apps/mobile/ARCHITECTURE.md)
- 🔐 [OAuth setup](./apps/mobile/OAUTH_SETUP.md)
- 🔌 [API endpoints](./apps/mobile/API_ENDPOINTS.md)

### 🛠️ Desarrollo
- 🔧 [Configuración de desarrollo](./DEVELOPMENT_SETUP.md)
- 📋 [Especificaciones](./.kiro/specs/mobile-auth-app/)

### 📦 Packages
- 🗄️ [Database](./packages/database/) - Modelos MongoDB
- 🔧 [Utils](./packages/utils/) - Utilidades compartidas
- 🎨 [UI](./packages/ui/) - Componentes compartidos
- 📝 [Types](./packages/types/) - Tipos TypeScript

---

## 🆘 Soporte

**¿Necesitas ayuda?**
- 🌐 **Web**: [apps/web/README.md](./apps/web/README.md)
- 📱 **Mobile**: [apps/mobile/README.md](./apps/mobile/README.md)
- 🐛 **Issues**: Abre un issue en el repositorio
- 📖 **Docs**: Revisa la documentación específica de cada app
