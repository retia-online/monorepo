# Staging Environment

## 📋 Descripción
Entorno de staging para pruebas de integración y preview en Vercel. Este entorno simula producción pero con datos de prueba.

## 🏗️ Estructura

```
scripts/environments/develop/
├── README.md                    # Esta documentación
├── deploy.sh                    # Script de deploy a Vercel (staging)
├── test-db-connection.sh       # Prueba completa conexión MongoDB (Node.js)
├── quick-db-test.sh            # Prueba rápida conexión MongoDB (Node.js)
├── simple-db-test.sh           # Prueba simple conexión MongoDB (mongosh)
├── clear-vercel-env.sh         # Limpiar variables de Vercel
└── mobile/                      # Configuración móvil (si existe)
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

### Pruebas de conexión a base de datos:
```bash
# Prueba rápida de conexión
./scripts/environments/develop/quick-db-test.sh

# Prueba completa con diagnóstico
./scripts/environments/develop/test-db-connection.sh
```

### Pruebas básicas:
1. **Conexión a MongoDB** → Verificar whitelist de IPs
2. **Registro primer usuario** → Debe obtener rol ADMIN
3. **Login con OAuth** (Google/Email)
4. **Endpoints API** (health, auth, users)
5. **Mobile app** conectando a staging

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

### Problemas comunes de conexión a MongoDB:

#### ❌ Error: "Could not connect to any servers in your MongoDB Atlas cluster"
**Causas:**
1. IP no está en la whitelist de MongoDB Atlas
2. Credenciales incorrectas en MONGODB_URI
3. Problemas de red/firewall
4. Cluster no disponible o pausado

**Soluciones:**
1. **Whitelist de IPs:**
   ```bash
   # Ver tu IP actual
   ./scripts/environments/develop/test-db-connection.sh
   
   # Agregar a MongoDB Atlas:
   # 1. Ir a https://cloud.mongodb.com
   # 2. Network Access → Add IP Address
   # 3. Agregar tu IP actual o 0.0.0.0/0 (temporal)
   ```

2. **Verificar MONGODB_URI:**
   ```bash
   # Ver la URI actual
   grep MONGODB_URI apps/web/.env.develop
   
   # Formato correcto:
   # mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

3. **Probar desde diferentes ubicaciones:**
   ```bash
   # Probar con Node.js localmente
   ./scripts/environments/develop/quick-db-test.sh
   
   # Si funciona localmente pero no en Vercel:
   # Agregar IPs de Vercel a la whitelist
   ```

#### ❌ Error: "ReferenceError: global is not defined"
**Causa:** Código usando `global` en Edge runtime
**Solución:** Scripts ya están arreglados para manejar ambos runtimes

### Otros problemas:
Ver archivos individuales en cada subdirectorio para troubleshooting específico.

## 📞 Soporte

- **Documentación**: Esta carpeta y subcarpetas
- **Scripts**: `./scripts/environments/staging/`
- **Plantillas**: `./scripts/environments/staging/templates/`
- **Logs**: Vercel Dashboard → Deployments → Logs

---

**Nota**: Este entorno es para pruebas de integración. Los datos pueden ser borrados en cualquier momento. No usar para datos de producción reales.