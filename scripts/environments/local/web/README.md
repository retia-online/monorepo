# Web App Configuration - Local Development

## 📋 Descripción
Configuración de la aplicación web para desarrollo local.

## 🌐 Desarrollo Local

### URLs
- **Web App**: `http://localhost:9001`
- **API**: `http://localhost:9001/api/...`
- **Health Check**: `http://localhost:9001/api/health`

### Características
- **Next.js 14** con App Router
- **NextAuth.js** para autenticación
- **MongoDB local** para base de datos
- **Hot reload** para desarrollo rápido
- **TypeScript** para type safety

## 🚀 Configuración Rápida

### Usar script automatizado:
```bash
./setup.sh
```

### Pasos manuales:
1. **Configurar variables de entorno** en `apps/web/.env.local`
2. **Iniciar MongoDB local**
3. **Ejecutar** `yarn dev`
4. **Acceder a** `http://localhost:9001`

## 🔧 Variables de Entorno

### Archivo: `apps/web/.env.local`
```env
# ============================================
# WEB APP - LOCAL DEVELOPMENT ENVIRONMENT
# ============================================

INSTANCE=Retia-Local
NEXT_PUBLIC_INSTANCE=Retia-Local

# Database - MongoDB local
MONGODB_URI=mongodb://localhost:27017/retia-local

# NextAuth
NEXTAUTH_URL=http://localhost:9001
NEXTAUTH_SECRET=[generar con: openssl rand -base64 32]

# Authentication
AUTH_MODE=required
AUTH_PROVIDERS=email

# Environment
NODE_ENV=development
LOG_LEVEL=debug

# Theme
NEXT_PUBLIC_PRIMARY_COLOR=3b82f6
NEXT_PUBLIC_SECONDARY_COLOR=10b981
NEXT_PUBLIC_BACKGROUND_COLOR=ffffff
NEXT_PUBLIC_TEXT_COLOR=1f2937
NEXT_PUBLIC_FONT_FAMILY=Manrope

# Development
NEXT_PUBLIC_DEV_MODE=true
```

### Generar NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## 🏗️ Desarrollo

### Iniciar servidor de desarrollo:
```bash
cd apps/web
yarn dev
```

### Build para producción (local):
```bash
yarn build
yarn start
```

### Comandos de desarrollo:
```bash
# Linting
yarn lint

# Type checking
yarn type-check

# Testing
yarn test

# Format code
yarn format
```

## 🔐 Autenticación Local

### Proveedores configurados:
1. **Email**: Registro tradicional (sin verificación de email en desarrollo)

### Configurar OAuth para desarrollo (opcional):
1. **Crear credenciales OAuth** en Google Cloud Console
2. **Configurar URLs**:
   - Authorized JavaScript origins: `http://localhost:9001`
   - Authorized redirect URIs: `http://localhost:9001/api/auth/callback/google`
3. **Añadir variables** a `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=[tu-client-id]
   GOOGLE_CLIENT_SECRET=[tu-client-secret]
   AUTH_PROVIDERS=email,google
   ```

### Primer usuario:
- **Primer usuario registrado** obtiene rol `ADMIN`
- **Usuarios posteriores** obtienen rol `USER`
- **Roles controlan** acceso a funcionalidades

## 🗄️ Base de Datos Local

### MongoDB local:
- **Puerto**: 27017
- **Database**: `retia-local`
- **Conexión**: `mongodb://localhost:27017/retia-local`

### Iniciar MongoDB (macOS con Homebrew):
```bash
# Instalar MongoDB
brew install mongodb-community

# Iniciar servicio
brew services start mongodb-community

# Verificar
brew services list | grep mongodb
```

### Acceder a MongoDB Shell:
```bash
mongosh

# O específico para la base de datos
mongosh mongodb://localhost:27017/retia-local
```

### Colecciones principales:
- `users` - Usuarios del sistema
- `sessions` - Sesiones de NextAuth
- `accounts` - Cuentas vinculadas (OAuth)
- `verificationTokens` - Tokens de verificación

## 📧 Email en Desarrollo

### Opción 1: Sin email (recomendado para desarrollo)
- Deshabilita verificación de email
- Los usuarios se registran sin confirmación

### Opción 2: SMTP local (avanzado)
1. **Instalar servicio SMTP local** como MailHog
2. **Configurar variables**:
   ```env
   SMTP_HOST=localhost
   SMTP_PORT=1025
   SMTP_USER=
   SMTP_PASSWORD=
   SMTP_FROM=noreply@localhost
   ```
3. **Acceder a interfaz** de MailHog en `http://localhost:8025`

### Opción 3: Gmail (con App Password)
- Requiere cuenta de Gmail
- Generar App Password
- Configurar variables SMTP

## 🎨 Tema y UI

### Variables de tema (personalizables):
- **Primary Color**: `#3b82f6` (blue-500)
- **Secondary Color**: `#10b981` (emerald-500)
- **Background**: `#ffffff` (white)
- **Text**: `#1f2937` (gray-800)
- **Font**: Manrope

### Desarrollo de UI:
- **Hot reload** para cambios en CSS/JSX
- **Tailwind CSS** para estilos
- **Component library** personalizada
- **Dark mode** soportado

## 🧪 Testing Local

### Pruebas durante desarrollo:
1. **Registro de usuario**
2. **Login/logout**
3. **Navegación entre páginas**
4. **API endpoints**
5. **Responsive design**

### Herramientas de testing:
```bash
# Unit tests
yarn test

# E2E tests (si configurado)
yarn test:e2e

# Storybook (component testing)
yarn storybook
```

### Debugging:
```bash
# Con debugger de Node.js
yarn dev --inspect

# Con logs detallados
NODE_OPTIONS='--inspect' yarn dev
```

## 📊 Monitoreo Local

### Logs de desarrollo:
```bash
# Ver logs de Next.js
tail -f apps/web/.next/server/logs/*

# Ver logs de aplicación
NODE_ENV=development LOG_LEVEL=debug yarn dev

# Ver logs de MongoDB
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Herramientas de desarrollo:
- **React Developer Tools** (extensión navegador)
- **Next.js DevTools** (extensión navegador)
- **MongoDB Compass** (GUI para MongoDB)
- **Postman/Insomnia** (testing API)

## 🔄 Flujo de Trabajo

### Desarrollo normal:
```bash
# 1. Iniciar MongoDB
brew services start mongodb-community

# 2. Iniciar web app
cd apps/web
yarn dev

# 3. Desarrollar
# 4. Ver cambios en tiempo real
```

### Testing específico:
```bash
# Testing con base de datos de prueba
MONGODB_URI=mongodb://localhost:27017/retia-test yarn test

# Testing E2E
yarn test:e2e

# Linting
yarn lint
```

### Debugging avanzado:
```bash
# Con Chrome DevTools
yarn dev --inspect

# Con breakpoints
# 1. Abrir Chrome
# 2. Ir a chrome://inspect
# 3. Click en "Open dedicated DevTools for Node"
```

## 🛠️ Solución de Problemas

### "Cannot connect to MongoDB":
```bash
# Verificar que MongoDB esté corriendo
brew services list | grep mongodb

# Reiniciar MongoDB
brew services restart mongodb-community

# Verificar conexión
mongosh --eval "db.version()"
```

### "Port 9001 already in use":
```bash
# Liberar puerto
lsof -ti:9001 | xargs kill -9

# O usar puerto diferente
PORT=9002 yarn dev
```

### "NextAuth secret not set":
```bash
# Generar nueva secret
openssl rand -base64 32

# Actualizar .env.local
sed -i.bak 's/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=nueva-secret/' apps/web/.env.local
```

### "TypeScript errors":
```bash
# Limpiar cache
rm -rf apps/web/.next
rm -rf node_modules/.cache

# Reinstalar dependencias
yarn install --force
```

### "Hot reload not working":
```bash
# Limpiar cache
rm -rf apps/web/.next

# Reiniciar servidor
yarn dev --clean
```

## 🔗 Recursos

- **Next.js Documentation**: https://nextjs.org/docs
- **NextAuth.js**: https://next-auth.js.org
- **MongoDB Local**: https://docs.mongodb.com/manual/installation/
- **Tailwind CSS**: https://tailwindcss.com

## 📞 Soporte

- **Scripts**: `./setup.sh`
- **Documentación**: Este archivo
- **Logs**: `apps/web/.next/server/logs/`
- **Debugging**: Chrome DevTools

---

**Nota**: Desarrollo local usa MongoDB local que es efímero. Los datos se pierden al reiniciar el servicio.
