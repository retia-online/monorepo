# Production Environment

## 📋 Descripción
Entorno de producción para usuarios finales. Despliega la rama `main` a Vercel como deployment de producción.

> ⚠️ **Este entorno maneja tráfico real y datos de producción. Siempre probar en `develop` antes de deployar aquí.**

## 🏗️ Estructura

```
scripts/environments/production/
├── README.md                    # Esta documentación
├── deploy.sh                    # Script de deploy a Vercel (producción)
├── simple-db-test.sh           # Prueba simple conexión MongoDB (mongosh)
└── quick-db-test.sh            # Prueba rápida conexión MongoDB (Node.js)
```

## 🚀 Uso

### Prerequisitos
Completa el archivo `apps/web/.env.production` con todos los valores reales:
```bash
# Verificar que todas las variables críticas están configuradas
grep -E "^(MONGODB_URI|NEXTAUTH_SECRET|NEXTAUTH_URL|GITHUB_TOKEN)=" apps/web/.env.production
```

### Flujo normal: develop → main → producción
```bash
# 1. Asegúrate de estar en main con los cambios de develop
git checkout main
git merge develop

# 2. Desplegar a producción
./scripts/environments/production/deploy.sh
```

### Probar conexión a base de datos
```bash
# Prueba rápida (mongosh)
./scripts/environments/production/simple-db-test.sh

# Prueba con Node.js
./scripts/environments/production/quick-db-test.sh
```

## 🔒 Diferencias clave vs develop

| | develop | production |
|---|---|---|
| Rama | `develop` | `main` |
| Vercel scope | `preview` (rama develop) | `production` |
| URL | `develop-monorepo.vercel.app` | Tu dominio real |
| LOG_LEVEL | `debug` | `error` |
| MONGODB_URI | Cluster de staging | Cluster de producción |
| NEXTAUTH_SECRET | Secret de staging | Secret **diferente** |

## ⚠️ Seguridad

- El script **bloquea la ejecución si no estás en rama `main`**
- El script **valida que MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL y GITHUB_TOKEN estén configurados**
- `GITHUB_TOKEN`, `VERCEL_EMAIL` y demás meta-variables **no se suben a Vercel** como variables de entorno
- `.env.production` está en `.gitignore` — nunca lo commitees

## 🛠️ Solución de Problemas

### "Este script solo puede ejecutarse desde la rama main"
```bash
git checkout main
git merge develop
./scripts/environments/production/deploy.sh
```

### "Faltan variables críticas"
Completa el archivo `apps/web/.env.production` con los valores de producción.

### Error de conexión a MongoDB
```bash
./scripts/environments/production/simple-db-test.sh
# Verifica que la IP de Vercel esté en la whitelist de MongoDB Atlas
```

### Rollback de emergencia
```bash
# Ver deployments recientes
vercel list

# Identificar el deployment estable anterior y promoverlo
vercel rollback [deployment-url]
```
