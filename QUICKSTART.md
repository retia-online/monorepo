# 🚀 Monorepo - Inicio Rápido (5 Minutos)

Guía rápida para tener el sistema completo funcionando en menos de 5 minutos.

## Elige tu Aplicación

### 🌐 Solo Web App
Si solo necesitas la aplicación web:

**→ [Web App - Inicio Rápido](./apps/web/QUICKSTART.md)**

### 📱 Solo Mobile App  
Si solo necesitas la aplicación móvil:

**→ [Mobile App - Inicio Rápido](./apps/mobile/QUICKSTART.md)**

### 🔄 Sistema Completo (Recomendado)
Para web y móvil integrados con usuarios compartidos:

## Paso 1: Instalar Dependencias (1 min)

```bash
cd /Users/lo/Code/retia/monorepo
yarn install
```

## Paso 2: Configurar Variables de Entorno (1 min)

```bash
# Copiar todos los templates
cp .env.template .env.local
cp apps/web/.env.template apps/web/.env.local  
cp apps/mobile/.env.example apps/mobile/.env.local
```

**Configuración mínima** (editar `.env.local`):

```bash
# Base de datos
MONGODB_URI=mongodb://127.0.0.1:27017/monorepo

# NextAuth (generar con: openssl rand -base64 32)
NEXTAUTH_SECRET=tu-secret-muy-seguro-aqui

# Proveedores de autenticación
AUTH_PROVIDERS=email
```

## Paso 3: Configurar MongoDB (1 min)

```bash
# macOS con Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

## Paso 4: Iniciar Ambas Apps (1 min)

**Terminal 1: Web App**
```bash
cd apps/web
yarn dev
# → http://localhost:3000
```

**Terminal 2: Mobile App**
```bash
cd apps/mobile  
yarn start
# → Escanea QR con Expo Go
```

## Paso 5: Primer Uso (1 min)

1. **Web**: Abre http://localhost:3000 y regístrate
2. **Mobile**: Escanea QR y usa las mismas credenciales
3. **¡Listo!** Usuarios sincronizados entre ambas apps

---

## 🎨 Personalización Rápida (Opcional)

### Colores del Tema
Edita `.env.local`:

```bash
PRIMARY_COLOR=#6366f1        # Púrpura
SECONDARY_COLOR=#ec4899      # Rosa
```

### Configuración Móvil
Edita `apps/mobile/.env.local`:

```bash
# Modo de autenticación
EXPO_PUBLIC_AUTH_MODE=optional    # required/optional/disabled

# Mensaje principal
EXPO_PUBLIC_MAIN_SCREEN_MESSAGE=¡Bienvenido!
```

---

## ✅ ¡Sistema Completo Listo!

Tienes ambas aplicaciones funcionando:

### 🌐 Web App
- **URL**: http://localhost:3000
- **Funciones**: Dashboard, admin panel, recuperación de contraseña
- **Documentación**: [apps/web/README.md](./apps/web/README.md)

### 📱 Mobile App
- **Acceso**: Escanea QR con Expo Go
- **Funciones**: Login, perfil, configuración flexible
- **Documentación**: [apps/mobile/README.md](./apps/mobile/README.md)

### 🔄 Integración
- ✅ **Usuarios compartidos** entre web y móvil
- ✅ **OAuth sincronizado** en ambas plataformas
- ✅ **Base de datos unificada**

---

## 🆘 Solución de Problemas

### MongoDB no conecta
```bash
brew services list | grep mongodb
brew services start mongodb-community
```

### Puertos ocupados
```bash
# Web (puerto 3000)
lsof -ti:3000 | xargs kill -9

# Mobile (puerto 19000)  
lsof -ti:19000 | xargs kill -9
```

### Dependencias
```bash
rm -rf node_modules yarn.lock
yarn install
```

---

## 📚 Próximos Pasos

- 📖 **Documentación completa**: [README.md](./README.md)
- 🛠️ **Configuración avanzada**: [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)
- 🚀 **Despliegue**: Ver docs específicas de cada app
