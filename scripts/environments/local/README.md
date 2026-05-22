# Local Development Environment (Emuladores)

## 📋 Descripción
Configuración para desarrollo local CON EMULADORES en tu máquina. Este entorno está específicamente diseñado para desarrollo con:

- **🤖 Android Studio Emulator**
- **🍎 iOS Simulator (solo macOS)**

**IMPORTANTE**: Este setup (`./scripts/environments/local/setup.sh`) siempre será para desarrollo con emuladores. Para desarrollo en dispositivo físico, usa Expo Go con la opción 2 en `mobile/setup.sh`.

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

## 🚀 Inicio Rápido PARA EMULADORES

### 1. Configuración inicial (EMULADORES)
```bash
# Desde la raíz del proyecto - CONFIGURACIÓN PARA EMULADORES
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

### 4. Configurar mobile app PARA EMULADOR
```bash
# Selecciona opción 1 (Desarrollo con EMULADOR)
./scripts/environments/local/mobile/setup.sh
```

## 🔧 Requisitos Previos PARA EMULADORES

### Software necesario PARA EMULADORES:
1. **Node.js** 18+ y **Yarn**
2. **MongoDB** (local o Docker)
3. **Git** para control de versiones
4. **Expo CLI** (para desarrollo móvil)
5. **🤖 Android Studio** (para Android Emulator) O **🍎 Xcode** (para iOS Simulator, solo macOS)

### Para macOS (iOS Simulator + Android Emulator):
```bash
# 1. Instalar Xcode desde App Store (para iOS Simulator)
# 2. Instalar Android Studio desde https://developer.android.com/studio

# 3. Instalar Homebrew si no lo tienes
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 4. Instalar dependencias
brew install node yarn git mongodb-community
```

### Para Windows (solo Android Emulator):
1. **Android Studio** desde https://developer.android.com/studio
2. **Node.js** desde https://nodejs.org
3. **Yarn**: `npm install -g yarn`
4. **MongoDB** desde https://www.mongodb.com/try/download/community
5. **Git** desde https://git-scm.com

### Para Linux (solo Android Emulator):
1. **Android Studio** desde https://developer.android.com/studio
2. **Node.js**: `sudo apt install nodejs npm`
3. **Yarn**: `npm install -g yarn`
4. **MongoDB**: `sudo apt install mongodb`
5. **Git**: `sudo apt install git`

## 📊 Arquitectura Local PARA EMULADORES

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   EMULADOR      │    │   Localhost      │    │   MongoDB       │
│   Android/iOS   │◄──►│   (Next.js)     │◄──►│    (Local)      │
│                 │    │   Puerto: 9001   │    │   Puerto: 27017 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   Expo Metro Server      http://localhost:9001   mongodb://localhost:27017
   Puerto: 8081           http://10.0.2.2:9001*   (Android Emulator)
```

* **Android Emulator**: Usa `http://10.0.2.2:9001` para conectar al host
* **iOS Simulator**: Usa `http://localhost:9001` (mismo que host)

## 🔗 URLs Locales PARA EMULADORES

### Web App (Host):
- **Development**: `http://localhost:9001`
- **API**: `http://localhost:9001/api/...`
- **Health Check**: `http://localhost:9001/api/health`

### Mobile App (EMULADORES):
- **Android Emulator API**: `http://10.0.2.2:9001`
- **iOS Simulator API**: `http://localhost:9001`
- **Expo Metro**: `http://localhost:8081`
- **QR Code**: Solo para dispositivo físico (Expo Go)

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

## ⚠️ Consideraciones de Desarrollo PARA EMULADORES

### Variables de entorno PARA EMULADORES:
- **`.env.local`** está en `.gitignore` - nunca lo commitees
- Usa diferentes `NEXTAUTH_SECRET` para cada entorno
- **PARA EMULADORES**: Configura `EXPO_PUBLIC_API_URL` correctamente:
  - Android Emulator: `http://10.0.2.2:9001`
  - iOS Simulator: `http://localhost:9001`

### Base de datos:
- MongoDB local es efímero (datos se pierden al reiniciar)
- Usa para desarrollo, no para datos persistentes
- Considera MongoDB Atlas para datos de prueba persistentes

### Networking PARA EMULADORES:
- **Android Emulator**: Usa dirección especial `10.0.2.2` para acceder al host
- **iOS Simulator**: Comparte network stack con host, usa `localhost`
- No se necesita configuración de firewall especial para emuladores
- Los emuladores tienen acceso directo a los puertos del host

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

### "Cannot connect to API" en EMULADOR:
**Solución PARA EMULADORES**:
- **Android Emulator**: Asegura que `EXPO_PUBLIC_API_URL=http://10.0.2.2:9001`
- **iOS Simulator**: Asegura que `EXPO_PUBLIC_API_URL=http://localhost:9001`
- Verifica que web app esté corriendo: `cd apps/web && yarn dev`
- Verifica puerto: `lsof -ti:9001` (debe estar en uso)

```bash
# Para Android Emulator (configuración predeterminada):
EXPO_PUBLIC_API_URL=http://10.0.2.2:9001

# Para iOS Simulator (macOS con Xcode):
EXPO_PUBLIC_API_URL=http://localhost:9001
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
- `./scripts/environments/local/cleanup.sh` - Limpieza del entorno local
- `./scripts/environments/local/web/setup.sh` - Configurar web
- `./scripts/environments/local/mobile/setup.sh` - Configurar mobile

### Recursos externos:
- **Next.js Documentation**: https://nextjs.org/docs
- **Expo Documentation**: https://docs.expo.dev
- **MongoDB Documentation**: https://docs.mongodb.com
- **React Native**: https://reactnative.dev

## 🧹 Limpieza del Entorno Local

### Scripts de limpieza:
```bash
# Limpieza LOCAL completa (recomendado)
./scripts/environments/local/cleanup.sh

# Limpieza común (SOFT o HARD)
./scripts/environments/common/cleanup.sh

# Limpieza SOFT directa
./scripts/environments/common/cleanup-soft.sh

# Limpieza HARD directa (¡peligroso!)
./scripts/environments/common/cleanup-hard.sh
```

### Cuándo limpiar:
- **Regularmente**: Cada 1-2 semanas para liberar espacio
- **Problemas**: Cuando hay errores de dependencias o cache
- **Cambios mayores**: Antes de actualizar versiones importantes
- **Reset**: Para empezar desde cero (usar HARD con cuidado)

### Qué se limpia en LOCAL:
- 🧹 **SOFT**: node_modules, caches, archivos temporales, builds
- ☢️ **HARD**: TODO + configuraciones .env.local + datos MongoDB
- 🔧 **LOCAL específico**: Servicios, emuladores, configs locales

## 🔗 Enlaces Rápidos PARA EMULADORES

### Comandos útiles PARA EMULADORES:
```bash
# Iniciar solo web (host)
cd apps/web && yarn dev

# Iniciar mobile PARA EMULADOR
cd apps/mobile && expo start

# Iniciar Android Emulator
emulator -avd [NOMBRE_DEL_EMULADOR]

# Iniciar iOS Simulator (macOS)
open -a Simulator

# Iniciar MongoDB
brew services start mongodb-community

# Ver todos los servicios
./scripts/environments/local/start.sh
```

### URLs de acceso PARA EMULADORES:
- **Web (host)**: http://localhost:9001
- **Android Emulator API**: http://10.0.2.2:9001
- **iOS Simulator API**: http://localhost:9001
- **Expo Metro**: http://localhost:8081
- **MongoDB**: mongodb://localhost:27017

---

**Nota**: Este entorno es para desarrollo local. Los datos en MongoDB local son efímeros y se pierden al reiniciar el servicio.
