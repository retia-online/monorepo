# Web App Configuration - Staging

## 📋 Descripción
Configuración de la aplicación web para el entorno de staging en Vercel.

## 🌐 Staging en Vercel

### URLs
- **Web App**: `https://[app-name]-[hash].vercel.app`
- **API**: `https://[app-name]-[hash].vercel.app/api/...`
- **Health Check**: `https://[app-name]-[hash].vercel.app/api/health`

### Características
- **Next.js 14** con App Router
- **NextAuth.js** para autenticación
- **MongoDB Atlas** para base de datos
- **Google OAuth** para login social
- **Email** para registro tradicional

## 🚀 Configuración Rápida

### Usar script automatizado:
```bash
./setup.sh
```

### Pasos manuales:
1. **Configurar variables de entorno** en `apps/web/.env.staging`
2. **Configurar Vercel** con las variables
3. **Build y deploy** a Vercel
4. **Configurar OAuth providers** (Google)
5. **Probar la aplicación**

## 🔧 Variables de Entorno

### Archivo: `apps/web/.env.staging`
```env
# ============================================
# WEB APP - STAGING ENVIRONMENT VARIABLES
# ============================================

INSTANCE=Retia-Staging
NEXT_PUBLIC_INSTANCE=Retia-Staging

# Database
MONGODB_URI=mongodb+srv://staging-user:[password]@staging-cluster.xxxxx.mongodb.net/retia-staging?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=https://retia-app-staging.vercel.app
NEXTAUTH_SECRET=[generar con: openssl rand -base64 32]

# Authentication
AUTH_MODE=required
AUTH_PROVIDERS=email,google

# Google OAuth
GOOGLE_CLIENT_ID=[GOOGLE_CLIENT_ID_STAGING]
GOOGLE_CLIENT_SECRET=[GOOGLE_CLIENT_SECRET_STAGING]

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[EMAIL_STAGING@gmail.com]
SMTP_PASSWORD=[APP_PASSWORD]
SMTP_FROM=noreply@retia-staging.com

# Environment
NODE_ENV=production
LOG_LEVEL=debug

# Theme
NEXT_PUBLIC_PRIMARY_COLOR=6366f1
NEXT_PUBLIC_SECONDARY_COLOR=ec4899
NEXT_PUBLIC_BACKGROUND_COLOR=f8fafc
NEXT_PUBLIC_TEXT_COLOR=1e293b
NEXT_PUBLIC_FONT_FAMILY=Manrope
```

### Variables REQUERIDAS en Vercel:
1. `MONGODB_URI`
2. `NEXTAUTH_URL`
3. `NEXTAUTH_SECRET`
4. `GOOGLE_CLIENT_ID`
5. `GOOGLE_CLIENT_SECRET`

## 🏗️ Build y Deploy

### Build local:
```bash
cd apps/web
yarn build
```

### Deploy a Vercel:
```bash
# Con Vercel CLI
vercel --prod --confirm

# O usando script
./scripts/environments/staging/deploy.sh
```

### Build Command en Vercel:
```bash
cd ../.. && yarn install && cd apps/web && yarn build
```

### Install Command en Vercel:
```bash
yarn install
```

## 🔐 Autenticación

### Proveedores configurados:
1. **Email**: Registro tradicional con verificación
2. **Google**: OAuth 2.0 con Google

### Flujo de autenticación:
1. **Usuario visita** la app de staging
2. **Selecciona proveedor** (Email o Google)
3. **Completa autenticación** en proveedor
4. **Callback a la app** con token
5. **Creación/actualización** de usuario en MongoDB
6. **Sesión establecida** con cookies

### Primer usuario:
- **Primer usuario registrado** obtiene rol `ADMIN`
- **Usuarios posteriores** obtienen rol `USER`
- **Roles controlan** acceso a funcionalidades

## 🗄️ Base de Datos

### MongoDB Atlas para staging:
- **Cluster**: M0 Free (512MB)
- **Database**: `retia-staging`
- **Usuario**: `staging-user` con permisos readWrite
- **Colecciones**: `users`, `sessions`, `accounts`, `verificationTokens`

### Esquema principal:
```javascript
// users collection
{
  _id: ObjectId,
  name: String,
  email: String,
  emailVerified: Date,
  image: String,
  role: String, // 'ADMIN' | 'USER'
  createdAt: Date,
  updatedAt: Date
}
```

## 📧 Email

### Configuración SMTP:
- **Provider**: Gmail (para staging)
- **Port**: 587 (TLS)
- **Authentication**: App Password

### Emails enviados:
1. **Verificación de email** (registro)
2. **Reset de contraseña**
3. **Notificaciones** (opcional)

### Para staging:
- Usa email de prueba
- No uses email de producción
- Considera servicios como Mailtrap para testing

## 🎨 Tema y UI

### Variables de tema:
- **Primary Color**: `#6366f1` (índigo)
- **Secondary Color**: `#ec4899` (rosa)
- **Background**: `#f8fafc` (slate-50)
- **Text**: `#1e293b` (slate-800)
- **Font**: Manrope

### Personalización:
- Los colores se pueden cambiar en variables
- El tema se aplica automáticamente
- Responsive design incluido

## 🧪 Pruebas

### Pruebas básicas:
1. **Registro con email**
2. **Login con Google OAuth**
3. **Navegación autenticada**
4. **API endpoints**
5. **Responsive design**

### Pruebas avanzadas:
1. **Carga de múltiples usuarios**
2. **Pruebas de rendimiento**
3. **Pruebas de seguridad**
4. **Pruebas de accesibilidad**

### URLs de prueba:
- `/` - Home page
- `/login` - Login page
- `/register` - Register page
- `/profile` - Profile (autenticado)
- `/api/health` - Health check
- `/api/auth/[...nextauth]` - NextAuth endpoints

## 📊 Monitoreo

### Vercel Analytics:
- **Page views**
- **Performance metrics**
- **Error tracking**
- **Real-time logs**

### Logs:
```bash
# Ver logs en tiempo real
vercel logs

# En Dashboard: Deployments → [deployment] → Function Logs
```

### Métricas importantes:
1. **Response time**: < 200ms
2. **Error rate**: < 1%
3. **Uptime**: > 99%
4. **Memory usage**: < 512MB

## 🔄 Flujo de Trabajo

### Desarrollo → Staging:
```bash
# 1. Crear feature branch
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y commit
git add .
git commit -m "feat: nueva funcionalidad"

# 3. Desplegar a staging
./scripts/environments/staging/deploy.sh

# 4. Probar en staging
# 5. Si todo OK, merge a main
```

### Hotfix en staging:
```bash
# 1. Crear hotfix branch
git checkout -b hotfix/nombre-fix

# 2. Aplicar fix
# 3. Desplegar a staging
./scripts/environments/staging/deploy.sh

# 4. Probar fix
# 5. Merge a main y producción
```

## 🛠️ Solución de Problemas

### Build falla:
1. **Verifica variables de entorno**
2. **Verifica dependencias** (`yarn install`)
3. **Verifica TypeScript errors**
4. **Revisa logs de build**

### App no carga:
1. **Verifica URL correcta**
2. **Verifica DNS/proxy**
3. **Revisa logs de Vercel**
4. **Prueba health check**

### Autenticación no funciona:
1. **Verifica OAuth configuration**
2. **Verifica callback URLs**
3. **Revisa logs de NextAuth**
4. **Prueba con diferentes proveedores**

### Database errors:
1. **Verifica MONGODB_URI**
2. **Verifica conexión de red**
3. **Revisa logs de MongoDB Atlas**
4. **Prueba conexión manual**

## 🔗 Recursos

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Next.js Documentation**: https://nextjs.org/docs
- **NextAuth.js**: https://next-auth.js.org
- **MongoDB Atlas**: https://cloud.mongodb.com

## 📞 Soporte

- **Scripts**: `./setup.sh`
- **Documentación**: Este archivo
- **Logs**: Vercel Dashboard → Logs
- **Métricas**: Vercel Analytics

---

**Nota**: Staging es para pruebas de integración. Los datos pueden ser borrados en cualquier momento.
