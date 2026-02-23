# 🌐 Web App - Sistema de Autenticación Next.js

Aplicación web completa con autenticación, dashboard de usuario y panel de administración.

## ✨ Características

- 🔐 **Autenticación completa**: Email/password + OAuth (Google, Facebook)
- 👤 **Gestión de usuarios**: Registro, login, recuperación de contraseña
- 📊 **Dashboard**: Panel de usuario personalizado
- 👑 **Panel Admin**: Gestión completa para administradores
- 🎨 **Personalizable**: Temas y colores vía variables de entorno
- 📱 **Responsive**: Diseño adaptable a todos los dispositivos
- ☁️ **Listo para producción**: Optimizado para Vercel

## 🚀 Inicio Rápido (5 Minutos)

### Paso 1: Instalar Dependencias (1 min)

```bash
# Desde la raíz del monorepo
yarn install
```

### Paso 2: Configurar Variables de Entorno (1 min)

```bash
# Copiar template
cp .env.template .env.local
```

**Editar `.env.local`** con configuración mínima:

```bash
# Base de datos (REQUIRED)
MONGODB_URI=mongodb://127.0.0.1:27017/monorepo

# NextAuth (REQUIRED)
NEXTAUTH_URL=http://localhost:9001
NEXTAUTH_SECRET=F+yuaKb5WnXUxk/uidMumpjcYj2gOALwXO3oFR+7/4c=

# Proveedores de autenticación (REQUIRED)
AUTH_PROVIDERS=email
```

### Paso 3: Configurar MongoDB (1 min)

```bash
# macOS con Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Paso 4: Iniciar Aplicación (1 min)

```bash
yarn dev
```

**¡Listo!** → [http://localhost:9001](http://localhost:9001)

### Paso 5: Primer Uso (1 min)

1. **Abre** http://localhost:9001
2. **Regístrate** con tu email (serás automáticamente admin)
3. **Explora** el dashboard y panel de administración

## 📋 Requisitos

- Node.js 18+
- Yarn 1.22+
- MongoDB (local o Atlas)

## 🛠️ Instalación

### 1. Instalar Dependencias

```bash
# Desde la raíz del monorepo
yarn install

# O solo para web
cd apps/web
yarn install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.template .env.local
```

Edita `.env.local` con tu configuración:

```bash
# Base de datos (REQUIRED)
MONGODB_URI=mongodb://127.0.0.1:27017/

# NextAuth (REQUIRED)
NEXTAUTH_URL=http://localhost:9001
NEXTAUTH_SECRET=tu-secret-generado-con-openssl

# Proveedores de autenticación (REQUIRED)
AUTH_PROVIDERS=email,google,facebook

# Google OAuth (OPTIONAL)
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Facebook OAuth (OPTIONAL)
FACEBOOK_CLIENT_ID=tu-facebook-app-id
FACEBOOK_CLIENT_SECRET=tu-facebook-app-secret

# Email/SMTP (OPTIONAL)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
SMTP_FROM=tu-email@gmail.com
```

### 3. Iniciar Aplicación

```bash
yarn dev
```

Abre [http://localhost:9001](http://localhost:9001)

## 📁 Estructura del Proyecto

```
apps/web/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── mobile/        # Mobile app endpoints
│   │   │   ├── register/      # Registro
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── login/             # Página de login
│   │   ├── register/          # Página de registro
│   │   ├── dashboard/         # Dashboard de usuario
│   │   ├── admin/             # Panel de administración
│   │   └── page.tsx           # Página principal
│   ├── components/            # Componentes React
│   ├── lib/                   # Utilidades
│   │   ├── auth.ts           # Configuración NextAuth
│   │   ├── logger.ts         # Sistema de logs
│   │   └── rate-limit.ts     # Rate limiting
│   └── middleware.ts          # Middleware de Next.js
├── public/                    # Assets estáticos
├── .env.template             # Template de variables
├── next.config.js            # Configuración Next.js
├── tailwind.config.js        # Configuración Tailwind
└── package.json
```

## 🔐 Sistema de Autenticación

### Proveedores Disponibles

#### 1. Email/Password (Siempre activo)
- Registro con nombre, email y contraseña
- Login con email y contraseña
- Recuperación de contraseña vía email

#### 2. Google OAuth (Opcional)
```bash
AUTH_PROVIDERS=email,google
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
```

#### 3. Facebook OAuth (Opcional)
```bash
AUTH_PROVIDERS=email,facebook
FACEBOOK_CLIENT_ID=tu-app-id
FACEBOOK_CLIENT_SECRET=tu-app-secret
```

### Configurar OAuth

#### Google OAuth
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto → Habilita Google+ API
3. Credentials → Create OAuth 2.0 Client ID
4. Authorized redirect URIs: `http://localhost:9001/api/auth/callback/google`
5. Copia Client ID y Client Secret a `.env.local`

#### Facebook OAuth
1. Ve a [Facebook Developers](https://developers.facebook.com)
2. Crea una app → Añade producto "Facebook Login"
3. Settings → Basic: copia App ID y App Secret
4. Valid OAuth Redirect URIs: `http://localhost:9001/api/auth/callback/facebook`
5. Copia App ID y App Secret a `.env.local`

## 👤 Sistema de Usuarios

### Roles

- **ADMIN**: Acceso completo, gestión de usuarios
- **USER**: Acceso básico, dashboard personal

### Primer Usuario

El **primer usuario registrado** automáticamente se convierte en **administrador**.

### Gestión de Usuarios

Los administradores pueden:
- Ver lista de todos los usuarios
- Cambiar roles de usuarios
- Eliminar usuarios
- Ver estadísticas del sistema

## 📱 Integración con Mobile App

Esta aplicación web sirve como **backend** para la aplicación móvil.

### Endpoints para Móvil

```
POST /api/mobile/auth/login      # Login con JWT
GET  /api/mobile/auth/profile    # Obtener perfil
POST /api/mobile/auth/oauth      # OAuth para móvil
POST /api/register               # Registro (compartido)
```

### Configuración

Asegúrate de que las credenciales OAuth sean las mismas:

```bash
# Web (.env.local)
GOOGLE_CLIENT_ID=tu-client-id

# Mobile (apps/mobile/.env.local)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=tu-client-id  # ← Mismo valor
```

## 🎨 Personalización

### Colores del Tema

Edita `.env.local`:

```bash
PRIMARY_COLOR=#3b82f6      # Azul
SECONDARY_COLOR=#10b981    # Verde
BACKGROUND_COLOR=#ffffff   # Blanco
TEXT_COLOR=#1f2937        # Gris oscuro
```

### Fuente

```bash
FONT_FAMILY=Inter  # O cualquier fuente de Google Fonts
```

## 📧 Configuración de Email

Para recuperación de contraseñas y emails de bienvenida:

### Gmail

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password  # No tu contraseña normal
SMTP_FROM=tu-email@gmail.com
```

**Generar App Password**:
1. Google Account → Security → 2-Step Verification
2. App passwords → Generate password for "Mail"
3. Usa esa contraseña en `SMTP_PASSWORD`

### Otros Proveedores

Cualquier servidor SMTP funciona. Ajusta `SMTP_HOST`, `SMTP_PORT` según tu proveedor.

## 🚀 Comandos de Despliegue

### Desarrollo

```bash
# Iniciar servidor de desarrollo
yarn dev

# Servidor estará disponible en http://localhost:9001
```

### Producción

#### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Variables de entorno en Vercel**:
1. Project Settings → Environment Variables
2. Agrega todas las variables de `.env.local`
3. Cambia `NEXTAUTH_URL` a tu dominio de producción
4. Usa `MONGODB_URI` de MongoDB Atlas

#### Docker

```bash
# Build
docker build -t megamercado-web .

# Run
docker run -p 3000:3000 --env-file .env.local megamercado-web
```

#### Build Manual

```bash
# Crear build de producción
yarn build

# Iniciar servidor de producción
yarn start
```

## 📊 Logging y Monitoreo

La aplicación incluye un sistema de logging completo:

```typescript
import { logger, logAuth, logAPI } from '@/lib/logger';

// Logs generales
logger.info('Mensaje informativo');
logger.error('Error crítico');

// Logs de autenticación
logAuth.login('user@example.com', true);
logAuth.register('user@example.com', 'USER', '192.168.1.1');

// Logs de API
logAPI.request('GET', '/api/users', '192.168.1.1');
```

## 🔒 Seguridad

- ✅ **Rate limiting**: Protección contra fuerza bruta
- ✅ **CSRF protection**: Tokens CSRF en formularios
- ✅ **Password hashing**: bcrypt con salt rounds
- ✅ **JWT tokens**: Sesiones seguras con NextAuth
- ✅ **Input validation**: Zod para validación de datos
- ✅ **SQL injection**: Mongoose previene inyecciones

## 🐛 Troubleshooting

### Error: "Cannot connect to MongoDB"
```bash
# Verificar MongoDB
brew services list | grep mongodb
brew services start mongodb-community

# O usar MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/monorepo
```

### Error: "Invalid secret"
```bash
# Generar nuevo secret
openssl rand -base64 32

# Agregar a .env.local
NEXTAUTH_SECRET=el-secret-generado
```

### OAuth no funciona
- Verifica redirect URIs en consola de OAuth
- Asegúrate de que Client ID y Secret sean correctos
- Verifica que el provider esté en `AUTH_PROVIDERS`

### Emails no se envían
- Para Gmail, usa "App Password"
- Verifica que SMTP_HOST y SMTP_PORT sean correctos
- Revisa logs para ver errores específicos

## 📚 Scripts Disponibles

```bash
yarn dev          # Desarrollo (http://localhost:9001)
yarn build        # Build para producción
yarn start        # Iniciar build de producción
yarn lint         # Linting
```

## 🆘 Soporte

- 📱 **Mobile App**: [../mobile/README.md](../mobile/README.md)
- 🏠 **Monorepo**: [../../README.md](../../README.md)
- � **eIssues**: Abre un issue en el repositorio