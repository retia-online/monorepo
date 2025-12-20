# 🚀 Web App - Inicio Rápido (5 Minutos)

Guía para tener la aplicación web funcionando en menos de 5 minutos.

## Paso 1: Instalar Dependencias (1 min)

```bash
# Desde la raíz del monorepo
cd /Users/lo/Code/retia/monorepo
yarn install
```

## Paso 2: Configurar Variables de Entorno (1 min)

```bash
# Copiar template
cp apps/web/.env.template apps/web/.env.local
```

**Editar `apps/web/.env.local`** con configuración mínima:

```bash
# Base de datos (REQUIRED)
MONGODB_URI=mongodb://127.0.0.1:27017/monorepo

# NextAuth (REQUIRED)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=F+yuaKb5WnXUxk/uidMumpjcYj2gOALwXO3oFR+7/4c=

# Proveedores de autenticación (REQUIRED)
AUTH_PROVIDERS=email
```

## Paso 3: Configurar MongoDB (1 min)

### Opción A: MongoDB Local (Recomendado para desarrollo)

```bash
# macOS con Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Opción B: MongoDB Atlas (Cloud)

1. Crea cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea cluster gratuito
3. Obtén connection string
4. Actualiza `MONGODB_URI` en `.env.local`

## Paso 4: Iniciar Aplicación (1 min)

```bash
cd apps/web
yarn dev
```

**¡Listo!** → [http://localhost:3000](http://localhost:3000)

## Paso 5: Primer Uso (1 min)

1. **Abre** http://localhost:3000
2. **Regístrate** con tu email (serás automáticamente admin)
3. **Explora** el dashboard y panel de administración

---

## 🎨 Personalización Rápida (Opcional)

### Agregar OAuth

Edita `apps/web/.env.local`:

```bash
# Habilitar Google y Facebook
AUTH_PROVIDERS=email,google,facebook

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Facebook OAuth  
FACEBOOK_CLIENT_ID=tu-facebook-app-id
FACEBOOK_CLIENT_SECRET=tu-facebook-app-secret
```

### Personalizar Colores

```bash
# Colores del tema
PRIMARY_COLOR=#6366f1        # Púrpura
SECONDARY_COLOR=#ec4899      # Rosa
BACKGROUND_COLOR=#f8fafc     # Gris claro
TEXT_COLOR=#1e293b          # Gris oscuro
```

### Configurar Email

```bash
# Para recuperación de contraseñas
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
SMTP_FROM=tu-email@gmail.com
```

---

## ✅ ¡Web App Lista!

### 🌐 Funcionalidades Disponibles

- ✅ **Registro/Login**: Sistema completo de autenticación
- ✅ **Dashboard**: Panel personalizado para cada usuario
- ✅ **Admin Panel**: Gestión de usuarios (solo administradores)
- ✅ **Recuperación**: Reset de contraseña vía email
- ✅ **OAuth**: Google y Facebook (si configurado)
- ✅ **Responsive**: Funciona en móvil y desktop

### 📱 Integración con Mobile

Si también quieres la app móvil:

```bash
# Terminal 2: Mobile App
cd apps/mobile
yarn start
# → Escanea QR con Expo Go
```

Los usuarios serán **compartidos** entre web y móvil automáticamente.

---

## 🐛 Solución de Problemas

### MongoDB no conecta
```bash
# Verificar servicio
brew services list | grep mongodb

# Iniciar si no está corriendo
brew services start mongodb-community

# Verificar conexión
mongosh mongodb://127.0.0.1:27017/monorepo
```

### Puerto 3000 ocupado
```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# O usar otro puerto
yarn dev -p 3001
```

### Error "Invalid secret"
```bash
# Generar nuevo secret
openssl rand -base64 32

# Copiar resultado a NEXTAUTH_SECRET en .env.local
```

### Dependencias rotas
```bash
# Limpiar e instalar
rm -rf node_modules yarn.lock
yarn install
```

---

## 📚 Próximos Pasos

### 🔧 Configuración Avanzada
- 📖 **Documentación completa**: [README.md](./README.md)
- 🛠️ **OAuth setup**: Ver sección OAuth en README
- 📧 **Email setup**: Configurar SMTP para emails

### 🚀 Despliegue
- ☁️ **Vercel**: `vercel --prod`
- 🐳 **Docker**: Ver README para instrucciones

### � sMobile App
- 📱 **Agregar móvil**: [../mobile/QUICKSTART.md](../mobile/QUICKSTART.md)
- 🔄 **Integración**: Usuarios compartidos automáticamente

---

## 🆘 ¿Necesitas Ayuda?

- 📖 **Documentación completa**: [README.md](./README.md)
- 🏠 **Monorepo**: [../../README.md](../../README.md)
- 📱 **Mobile**: [../mobile/README.md](../mobile/README.md)
- 🐛 **Issues**: Abre un issue en el repositorio