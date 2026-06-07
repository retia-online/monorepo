# Develop / Staging Environment

## 📋 Descripción
Entorno de staging para pruebas de integración y preview en Vercel. Despliega la rama `develop` como Preview deployment.

## 🏗️ Estructura

```
scripts/environments/develop/
├── README.md                    # Esta documentación
├── deploy.sh                    # Script de deploy a Vercel (staging/preview)
├── simple-db-test.sh           # Prueba simple conexión MongoDB (mongosh)
├── quick-db-test.sh            # Prueba rápida conexión MongoDB (Node.js)
├── test-db-connection.sh       # Prueba completa con diagnóstico
└── clear-vercel-env.sh         # Limpiar variables de entorno en Vercel
```

## 🚀 Uso

### Desplegar a staging
```bash
./scripts/environments/develop/deploy.sh
```

El script hace automáticamente:
1. Verifica sesión de Vercel como `retia-online`
2. Sincroniza todas las variables de `apps/web/.env.develop` → Vercel (scope preview/develop)
3. Actualiza `CHANGELOG.md` y hace commit firmado como `info@retia.online`
4. Hace `git push` de la rama `develop` como `retia-online` (via GITHUB_TOKEN)
5. Vercel detecta el push y lanza el deployment automáticamente

### Probar conexión a base de datos
```bash
# Prueba rápida (mongosh)
./scripts/environments/develop/simple-db-test.sh

# Prueba con Node.js
./scripts/environments/develop/quick-db-test.sh

# Prueba completa con diagnóstico
./scripts/environments/develop/test-db-connection.sh
```

## 🔧 Configuración requerida

Copia el template y rellena los valores:
```bash
cp apps/web/.env.develop.template apps/web/.env.develop
```

El archivo `apps/web/.env.develop` debe contener:

```env
# Vercel
VERCEL_EMAIL=info@retia.online
VERCEL_USERNAME=retia-online

# GitHub (para push con usuario correcto)
GITHUB_USERNAME=retia-online
GITHUB_EMAIL=info@retia.online
GITHUB_TOKEN=ghp_xxxxxxxxxxxx   ← token de retia-online

# MongoDB Atlas API (para setup-mongodb.sh)
ATLAS_PUBLIC_KEY=xxxxxxxx
ATLAS_PRIVATE_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ATLAS_PROJECT_ID=xxxxxxxxxxxxxxxxxxxxxxxx

# Base de datos
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/app_develop?appName=app

# NextAuth
NEXTAUTH_URL=https://develop-monorepo.vercel.app/
NEXTAUTH_SECRET=...   ← openssl rand -base64 32
```

## 🔄 Flujo de trabajo

```
feature/xxx → develop → ./deploy.sh → Vercel Preview → probar → merge a main
```

## 🛠️ Solución de problemas

### "ReferenceError: global is not defined" en Vercel
Ya resuelto. El middleware tiene `export const runtime = 'nodejs'` para forzar Node.js runtime.

### Error de conexión a MongoDB desde Vercel
La IP de Vercel no está en la whitelist de MongoDB Atlas.
- Ve a MongoDB Atlas → Network Access → Add IP Address → `0.0.0.0/0` (temporal) o IPs específicas de Vercel.

### Dos deployments en Vercel por cada push
Ya resuelto. El script ya no ejecuta `vercel --yes`, solo hace el `git push` y deja que el webhook de Vercel dispare el deployment.

### El deployment aparece con usuario incorrecto en Vercel
Verifica que `GITHUB_TOKEN` pertenece a la cuenta `retia-online` en `apps/web/.env.develop`.
