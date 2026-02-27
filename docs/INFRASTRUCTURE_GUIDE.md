# 🏗️ Guía de Infraestructura y Despliegue Multi-Empresa

> Este documento describe cómo usar este monorepo como **plantilla base** para crear aplicaciones web y móviles para diferentes empresas o clientes, manteniendo un núcleo compartido y actualizaciones centralizadas.

---

## 🗺️ Visión General de la Arquitectura

```
github.com/monorepo-vzla/monorepo  ← Repositorio BASE (este repo)
         │
         ├── packages/          ← Paquetes compartidos (SDK interno)
         │   ├── @monorepo-vzla/api   (DB, modelos, Odoo, email)
         │   ├── @monorepo-vzla/auth  (NextAuth, JWT móvil)
         │   ├── @monorepo-vzla/ui    (componentes React)
         │   └── @monorepo-vzla/configs (ESLint, Tailwind, TS)
         │
         ├── apps/web/          ← Frontend web (Next.js) — personalizable por empresa
         └── apps/mobile/       ← App móvil (Expo RN) — personalizable por empresa

         ↓  Se replica como:

github.com/tu-org/empresa-acme    ← Fork/clon para Empresa A
github.com/tu-org/empresa-delta   ← Fork/clon para Empresa B
```

### Principio fundamental

El **monorepo base** es el núcleo que evoluciona con nuevas funcionalidades genéricas (auth, UI, integraciones). Cada **empresa** tiene su propio repositorio que extiende el base con su lógica de negocio específica, sin tocar el núcleo.

---

## 📦 Estructura de Paquetes (SDK Interno)

| Paquete | Responsabilidad | Quién lo usa |
|---------|----------------|--------------|
| `@monorepo-vzla/api` | Conexión DB, modelos User/Account, OdooService, EmailService | Web backend, scripts |
| `@monorepo-vzla/auth` | Configuración NextAuth, JWT móvil, middleware de rutas | Web app |
| `@monorepo-vzla/ui` | Componentes React reutilizables (Button, Card, LoginForm, Navbar) | Web app |
| `@monorepo-vzla/configs` | Configuraciones base de ESLint, Tailwind, TypeScript | Todos los paquetes y apps |

---

## 🚀 Flujo 1: Crear un Proyecto para una Nueva Empresa

### Paso 1 — Hacer un Fork del repositorio base

Desde GitHub, haz un **Fork** del repositorio base:

```
github.com/monorepo-vzla/monorepo → Fork → github.com/tu-org/empresa-nombre
```

O si prefieres por terminal (crea un repo vacío en GitHub primero):

```bash
# Clona el base
git clone git@github.com:monorepo-vzla/monorepo.git empresa-nombre
cd empresa-nombre

# Cambia el remote origin al nuevo repo de la empresa
git remote rename origin upstream
git remote add origin git@github.com:tu-org/empresa-nombre.git

# Sube el código inicial a la nueva rama
git push -u origin main
git push -u origin develop
```

### Paso 2 — Instalar dependencias

```bash
yarn install
```

### Paso 3 — Construir los paquetes internos

```bash
yarn workspace @monorepo-vzla/api build
yarn workspace @monorepo-vzla/auth build
yarn workspace @monorepo-vzla/ui build
```

### Paso 4 — Configurar variables de entorno

Crea los archivos de entorno de la empresa (los archivos `.env.local` **nunca** van al repositorio):

```bash
# Para el backend web
cp apps/web/.env.template apps/web/.env.local

# Para la app móvil
cp apps/mobile/.env.template apps/mobile/.env.local
```

Luego edita cada archivo con los valores de la empresa:

**`apps/web/.env.local`** — Variables críticas a configurar:
```bash
INSTANCE=empresa-nombre          # Identificador de la empresa
MONGODB_URI=mongodb://...        # Base de datos de esta empresa (diferente por empresa)
NEXTAUTH_URL=https://app.empresa.com
NEXTAUTH_SECRET=<genera con: openssl rand -base64 32>
AUTH_PROVIDERS=odoo              # o email, google, etc.
ODOO_URL=https://odoo.empresa.com
ODOO_DB=nombre_bd_odoo
ODOO_ADMIN_UID=2
ODOO_ADMIN_PASSWORD=...

# Diseño
NEXT_PUBLIC_PRIMARY_COLOR=#FF5733    # Color primario de la empresa
NEXT_PUBLIC_FONT_FAMILY=Inter
```

**`apps/mobile/.env.local`** — Variables críticas a configurar:
```bash
EXPO_PUBLIC_API_URL=https://app.empresa.com  # URL del backend en producción
EXPO_PUBLIC_AUTH_METHODS=odoo
EXPO_PUBLIC_INSTANCE=empresa-nombre
EXPO_PUBLIC_ODOO_URL=https://odoo.empresa.com
EXPO_PUBLIC_PRIMARY_COLOR=#FF5733
```

### Paso 5 — Sincronizar usuarios iniciales desde Odoo

```bash
yarn sync-odoo-users
```

Este comando importa todos los usuarios activos de Odoo a la base de datos local, asignando roles (ADMIN/USER) según los grupos de Odoo. **No es necesario crear ningún usuario "inicial" manualmente.**

### Paso 6 — Verificar que todo funciona

```bash
yarn dev:all   # Lanza web + iOS + Android en pestañas separadas
```

---

## 🔧 Flujo 2: Agregar Funcionalidades Específicas de una Empresa

Cada empresa puede tener funcionalidades propias sin afectar al base. La estrategia es:

### Dónde añadir código de una empresa

```
apps/
├── web/src/app/
│   ├── (base)              ← NO TOCAR: login, register, profile, admin genérico
│   └── empresa/            ← ✅ AQUÍ: rutas y páginas propias de la empresa
│       ├── dashboard/
│       ├── inventario/
│       └── reportes/
│
└── mobile/src/
    ├── screens/            ← (base): Login, Home, Profile — no tocar sin razón
    └── screens/empresa/    ← ✅ AQUÍ: pantallas propias de la empresa
        ├── DashboardScreen.tsx
        └── InventarioScreen.tsx
```

### Regla de oro

> **Si el cambio beneficia a TODAS las empresas → va al mono repo base.**
> **Si el cambio es específico de UNA empresa → va en el repo de esa empresa.**

---

## 🔄 Flujo 3: Recibir Actualizaciones del Repositorio Base

Cuando el monorepo base recibe mejoras (nuevas funciones de auth, fixes de seguridad, nuevos componentes de UI), se integran al proyecto de cada empresa así:

```bash
# Dentro del repo de la empresa
git fetch upstream
git merge upstream/develop

# Resuelve conflictos si los hay, luego:
git push origin develop
```

> **⚠️ Importante**: Si personalizaste archivos del core (ej: `auth-config.ts`), habrá conflictos. Resuélvelos manteniendo la lógica de negocio de la empresa y adoptando las mejoras del base.

---

## 🌿 Estrategia de Ramas por Empresa

```
main          ← Producción (solo merged desde develop)
develop       ← Integración y QA
feature/xxx   ← Funcionalidades nuevas
hotfix/xxx    ← Parches urgentes de producción
```

### Flujo de trabajo diario

```bash
# Nueva funcionalidad
git checkout develop
git pull origin develop
git checkout -b feature/nombre-funcionalidad

# ... desarrollas ...

git add .
git commit -m "feat: descripción de la funcionalidad"
git push origin feature/nombre-funcionalidad

# Pull Request en GitHub: feature/xxx → develop
```

---

## 🏭 Flujo 4: Entorno de Desarrollo Limpio (Cada Vez)

```bash
# 1. Limpiar base de datos local
yarn clean-db:force

# 2. Sincronizar usuarios desde Odoo (fuente de verdad)
yarn sync-odoo-users

# 3. Iniciar todo el entorno
yarn dev:all
```

O manualmente en terminales separadas:
```bash
# Terminal 1: Backend web
yarn dev

# Terminal 2: App iOS
yarn workspace @monorepo/mobile ios

# Terminal 3: App Android (emulador debe estar abierto)
yarn workspace @monorepo/mobile android
```

---

## 🖥️ Flujo 5: Despliegue en Producción

### Backend (Web — Next.js)

**Opción A: Vercel** (recomendado)
1. Conecta el repo de la empresa a Vercel
2. Configura las variables de entorno en el panel de Vercel (las mismas del `.env.local`), usando los valores de producción
3. Vercel despliega automáticamente en cada push a `main`

**Opción B: Servidor propio (VPS)**
```bash
# En el servidor
git clone git@github.com:tu-org/empresa-nombre.git
cd empresa-nombre
yarn install
yarn workspace @monorepo-vzla/api build
yarn workspace @monorepo-vzla/auth build
yarn workspace @monorepo/web build
yarn workspace @monorepo/web start   # o usa PM2
```

### App Móvil (Expo)

**Desarrollo / QA con Expo Go:**
- Solo actualizar `EXPO_PUBLIC_API_URL` al dominio de producción.
- El usuario instala Expo Go y escanea el QR.

**Producción (APK / IPA):**
```bash
# Instalar EAS CLI
npm install -g eas-cli
eas login

# Configurar el proyecto (solo primera vez)
eas build:configure

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

> Requiere cuenta en [expo.dev](https://expo.dev) y (para iOS) cuenta de Apple Developer.

---

## 🔐 Gestión de Secretos

**Regla estricta**: Ningún archivo `.env.local` ni `.env.prod` debe ir al repositorio de Git.

### En desarrollo
- Cada desarrollador tiene su propio `.env.local` en sus carpetas locales
- Los `.env.template` sí van al repo, con valores de ejemplo (sin datos reales)

### En producción
- **Vercel / Railway / Render**: Panel de variables de entorno en la plataforma
- **Servidor propio**: Archivo `.env.prod` en el servidor, nunca en Git
- **Secretos de GitHub Actions**: Configurar `ODOO_ADMIN_PASSWORD`, `MONGODB_URI_PROD`, etc. en `Settings → Secrets` del repo de la empresa

---

## 📋 Checklist: Nueva Empresa en 30 Minutos

```
[ ] 1. Fork/clon del monorepo base
[ ] 2. Cambiar remote origin al repo de la empresa
[ ] 3. yarn install
[ ] 4. Builds de paquetes: api, auth, ui
[ ] 5. Crear apps/web/.env.local con datos de la empresa
[ ] 6. Crear apps/mobile/.env.local con IP/URL del backend
[ ] 7. Configurar Odoo: ODOO_URL, ODOO_DB, ODOO_ADMIN_UID, ODOO_ADMIN_PASSWORD
[ ] 8. yarn sync-odoo-users — verificar que importa usuarios
[ ] 9. yarn dev — verificar que el backend arranca sin errores
[ ] 10. yarn workspace @monorepo/mobile ios — verificar login en móvil
[ ] 11. git commit + git push al repo de la empresa
[ ] 12. Configurar despliegue en Vercel / servidor
```

---

## 🆚 ¿Qué Cambia y Qué No Entre Empresas?

| Elemento | ¿Cambia por empresa? | Dónde se configura |
|----------|---------------------|-------------------|
| Base de datos (MongoDB) | ✅ Sí | `MONGODB_URI` en `.env.local` |
| Instancia de Odoo | ✅ Sí | `ODOO_URL`, `ODOO_DB` en `.env.local` |
| Colores y fuentes | ✅ Sí | `NEXT_PUBLIC_PRIMARY_COLOR`, etc. |
| Usuarios y roles | ✅ Sí | Se sincroniza desde Odoo |
| Modos de auth | ✅ Sí | `AUTH_PROVIDERS`, `AUTH_MODE` |
| Funcionalidades de negocio | ✅ Sí | Nuevas rutas/pantallas en `apps/` |
| Paquetes SDK (api, auth, ui) | ❌ No (compartidos) | Solo evolucionan en el base |
| Login / Register / Profile | ❌ No (base genérico) | Solo se personaliza con env vars |
| Infraestructura de auth | ❌ No | Solo evoluciona en el base |

---

## 📁 Árbol de Archivos Clave

```
monorepo/
├── apps/
│   ├── web/
│   │   ├── .env.local              ← ⚠️ NO commitear (por empresa)
│   │   ├── src/app/
│   │   │   ├── login/              ← Base: no modificar
│   │   │   ├── register/           ← Base: no modificar
│   │   │   ├── api/                ← Base: no modificar (a menos que sea necesario)
│   │   │   └── [empresa]/          ← ✅ Aquí van las páginas de la empresa
│   │   └── next.config.ts
│   │
│   └── mobile/
│       ├── .env.local              ← ⚠️ NO commitear (por empresa)
│       ├── src/screens/             ← Base: Login, Home, Profile
│       └── src/screens/[empresa]/  ← ✅ Aquí van las pantallas de la empresa
│
├── packages/              ← SDK compartido — evoluciona en el base
│   ├── api/
│   ├── auth/
│   ├── ui/
│   └── configs/
│
├── scripts/
│   ├── database/
│   │   ├── clean-database.ts       ← Limpia la DB local
│   │   └── sync-odoo-users.ts      ← Importa usuarios desde Odoo
│   └── dev-all.sh                  ← Arranca todo el entorno
│
└── docs/
    ├── INFRASTRUCTURE_GUIDE.md     ← Este archivo
    └── DEVELOPMENT_SETUP.md        ← Setup del entorno de desarrollo
```
