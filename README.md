# Monorepo Auth System

Sistema de autenticación completo construido con Next.js, MongoDB, y NextAuth.js en arquitectura monorepo.

## 🚀 Características

- ✅ Autenticación con email/password
- ✅ OAuth con Google y Facebook
- ✅ Recuperación de contraseñas
- ✅ Primer usuario automático como administrador
- ✅ Sistema de roles (Admin, User)
- ✅ Temas personalizables vía variables de entorno
- ✅ Listo para desplegar en Vercel
- ✅ MongoDB local o Atlas para producción

## 📦 Estructura del Monorepo

```
/monorepo
├── apps/
│   └── web/              # Aplicación Next.js
├── packages/
│   ├── database/         # Modelos y conexión MongoDB
│   ├── types/            # Tipos TypeScript compartidos
│   ├── utils/            # Utilidades compartidas
│   └── ui/               # Componentes UI compartidos
├── .env.local            # Variables de entorno local
└── package.json          # Workspace root
```

## 🛠️ Requisitos Previos

- **Node.js** 18+ y **Yarn** 1.22+
- **MongoDB** local o cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- (Opcional) Credenciales de OAuth:
  - [Google Cloud Console](https://console.cloud.google.com) para Google OAuth
  - [Facebook Developers](https://developers.facebook.com) para Facebook OAuth

## 📝 Configuración Local

### 1. Clonar e Instalar Dependencias

```bash
# Navegar al directorio del proyecto
cd /Users/lo/Code/retia/monorepo

# Instalar todas las dependencias del monorepo
yarn install
```

### 2. Configurar Variables de Entorno

Copia el template y configura tus variables:

```bash
cp .env.local.template .env.local
```

Edita `.env.local` con tus valores:

```bash
# MongoDB - Para desarrollo local
MONGODB_URI=mongodb://localhost:27017/auth-system

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secreto-muy-seguro-cambiar-en-produccion

# Proveedores de Auth (activa los que necesites)
AUTH_PROVIDERS=email,google,facebook

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Facebook OAuth (opcional)
FACEBOOK_CLIENT_ID=tu-facebook-app-id
FACEBOOK_CLIENT_SECRET=tu-facebook-app-secret

# Email (para recuperación de contraseña)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password

# Colores del Tema
PRIMARY_COLOR=#3b82f6
SECONDARY_COLOR=#10b981
BACKGROUND_COLOR=#ffffff
TEXT_COLOR=#1f2937
```

### 3. Generar Secret de NextAuth

```bash
# Genera un secret aleatorio seguro
openssl rand -base64 32
```

Copia el resultado en `NEXTAUTH_SECRET` en tu `.env.local`.

### 4. Configurar MongoDB Local (Opcional)

Si no tienes MongoDB instalado localmente:

```bash
# macOS con Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# O usa MongoDB Atlas (recomendado para producción)
```

### 5. Configurar OAuth Providers (Opcional)

#### Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita "Google+ API"
4. Ve a "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Tipo de aplicación: "Web application"
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (local)
   - `https://tu-dominio.com/api/auth/callback/google` (producción)
7. Copia Client ID y Client Secret a tu `.env.local`

#### Facebook OAuth

1. Ve a [Facebook Developers](https://developers.facebook.com)
2. Crea una nueva app
3. Añade producto "Facebook Login"
4. Configuración → Basic:
   - Copia App ID y App Secret a tu `.env.local`
5. Facebook Login → Settings:
   - Valid OAuth Redirect URIs:
     - `http://localhost:3000/api/auth/callback/facebook` (local)
     - `https://tu-dominio.com/api/auth/callback/facebook` (producción)

### 6. Iniciar el Servidor de Desarrollo

```bash
cd apps/web
yarn dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🎨 Personalización del Tema

Modifica los colores en `.env.local`:

```bash
PRIMARY_COLOR=#your-color      # Color principal (botones, links)
SECONDARY_COLOR=#your-color    # Color secundario
BACKGROUND_COLOR=#your-color   # Color de fondo
TEXT_COLOR=#your-color         # Color de texto principal
```

Los colores soportan formato hexadecimal (#RGB, #RRGGBB) y named colors CSS.

## 👤 Primer Usuario (Administrador)

La primera vez que accedas a la aplicación:

1. No habrá usuarios en la base de datos
2. Serás redirigido automáticamente a la página de registro
3. El primer usuario registrado recibe automáticamente rol de **ADMIN**
4. Los usuarios subsiguientes pueden ser creados solo por administradores

## 🚀 Despliegue en Vercel

### 1. Preparar MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Database Access: Crea un usuario con contraseña
4. Network Access: Añade `0.0.0.0/0` (permite todas las IPs) o específicas de Vercel
5. Copia tu connection string:
   ```
   mongodb+srv://usuario:password@cluster.mongodb.net/nombre-db?retryWrites=true&w=majority
   ```

### 2. Desplegar en Vercel

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Desde el directorio del proyecto
cd apps/web

# Desplegar
vercel
```

Sigue las instrucciones interactivas:
- **Set up and deploy**: Yes
- **Which scope**: Tu cuenta/equipo
- **Link to existing project**: No
- **Project name**: auth-system (o tu nombre preferido)
- **Directory**: ./
- **Override settings**: No

### 3. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel (o con CLI):

```bash
# Vía CLI
vercel env add MONGODB_URI
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add AUTH_PROVIDERS
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add FACEBOOK_CLIENT_ID
vercel env add FACEBOOK_CLIENT_SECRET
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASSWORD
vercel env add PRIMARY_COLOR
vercel env add SECONDARY_COLOR
vercel env add BACKGROUND_COLOR
vercel env add TEXT_COLOR
```

O vía dashboard:
1. Project Settings → Environment Variables
2. Añade todas las variables de `.env.production.template`

**Importante**:
- `NEXTAUTH_URL`: debe ser tu dominio de producción (ej: `https://tu-app.vercel.app`)
- `NEXTAUTH_SECRET`: genera uno nuevo para producción con `openssl rand -base64 32`

### 4. Actualizar URLs de OAuth

Añade las URLs de producción en:
- Google Cloud Console → OAuth redirect URIs: `https://tu-dominio.vercel.app/api/auth/callback/google`
- Facebook Developers → Valid OAuth Redirect URIs: `https://tu-dominio.vercel.app/api/auth/callback/facebook`

### 5. Re-desplegar

```bash
vercel --prod
```

## 🔐 Flujos de Autenticación

### Login
1. Usuario ingresa email y contraseña
2. Opcionalmente puede usar Google o Facebook OAuth (si están habilitados)
3. Al autenticarse, es redirigido a la página de bienvenida

### Registro
1. Solo accesible si no hay usuarios o si eres admin
2. Requiere: nombre, email, contraseña
3. Primer usuario → rol ADMIN automáticamente
4. Usuarios subsiguientes → rol USER

### Recuperación de Contraseña
1. Usuario ingresa su email
2. Sistema envía email con token de recuperación
3. Usuario usa el link para establecer nueva contraseña

## 📁 Scripts Útiles

```bash
# Desde la raíz del monorepo
yarn install              # Instalar todas las dependencias

# Desde apps/web
yarn dev                  # Desarrollo
yarn build                # Build de producción
yarn start                # Servidor de producción
yarn lint                 # Linter

# Limpiar node_modules y reinstalar
yarn clean                # (si está configurado)
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

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js v5
- **Base de Datos**: MongoDB con Mongoose
- **Email**: Nodemailer
- **Monorepo**: Yarn Workspaces
- **Deployment**: Vercel
- **Validación**: Zod
- **Seguridad**: bcryptjs para hashing de contraseñas

## 📄 Licencia

MIT

## 🤝 Contribuir

Pull requests son bienvenidos. Para cambios mayores, por favor abre un issue primero.

---

**¿Necesitas ayuda?** Revisa la documentación en `/docs/` o abre un issue.
