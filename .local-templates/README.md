# Templates - Local Development

## 📋 Descripción
Plantillas de configuración para desarrollo local.

## 📁 Estructura de Templates

```
scripts/environments/local/templates/
├── README.md                    # Esta documentación
├── .env.web.local              # Plantilla variables web app
├── .env.mobile.local           # Plantilla variables mobile app
└── mongod.conf.example         # Ejemplo configuración MongoDB
```

## 🌐 Web App Template

### Archivo: `.env.web.local`
```env
# ============================================
# WEB APP - LOCAL DEVELOPMENT ENVIRONMENT
# ============================================
# Plantilla para desarrollo local

INSTANCE=Retia-Local
NEXT_PUBLIC_INSTANCE=Retia-Local

# ============================================
# Database Configuration
# ============================================
MONGODB_URI=mongodb://localhost:27017/retia-local

# ============================================
# NextAuth Configuration
# ============================================
NEXTAUTH_URL=http://localhost:9001
NEXTAUTH_SECRET=[GENERAR_CON_openssl_rand_-base64_32]

# ============================================
# Authentication
# ============================================
AUTH_MODE=required
AUTH_PROVIDERS=email

# ============================================
# OAuth Configuration (Optional)
# ============================================
# GOOGLE_CLIENT_ID=[GOOGLE_CLIENT_ID_DEV]
# GOOGLE_CLIENT_SECRET=[GOOGLE_CLIENT_SECRET_DEV]

# ============================================
# Email Configuration (Optional)
# ============================================
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=[EMAIL_DEV@gmail.com]
# SMTP_PASSWORD=[APP_PASSWORD]
# SMTP_FROM=noreply@retia-dev.com

# ============================================
# Environment Configuration
# ============================================
NODE_ENV=development
LOG_LEVEL=debug

# ============================================
# Theme Configuration
# ============================================
NEXT_PUBLIC_PRIMARY_COLOR=3b82f6
NEXT_PUBLIC_SECONDARY_COLOR=10b981
NEXT_PUBLIC_BACKGROUND_COLOR=ffffff
NEXT_PUBLIC_TEXT_COLOR=1f2937
NEXT_PUBLIC_FONT_FAMILY=Manrope

# ============================================
# Development Flags
# ============================================
NEXT_PUBLIC_DEV_MODE=true
```

### Uso:
```bash
# Copiar plantilla
cp scripts/environments/local/templates/.env.web.local apps/web/.env.local

# Generar NEXTAUTH_SECRET
openssl rand -base64 32

# Editar con valores reales
nano apps/web/.env.local
```

## 📱 Mobile App Template

### Archivo: `.env.mobile.local`
```env
# ============================================
# MOBILE APP - LOCAL DEVELOPMENT
# ============================================
# Plantilla para desarrollo local

INSTANCE=Retia-Local

# ============================================
# Backend API Configuration
# ============================================
# IMPORTANTE: Para desarrollo en dispositivo físico, usa tu IP local
# Obtén tu IP: ipconfig getifaddr en0 (macOS) o hostname -I (Linux)
EXPO_PUBLIC_API_URL=http://[TU_IP_LOCAL]:9001

# ============================================
# Authentication
# ============================================
EXPO_PUBLIC_AUTH_MODE=required
EXPO_PUBLIC_AUTH_METHODS=email

# ============================================
# OAuth Configuration (Optional)
# ============================================
# EXPO_PUBLIC_GOOGLE_CLIENT_ID=[GOOGLE_CLIENT_ID_DEV]
# EXPO_PUBLIC_FACEBOOK_APP_ID=[FACEBOOK_APP_ID_DEV]

# ============================================
# App Configuration
# ============================================
EXPO_PUBLIC_INSTANCE=Retia-Local
EXPO_PUBLIC_MAIN_SCREEN_MESSAGE=¡Bienvenido a Retia Local!

# ============================================
# Design Configuration
# ============================================
EXPO_PUBLIC_PRIMARY_COLOR=3b82f6
EXPO_PUBLIC_SECONDARY_COLOR=10b981
EXPO_PUBLIC_BACKGROUND_COLOR=ffffff
EXPO_PUBLIC_TEXT_COLOR=1f2937
EXPO_PUBLIC_FONT_FAMILY=Manrope

# ============================================
# Internationalization
# ============================================
EXPO_PUBLIC_DEFAULT_LOCALE=es
EXPO_PUBLIC_LOCALES=es,en,pt

# ============================================
# Development Flags
# ============================================
EXPO_PUBLIC_DEV_MODE=true
```

### Uso:
```bash
# Copiar plantilla
cp scripts/environments/local/templates/.env.mobile.local apps/mobile/.env.local

# Obtener IP local (macOS)
ipconfig getifaddr en0

# Editar con IP real
nano apps/mobile/.env.local
```

## 🗄️ MongoDB Configuration Template

### Archivo: `mongod.conf.example`
```yaml
# MongoDB Configuration File
# Ubicación: /usr/local/etc/mongod.conf (macOS con Homebrew)

systemLog:
  destination: file
  path: /usr/local/var/log/mongodb/mongo.log
  logAppend: true

storage:
  dbPath: /usr/local/var/mongodb
  journal:
    enabled: true

net:
  port: 27017
  bindIp: 127.0.0.1

processManagement:
  fork: true  # Cambiar a false para systemd

security:
  authorization: disabled  # Para desarrollo local

# Operaciones
operationProfiling:
  slowOpThresholdMs: 100
  mode: slowOp

# Réplica set (opcional para desarrollo)
# replication:
#   replSetName: rs0
```

### Uso:
```bash
# Ver configuración actual
mongosh --eval "db.adminCommand({getCmdLineOpts: 1})"

# Copiar plantilla (si necesitas configuración personalizada)
sudo cp scripts/environments/local/templates/mongod.conf.example /usr/local/etc/mongod.conf

# Reiniciar MongoDB
brew services restart mongodb-community
```

## 🧪 Testing Templates

### Web App Testing (`.env.test`):
```env
# Testing environment
INSTANCE=Retia-Test
NEXT_PUBLIC_INSTANCE=Retia-Test
MONGODB_URI=mongodb://localhost:27017/retia-test
NEXTAUTH_URL=http://localhost:9001
NEXTAUTH_SECRET=test-secret-1234567890abcdef
AUTH_MODE=required
AUTH_PROVIDERS=email
NODE_ENV=test
LOG_LEVEL=error
NEXT_PUBLIC_TEST_MODE=true
```

### Mobile App Testing (`.env.test`):
```env
# Testing environment
INSTANCE=Retia-Test
EXPO_PUBLIC_API_URL=http://localhost:9001
EXPO_PUBLIC_AUTH_MODE=required
EXPO_PUBLIC_AUTH_METHODS=email
EXPO_PUBLIC_INSTANCE=Retia-Test
EXPO_PUBLIC_TEST_MODE=true
EXPO_PUBLIC_E2E_TESTING=true
```

## 🔧 Scripts de Ayuda

### Generar todas las plantillas:
```bash
# Desde la raíz del proyecto
./scripts/environments/local/setup.sh
```

### Generar plantillas específicas:
```bash
# Solo web
./scripts/environments/local/web/setup.sh

# Solo mobile
./scripts/environments/local/mobile/setup.sh

# Solo database
./scripts/environments/local/database/setup-mongodb.sh
```

### Comandos rápidos:
```bash
# Generar NEXTAUTH_SECRET
openssl rand -base64 32

# Obtener IP local (macOS)
ipconfig getifaddr en0

# Obtener IP local (Linux)
hostname -I | awk '{print $1}'

# Verificar MongoDB
mongosh --eval "db.version()"
```

## ⚠️ Consideraciones de Seguridad

### Variables sensibles:
- **NEXTAUTH_SECRET**: Generar nueva para cada entorno
- **GOOGLE_CLIENT_SECRET**: No versionar en repositorio
- **SMTP_PASSWORD**: No versionar en repositorio

### Buenas prácticas:
1. **Usar `.env.local`** para desarrollo (en `.gitignore`)
2. **No committear** archivos con secrets
3. **Usar diferentes secrets** para cada entorno
4. **Rotar secrets** periódicamente

### Para equipo de desarrollo:
1. **Compartir plantillas** sin valores reales
2. **Cada desarrollador** usa sus propias credenciales
3. **Documentar** proceso de configuración

## 🔄 Actualización de Templates

### Cuando cambie la configuración:
1. **Actualizar plantillas** en esta carpeta
2. **Notificar al equipo** de los cambios
3. **Actualizar scripts** de configuración
4. **Documentar** cambios en README

### Proceso de actualización:
```bash
# 1. Actualizar plantilla
nano scripts/environments/local/templates/.env.web.local

# 2. Probar con script
./scripts/environments/local/web/setup.sh

# 3. Documentar cambios
# 4. Commit cambios a plantillas
```

## 📞 Soporte

- **Documentación**: Este archivo
- **Scripts**: En directorio padre
- **Ejemplos**: Archivos en esta carpeta
- **Soporte**: Contactar con equipo de desarrollo

---

**Nota**: Las plantillas son puntos de partida. Cada desarrollador debe personalizar según su entorno local.
