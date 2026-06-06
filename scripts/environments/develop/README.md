# Staging Environment

## 📋 Descripción
Entorno de staging para pruebas de integración y preview en Vercel. Este entorno simula producción pero con datos de prueba.

## 🏗️ Estructura

```
scripts/environments/staging/
├── README.md                    # Esta documentación
├── setup.sh                     # Script de configuración inicial
├── deploy.sh                    # Script de deploy a Vercel
├── mobile/                      # Configuración móvil
│   ├── build-apk.sh            # Generar APK de staging
│   ├── setup.sh                 # Configurar mobile para staging
│   └── README.md               # Documentación móvil
├── web/                         # Configuración web
│   ├── setup.sh                 # Configurar web para staging
│   ├── deploy.sh               # Deploy web a Vercel
│   └── README.md               # Documentación web
├── database/                    # Configuración base de datos
│   ├── setup-mongodb.sh        # Configurar MongoDB Atlas
│   └── README.md               # Documentación MongoDB
├── oauth/                       # Configuración OAuth
│   ├── setup-google.sh         # Configurar Google OAuth
│   └── README.md               # Documentación OAuth
└── templates/                   # Plantillas
    ├── .env.web.staging        # Plantilla variables web
    ├── .env.mobile.staging     # Plantilla variables móvil
    └── vercel-staging.json     # Plantilla configuración Vercel
```

## 🚀 Inicio Rápido

### 1. Configuración inicial
```bash
# Desde la raíz del proyecto
./scripts/environments/staging/setup.sh
```

### 2. Configurar web app
```bash
./scripts/environments/staging/web/setup.sh
```

### 3. Desplegar a Vercel
```bash
./scripts/environments/staging/deploy.sh
```

### 4. Configurar mobile app
```bash
./scripts/environments/staging/mobile/setup.sh
```

### 5. Generar APK para testing
```bash
./scripts/environments/staging/mobile/build-apk.sh
```

## 🔧 Requisitos Previos

1. **Cuenta Vercel**: https://vercel.com/signup
2. **Cuenta MongoDB Atlas**: https://cloud.mongodb.com
3. **Cuenta Google Cloud** (para OAuth): https://console.cloud.google.com
4. **Cuenta Expo** (para mobile): https://expo.dev/signup

## 📊 Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dispositivo   │    │     Vercel       │    │   MongoDB Atlas │
│      Móvil      │◄──►│   (Staging)     │◄──►│    (Staging)    │
│                 │    │  Next.js API     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   Expo Go / APK          https://[app]-[hash]    Cluster M0 Free
                          .vercel.app
```

## 🔗 URLs

- **Web App**: `https://[app-name]-[hash].vercel.app`
- **API**: `https://[app-name]-[hash].vercel.app/api/...`
- **Expo Builds**: `https://expo.dev/accounts/[user]/projects/[project]`
- **MongoDB Atlas**: `https://cloud.mongodb.com/v2/[project-id]`

## 🧪 Pruebas Recomendadas

### Pruebas básicas:
1. **Registro primer usuario** → Debe obtener rol ADMIN
2. **Login con OAuth** (Google/Email)
3. **Endpoints API** (health, auth, users)
4. **Mobile app** conectando a staging

### Pruebas avanzadas:
1. **Carga de datos** (múltiples usuarios)
2. **Pruebas de rendimiento**
3. **Pruebas de seguridad**
4. **Pruebas móviles** en diferentes dispositivos

## ⚠️ Consideraciones de Seguridad

1. **Credenciales separadas**: No usar credenciales de producción
2. **Datos de prueba**: No usar datos reales de usuarios
3. **Acceso limitado**: Considerar restringir si contiene datos sensibles
4. **Monitoreo**: Configurar alertas para uso anormal
5. **Backups**: Configurar backups automáticos si se usan datos importantes

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

### Staging → Producción:
```bash
# 1. Merge staging a main
git checkout main
git merge staging

# 2. Desplegar a producción
./scripts/environments/production/deploy.sh
```

## 🛠️ Solución de Problemas

Ver archivos individuales en cada subdirectorio para troubleshooting específico.

## 📞 Soporte

- **Documentación**: Esta carpeta y subcarpetas
- **Scripts**: `./scripts/environments/staging/`
- **Plantillas**: `./scripts/environments/staging/templates/`
- **Logs**: Vercel Dashboard → Deployments → Logs

---

**Nota**: Este entorno es para pruebas de integración. Los datos pueden ser borrados en cualquier momento. No usar para datos de producción reales.