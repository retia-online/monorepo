# Production Environment

## 📋 Descripción
Entorno de producción para usuarios finales. Despliega la rama `main` a Vercel como deployment de producción.

> ⚠️ **Este entorno maneja tráfico real y datos de producción. Siempre probar en `develop` antes de deployar aquí.**

## 🏗️ Estructura

```
scripts/environments/production/
├── README.md     # Esta documentación
├── deploy.sh     # Deploy a Vercel (producción)
└── test-db.sh    # Prueba conexión MongoDB + verificación de aislamiento
```

## 🚀 Uso

### Prerequisitos
```bash
cp apps/web/.env.production.template apps/web/.env.production
# → Rellenar todos los valores reales
```

### Flujo normal: develop → main → producción
```bash
# 1. Mergear develop a main
git checkout main
git merge develop

# 2. Desplegar a producción
./scripts/environments/production/deploy.sh
```

El script:
1. Bloquea si no estás en rama `main`
2. Valida que las variables críticas estén configuradas
3. Sincroniza variables de `.env.production` → Vercel (scope production)
4. Actualiza `CHANGELOG.md` y hace commit firmado como `info@retia.online`
5. Hace `git push` de `main` como `retia-online` (via GITHUB_TOKEN)
6. Vercel detecta el push y lanza el deployment de producción

### Probar conexión a base de datos
```bash
./scripts/environments/production/test-db.sh
```
Verifica conexión a `app_production` y confirma que el usuario **no tiene acceso** a `app_develop`.

---

## 🔧 Variables requeridas en `.env.production`

```env
VERCEL_EMAIL=info@retia.online
VERCEL_USERNAME=retia-online

GITHUB_USERNAME=retia-online
GITHUB_EMAIL=info@retia.online
GITHUB_TOKEN=ghp_xxxxxxxxxxxx

ATLAS_PUBLIC_KEY=xxxxxxxx
ATLAS_PRIVATE_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ATLAS_PROJECT_ID=xxxxxxxxxxxxxxxxxxxxxxxx

MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/app_production?appName=app

NEXTAUTH_URL=https://retia.online/
NEXTAUTH_SECRET=...   # openssl rand -base64 32  (DIFERENTE al de develop)
```

---

## 🔌 Configuración de Odoo (si se usa como provider de auth)

El sistema puede autenticar usuarios contra Odoo usando `AUTH_PROVIDERS=odoo`.
Para eso necesita un **usuario técnico dedicado en Odoo** — no el admin master.

### Por qué NO usar el admin master
El usuario admin de Odoo tiene acceso total al ERP (contabilidad, inventario, ventas, RRHH...).
Si esas credenciales se exponen, un atacante tendría control total de Odoo.
El usuario técnico solo necesita permisos para gestionar usuarios — nada más.

### Cómo crear el usuario técnico en Odoo

1. **Odoo → Settings → Users & Companies → Users → New**

2. Rellenar:
   - **Name**: `Retia API Production`
   - **Email / Login**: `api-production@retia.online`
   - **Password**: (generar uno seguro — diferente al de develop)

3. En la pestaña **Access Rights**, asignar **solo**:
   - Sección **Technical** → `Access Rights` ✅
   - Todo lo demás: vacío ❌ (sin Ventas, Contabilidad, Inventario, etc.)

4. Guardar. Verificar el **UID** del usuario:
   - Al abrir el usuario la URL mostrará algo como `/web#id=22&model=res.users`
   - El número `22` es el UID

5. Actualizar `.env.production`:
   ```env
   ODOO_URL=https://odoo.tu-dominio.com/
   ODOO_DB=nombre-de-la-base-odoo
   ODOO_ADMIN_UID=22
   ODOO_ADMIN_PASSWORD=password-del-usuario-tecnico-produccion
   ODOO_WEBHOOK_SECRET=un-secreto-diferente-al-de-develop
   ```

6. Activar el provider en:
   ```env
   AUTH_PROVIDERS=odoo   # o: email,odoo
   ```

> **Principio de mínimo privilegio**: el usuario técnico de producción solo puede
> crear/modificar usuarios en Odoo. No tiene acceso a ningún otro módulo del ERP.

---

## 🔒 Diferencias clave vs develop

| | develop | production |
|---|---|---|
| Rama git | `develop` | `main` |
| Vercel scope | `preview` | `production` |
| URL | `develop-monorepo.vercel.app` | `retia.online` |
| LOG_LEVEL | `debug` | `error` |
| MONGODB_URI | `app_develop` | `app_production` |
| NEXTAUTH_SECRET | Secret de staging | Secret **diferente** |
| Odoo usuario técnico | `api-develop@retia.online` | `api-production@retia.online` |

---

## 🛠️ Solución de problemas

### "Este script solo puede ejecutarse desde la rama main"
```bash
git checkout main && git merge develop
./scripts/environments/production/deploy.sh
```

### "Faltan variables críticas"
Completa `.env.production`. Verifica con:
```bash
grep -E "^(MONGODB_URI|NEXTAUTH_SECRET|NEXTAUTH_URL|GITHUB_TOKEN)=" apps/web/.env.production
```

### Error de conexión a MongoDB
```bash
./scripts/environments/production/test-db.sh
# Si falla: ejecuta ./scripts/environments/common/setup-mongodb.sh
```

### Rollback de emergencia
```bash
vercel list                          # ver deployments recientes
vercel rollback [deployment-url]     # promover el deployment estable anterior
```
