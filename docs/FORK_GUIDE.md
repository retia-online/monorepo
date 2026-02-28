# Guía de Forks del Monorepo

Este documento es la referencia principal para cualquier equipo que tome un fork de este monorepo
para crear una nueva aplicación. Define con precisión qué archivos **deben modificarse**, cuáles
**pueden modificarse opcionalmente** y cuáles **nunca deben tocarse**.

> **Regla de oro:** Si un cambio pertenece a la lógica o infraestructura compartida, va al
> monorepo origen (`monorepo-vzla`). Si es específico de tu aplicación, va en tu fork.

---

## 1. Arquitectura del Monorepo

```
monorepo/
├── apps/
│   ├── web/          → Aplicación Next.js (frontend + API routes)
│   └── mobile/       → Aplicación Expo React Native
├── packages/         → SDKs compartidos (publicados en GitHub Packages)
│   ├── api/          → Conexión a BD, modelos, servicios
│   ├── auth/         → Configuración NextAuth, middleware
│   ├── ui/           → Componentes UI reutilizables
│   ├── configs/      → ESLint, TypeScript, Tailwind presets
│   ├── database/     → Modelos de base de datos
│   ├── types/        → TypeScript types compartidos
│   └── utils/        → Utilidades (email, validation)
├── assets/           → Assets de branding compartidos
├── docs/             → Documentación
├── scripts/          → Scripts de desarrollo y CI
└── .github/
    └── workflows/    → GitHub Actions
```

---

## 2. Archivos que SIEMPRE debes modificar en tu fork

Estos son los archivos de configuración específicos de cada aplicación.
**Son los únicos que deben cambiar entre un fork y otro.**

### 2.1 Variables de Entorno (OBLIGATORIO)

| Archivo | Propósito | Qué cambiar |
|---|---|---|
| `.env.development` | Variables locales (NO commitear) | Todos los valores |
| `.env.prod` | Variables de producción (NO commitear) | Todos los valores |
| `apps/web/.env.development` | Variables locales de la web | Todos los valores |
| `apps/web/.env.template` | Plantilla documentada | Actualizar ejemplos si añades vars |
| `apps/mobile/.env.development` | Variables locales del móvil | Todos los valores |
| `apps/mobile/.env.template` | Plantilla documentada | Actualizar ejemplos si añades vars |

**Variables clave a personalizar:**

```env
# Identidad de la aplicación
INSTANCE=NombreDeTuEmpresa          # Nombre que aparece en la UI y sistema

# Base de datos (CRÍTICO)
MONGODB_URI=mongodb://...          # Tu propia base de datos

# Autenticación
NEXTAUTH_SECRET=...                # Generar: openssl rand -base64 32
NEXTAUTH_URL=https://tu-dominio.com
AUTH_MODE=required                 # required | disabled | optional | whitelist | invite-only
AUTH_PROVIDERS=email               # email | google | facebook

# Diseño/Marca
NEXT_PUBLIC_PRIMARY_COLOR=#xxxxxx
NEXT_PUBLIC_SECONDARY_COLOR=#xxxxxx
NEXT_PUBLIC_FONT_FAMILY=Inter

# OAuth (si lo usas)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 2.2 Branding e Identidad Visual (OBLIGATORIO)

Reemplaza estos archivos con los assets de tu aplicación:

| Archivo | Descripción |
|---|---|
| `assets/images/branding/logo-rectangular.svg` | Logo horizontal |
| `assets/images/branding/logo-square.svg` | Logo cuadrado / ícono |
| `assets/images/branding/favicon.svg` | Favicon web |
| `assets/images/branding/favicon-32x32.png` | Favicon PNG |
| `assets/images/branding/avatar.svg` | Avatar por defecto de usuario |
| `apps/web/public/assets/images/branding/` | Copias para Next.js (mismo contenido) |
| `apps/mobile/assets/images/branding/` | Copias para Expo (mismo contenido) |
| `apps/web/public/favicon.svg` | Favicon raíz de Next.js |

> **Importante:** Los 3 directorios de assets deben mantenerse sincronizados.
> El script `scripts/sync-assets.js` hace esto automáticamente.

### 2.3 Configuración de la App Móvil (OBLIGATORIO)

| Archivo | Qué cambiar |
|---|---|
| `apps/mobile/app.json` | `name`, `slug`, `bundleIdentifier`, `package`, íconos, colores de splash |

```json
{
  "expo": {
    "name": "Nombre de Tu App",
    "slug": "tu-app-slug",
    "ios": { "bundleIdentifier": "com.tuempresa.tuapp" },
    "android": { "package": "com.tuempresa.tuapp" }
  }
}
```

### 2.4 Página Principal de la Web (RECOMENDADO)

| Archivo | Descripción |
|---|---|
| `apps/web/src/app/page.tsx` | Home page — personaliza el contenido de bienvenida |
| `apps/web/src/app/layout.tsx` | Title, metadatos SEO, fuentes |

Estos archivos tienen contenido placeholder genérico. Cada fork debe adaptarlos
a la propuesta de valor de su aplicación.

---

## 3. Archivos que PUEDES modificar en tu fork (opcional)

Estos archivos tienen implementaciones por defecto funcionales, pero puedes
extenderlos o sobreescribirlos si tu aplicación lo requiere.

### 3.1 Rutas y Protección

| Archivo | Cuándo modificarlo |
|---|---|
| `apps/web/middleware.ts` | Si necesitas rutas públicas/privadas diferentes |
| `apps/web/src/lib/route-protection.ts` | Si necesitas lógica de autorización personalizada |
| `apps/web/src/lib/auth.ts` | Si necesitas callbacks de NextAuth personalizados |

### 3.2 Pantallas Móviles

| Archivo | Cuándo modificarlo |
|---|---|
| `apps/mobile/src/screens/HomeScreen.tsx` | Pantalla principal de tu app |
| `apps/mobile/src/screens/ProfileScreen.tsx` | Si añades campos de perfil personalizados |
| `apps/mobile/App.tsx` | Si cambias la estructura de navegación raíz |

### 3.3 Componentes Web

| Archivo | Cuándo modificarlo |
|---|---|
| `apps/web/src/components/Navbar.tsx` | Si necesitas ítems de navegación adicionales |
| `apps/web/src/app/globals.css` | Estilos globales / tokens CSS personalizados |
| `apps/web/tailwind.config.js` | Extensiones del tema Tailwind |

### 3.4 Nuevas Páginas y Features

Todo lo que vayas a agregar como negocio (catálogo, pedidos, dashboard, etc.)
va aquí. Son adiciones, no modificaciones:

```
apps/web/src/app/           → Añade nuevas páginas Next.js
apps/web/src/app/api/       → Añade nuevos endpoints API  
apps/mobile/src/screens/    → Añade nuevas pantallas
apps/mobile/src/components/ → Añade nuevos componentes móviles
```

---

## 4. Archivos que NUNCA debes modificar en tu fork

> ⛔ Estos archivos forman el núcleo del monorepo. Si necesitas cambiarlos,
> el cambio debe ir al **monorepo origen** (`monorepo-vzla`) y sincronizarse
> a todos los forks mediante el espejo.

### 4.1 Paquetes SDK (`packages/`)

**Nunca toques estos archivos en tu fork:**

```
packages/api/src/**          → Lógica de conexión y modelos de BD
packages/auth/src/**         → Configuración NextAuth y middleware
packages/ui/src/**           → Componentes UI del design system
packages/configs/**          → Configuraciones de ESLint, TypeScript, Tailwind
packages/database/src/**     → Modelos de base de datos
packages/types/src/**        → TypeScript types compartidos
packages/utils/src/**        → Utilidades compartidas
```

**¿Por qué?** Los SDKs se publican como paquetes npm en GitHub Package Registry.
Si los modificas en tu fork, tu fork diverge del SDK y pierde las actualizaciones futuras.
Si necesitas un cambio en los SDKs, propón el cambio al monorepo origen.

### 4.2 CI/CD y Workflows

```
.github/workflows/publish-packages.yml   → Publicación de SDKs
.github/workflows/                       → Todo el directorio
```

**¿Por qué?** Los workflows de publicación están configurados con tokens y secretos
específicos del origen. Modificarlos en el fork puede romper la sincronización.

### 4.3 Infraestructura de la Raíz

```
package.json          → Workspaces y scripts del monorepo
yarn.lock             → Lock file (se regenera solo)
tsconfig.json         → TypeScript base config
jest.config.js        → Jest config base
eslint.config.js      → ESLint config base
```

### 4.4 Scripts de Administración

```
scripts/rename-monorepo.js           → Script de migración (ya ejecutado)
scripts/setup-github-packages.sh  → Configuración del registry
scripts/database/                 → Scripts de BD compartidos
```

---

## 5. Proceso paso a paso para crear un nuevo fork

```bash
# 1. Fork del repo en GitHub (UI de GitHub)
#    monorepo-vzla/monorepo → tu-org/tu-app

# 2. Clonar tu fork localmente
git clone git@github.com:tu-org/tu-app.git
cd tu-app

# 3. Agregar el origen como upstream para recibir actualizaciones
git remote add upstream git@github.com:monorepo-vzla/monorepo.git

# 4. Instalar dependencias
yarn install

# 5. Configurar variables de entorno
cp .env.development.example .env.development       # o copiar el .env.template
cp apps/web/.env.template apps/web/.env.development
cp apps/mobile/.env.template apps/mobile/.env.development
# Editar los archivos .env.development con tus valores reales

# 6. Reemplazar assets de branding
# Sobreescribir los SVG/PNG en:
#   assets/images/branding/
#   apps/web/public/assets/images/branding/
#   apps/mobile/assets/images/branding/
node scripts/sync-assets.js  # Sincroniza automáticamente los 3 dirs

# 7. Actualizar app.json del móvil
# Cambiar name, slug, bundleIdentifier, package

# 8. Personalizar page.tsx y layout.tsx

# 9. Correr en desarrollo
./scripts/dev-all.sh
```

---

## 6. Recibir actualizaciones del monorepo origen

Cuando `monorepo-vzla` publique mejoras a los SDKs o fixes de seguridad:

```bash
# Traer los cambios del origen
git fetch upstream
git merge upstream/main

# Resolver conflictos si los hay (normalmente solo en los archivos
# que tú modificaste — .env.template, page.tsx, app.json, etc.)

# Instalar nuevas dependencias si las hay
yarn install
```

> Los paquetes SDK se actualizan automáticamente vía GitHub Package Registry.
> Si se publicó una nueva versión, actualiza en tu package.json:
> ```bash
> yarn upgrade @monorepo-vzla/auth @monorepo-vzla/api
> ```

---

## 7. Resumen rápido

| Categoría | ¿Modificar en fork? | Ejemplos |
|---|---|---|
| 🔴 **Nunca** | ❌ | `packages/**`, `.github/workflows/**`, `tsconfig.json`, `yarn.lock` |
| 🟡 **Sólo si necesitas extender** | ⚠️ Con cuidado | `middleware.ts`, `auth.ts`, `route-protection.ts`, `Navbar.tsx` |
| 🟢 **Siempre personalizar** | ✅ Obligatorio | `.env.*`, `assets/branding/**`, `app.json`, `page.tsx`, `layout.tsx` |
| 🔵 **Tu negocio aquí** | ✅ Añadir libremente | `apps/web/src/app/tu-feature/**`, `apps/mobile/src/screens/Tu*.tsx` |
