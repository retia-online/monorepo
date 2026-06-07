# Develop / Staging Environment

## 📋 Descripción
Entorno de staging para pruebas de integración y preview en Vercel. Despliega la rama `develop` como Preview deployment.

## 🏗️ Estructura

```
scripts/environments/develop/
├── README.md        # Esta documentación
├── deploy.sh        # Deploy a Vercel (staging/preview)
└── test-db.sh       # Prueba conexión MongoDB + verificación de aislamiento
```

## 🚀 Uso

### Desplegar a staging
```bash
./scripts/environments/develop/deploy.sh
```

El script hace automáticamente:
1. Verifica sesión de Vercel como `retia-online`
2. Sincroniza variables de `apps/web/.env.develop` → Vercel (scope preview/develop)
3. Actualiza `CHANGELOG.md` y hace commit firmado como `info@retia.online`
4. Hace `git push` de la rama `develop` como `retia-online` (via GITHUB_TOKEN)
5. Vercel detecta el push vía webhook y lanza el deployment

### Probar conexión a base de datos
```bash
./scripts/environments/develop/test-db.sh
```
Verifica conexión a `app_develop` y confirma que el usuario **no tiene acceso** a `app_production`.

---

## 🔧 Configuración inicial

```bash
cp apps/web/.env.develop.template apps/web/.env.develop
# → Rellenar todos los valores
```

### Variables requeridas en `.env.develop`

```env
VERCEL_EMAIL=info@retia.online
VERCEL_USERNAME=retia-online

GITHUB_USERNAME=retia-online
GITHUB_EMAIL=info@retia.online
GITHUB_TOKEN=ghp_xxxxxxxxxxxx

ATLAS_PUBLIC_KEY=xxxxxxxx
ATLAS_PRIVATE_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ATLAS_PROJECT_ID=xxxxxxxxxxxxxxxxxxxxxxxx

MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/app_develop?appName=app

NEXTAUTH_URL=https://develop-monorepo.vercel.app/
NEXTAUTH_SECRET=...   # openssl rand -base64 32
```

---

## 🔌 Configuración de Odoo (si se usa como provider de auth)

El sistema puede autenticar usuarios contra Odoo usando `AUTH_PROVIDERS=odoo`.
Para eso necesita un **usuario técnico dedicado en Odoo** — no el admin master.

### Por qué NO usar el admin master
El usuario admin de Odoo tiene acceso a todo el ERP (contabilidad, inventario, ventas, RRHH...).
Si esas credenciales se exponen, un atacante tendría control total de Odoo.
El usuario técnico solo necesita permisos para gestionar usuarios — nada más.

### Cómo crear el usuario técnico en Odoo

1. **Odoo → Settings → Users & Companies → Users → New**

2. Rellenar:
   - **Name**: `Retia API Develop`
   - **Email / Login**: `api-develop@retia.online`
   - **Password**: (generar uno seguro)

3. En la pestaña **Access Rights**, asignar **solo**:
   - Sección **Technical** → `Access Rights` ✅
   - Todo lo demás: vacío ❌ (sin Ventas, Contabilidad, Inventario, etc.)

4. Guardar. Verificar el **UID** del usuario:
   - Al abrir el usuario la URL mostrará algo como `/web#id=15&model=res.users`
   - El número `15` es el UID

5. Actualizar `.env.develop`:
   ```env
   ODOO_URL=https://odoo.tu-dominio.com/
   ODOO_DB=nombre-de-la-base-odoo
   ODOO_ADMIN_UID=15
   ODOO_ADMIN_PASSWORD=password-del-usuario-tecnico
   ODOO_WEBHOOK_SECRET=un-secreto-para-webhooks
   ```

6. Activar el provider en:
   ```env
   AUTH_PROVIDERS=odoo   # o: email,odoo
   ```

> **Nota develop vs production**: se recomienda tener un usuario técnico diferente para cada entorno
> (`api-develop@retia.online` y `api-production@retia.online`) para mantener el aislamiento.

---

## 🔄 Flujo de trabajo

```
feature/xxx → develop → ./deploy.sh → Vercel Preview → probar → merge a main
```

---

## 🛠️ Solución de problemas

### "ReferenceError: global is not defined" en Vercel
Ya resuelto. El middleware tiene `export const runtime = 'nodejs'`.

### Error de conexión a MongoDB desde Vercel
La IP de Vercel no está en la whitelist de MongoDB Atlas.
Ejecuta `./scripts/environments/common/setup-mongodb.sh` — agrega tu IP automáticamente.
O en Atlas → Network Access → `0.0.0.0/0` (temporal).

### Dos deployments en Vercel por cada push
Ya resuelto. El script no ejecuta `vercel --yes`, solo hace el `git push`.

### El deployment aparece con usuario incorrecto en Vercel
Verifica que `GITHUB_TOKEN` pertenece a `retia-online` en `.env.develop`.
