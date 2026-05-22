# Local Development Environment

## 📋 Descripción
Configuración para desarrollo local en tu máquina. Este entorno es para desarrollo y testing.

## 🏗️ Estructura

```
scripts/environments/local/
├── README.md                    # Esta documentación
├── setup.sh                     # Script de configuración inicial
├── start.sh                     # Script para iniciar todos los servicios
├── web/                         # Configuración web
│   ├── setup.sh                 # Configurar web para desarrollo
│   └── README.md               # Documentación web
├── mobile/                      # Configuración móvil
│   ├── setup.sh                 # Configurar mobile para desarrollo
│   └── README.md               # Documentación móvil
├── database/                    # Configuración base de datos
│   ├── setup-mongodb.sh        # Configurar MongoDB local
│   └── README.md               # Documentación MongoDB
└── templates/                   # Plantillas
    ├── .env.web.local          # Plantilla variables web
    ├── .env.mobile.local       # Plantilla variables móvil
    └── README.md               # Instrucciones plantillas
```

## 🚀 Inicio Rápido

### 1. Configuración inicial
```bash
# Desde la raíz del proyecto
./scripts/environments/local/setup.sh
```

### 2. Iniciar todos los servicios
```bash
./scripts/environments/local/start.sh
```

### 3. Configurar web app
```bash
./scripts/environments/local/web/setup.sh
```

### 4. Configurar mobile app
```bash
./scripts/environments/local/mobile/setup.sh
```

## 🔧 Requisitos Previos

### Software necesario:
1. **Node.js** 18+ y **Yarn**
2. **MongoDB** (local o Docker)
3. **Git** para control de versiones
4. **Expo CLI** (para desarrollo móvil)

### Para macOS:
```bash
# Instalar Homebrew si no lo tienes
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar dependencias
brew install node yarn git mongodb-community
```

### Para Windows:
1. **Node.js** desde https://nodejs.org
2. **Yarn**: `npm install -g yarn`
3. **MongoDB** desde https://www.mongodb.com/try/download/community
4. **Git** desde https://git-scm.com

## 📊 Arquitectura Local

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dispositivo   │    │   Localhost      │    │   MongoDB       │
│      Móvil      │◄──►│   (Next.js)     │◄──►│    (Local)      │
│   (Expo Go)     │    │   Puerto: 9001   │    │   Puerto: 27017 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   Expo Metro Server      http://localhost:9001   mongodb://localhost:27017
   Puerto: 8081
```

## 🔗 URLs Locales

### Web App:
- **Development**: `http://localhost:9001`
- **API**: `http://localhost:9001/api/...`
- **Health Check**: `http://localhost:9001/api/health`

### Mobile App:
- **Expo Metro**: `http://localhost:8081`
- **QR Code**: Escanear con Expo Go app

### MongoDB:
- **Connection**: `mongodb://localhost:27017`
- **Shell**: `mongosh`

## 🧪 Pruebas Locales

### Pruebas básicas:
1. **Registro primer usuario** → Debe obtener rol ADMIN
2. **Login con email**
3. **Endpoints API** (health, auth, users)
4. **Mobile app** conectando a localhost

### Pruebas específicas:
1. **Hot reload** en desarrollo web
2. **Fast refresh** en desarrollo móvil
3. **Type checking** con TypeScript
4. **Linting** con ESLint

## ⚠️ Consideraciones de Desarrollo

### Variables de entorno:
- **`.env.local`** está en `.gitignore` - nunca lo commitees
- Usa diferentes `NEXTAUTH_SECRET` para cada entorno
- Para desarrollo móvil, usa tu IP local real (no `localhost`)

### Base de datos:
- MongoDB local es efímero (datos se pierden al reiniciar)
- Usa para desarrollo, no para datos persistentes
- Considera MongoDB Atlas para datos de prueba persistentes

### Networking:
- Para desarrollo móvil, usa tu IP local: `http://[TU_IP]:9001`
- Obtén tu IP: `ipconfig getifaddr en0` (macOS)
- Asegura que el firewall permita conexiones

## 🔄 Flujo de Trabajo Local

### Desarrollo normal:
```bash
# 1. Configurar entorno local
./scripts/environments/local/setup.sh

# 2. Iniciar servicios
./scripts/environments/local/start.sh

# 3. Desarrollar en web (puerto 9001)
# 4. Desarrollar en mobile (Expo Go)
# 5. Probar cambios
```

### Testing específico:
```bash
# Testing web
cd apps/web
yarn test

# Testing mobile
cd apps/mobile
yarn test

# Linting
yarn lint

# Type checking
yarn type-check
```

### Debugging:
```bash
# Ver logs de web
cd apps/web
yarn dev --verbose

# Ver logs de mobile
cd apps/mobile
expo start --clear

# Ver logs de MongoDB
tail -f /usr/local/var/log/mongodb/mongo.log
```

## 🛠️ Solución de Problemas

### "Cannot connect to API" en móvil:
**Solución**: Usa tu IP local en `EXPO_PUBLIC_API_URL`
```bash
# Obtener IP en macOS
ipconfig getifaddr en0

# Configurar en .env.mobile.local
EXPO_PUBLIC_API_URL=http://[TU_IP]:9001
```

### "MongoDB connection refused":
```bash
# macOS con Homebrew
brew services restart mongodb-community

# Verificar que esté corriendo
brew services list | grep mongodb
```

### "Puerto en uso":
```bash
# Liberar puerto 9001
lsof -ti:9001 | xargs kill -9

# Liberar puerto 8081 (Expo)
lsof -ti:8081 | xargs kill -9
```

### "Dependencies not found":
```bash
# Reinstalar dependencias
yarn install --force

# Limpiar cache
yarn cache clean
```

### "TypeScript errors":
```bash
# Verificar tipos
yarn type-check

# Limpiar cache TypeScript
rm -rf apps/web/.next
rm -rf apps/mobile/.expo
```

## 📞 Soporte

### Documentación:
- **Esta carpeta**: `scripts/environments/local/`
- **Subcarpetas**: Documentación específica por componente
- **Plantillas**: `scripts/environments/local/templates/`

### Scripts de ayuda:
- `./scripts/environments/local/setup.sh` - Configuración inicial
- `./scripts/environments/local/start.sh` - Iniciar servicios
- `./scripts/environments/local/web/setup.sh` - Configurar web
- `./scripts/environments/local/mobile/setup.sh` - Configurar mobile

### Recursos externos:
- **Next.js Documentation**: https://nextjs.org/docs
- **Expo Documentation**: https://docs.expo.dev
- **MongoDB Documentation**: https://docs.mongodb.com
- **React Native**: https://reactnative.dev

## 🔗 Enlaces Rápidos

### Comandos útiles:
```bash
# Iniciar solo web
cd apps/web && yarn dev

# Iniciar solo mobile
cd apps/mobile && expo start

# Iniciar MongoDB
brew services start mongodb-community

# Ver todos los servicios
./scripts/environments/local/start.sh
```

### URLs de acceso:
- **Web**: http://localhost:9001
- **Expo**: http://localhost:8081 (QR para móvil)
- **MongoDB**: mongodb://localhost:27017

---

**Nota**: Este entorno es para desarrollo local. Los datos en MongoDB local son efímeros y se pierden al reiniciar el servicio.
