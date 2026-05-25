# Documentación Técnica del Repositorio

## 📁 Estructura del Proyecto

```
monorepo/
├── apps/                      # Aplicaciones del proyecto
│   ├── web/                   # Next.js Web Application
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router (API routes, pages)
│   │   │   ├── components/    # Componentes React
│   │   │   ├── lib/           # Utilidades y configuraciones
│   │   │   └── styles/        # Estilos Tailwind
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── .env.local         # Variables de entorno locales
│   │
│   └── mobile/                # Expo/React Native Mobile App
│       ├── src/
│       │   ├── components/    # Componentes React Native
│       │   ├── screens/       # Pantallas de la app
│       │   ├── navigation/    # Configuración de navegación
│       │   ├── context/       # Contextos React (Auth, etc)
│       │   ├── lib/           # Utilidades (API, OAuth, Storage)
│       │   └── types/         # Tipos TypeScript
│       ├── App.tsx            # Punto de entrada
│       ├── app.json           # Configuración Expo
│       └── package.json
│
├── packages/                  # Paquetes compartidos (Yarn Workspaces)
│   ├── api/                   # Servicios API, modelos, integración Odoo
│   │   └── src/
│   │       ├── services/      # OdooService, EmailService, etc.
│   │       ├── models/        # Modelos Mongoose (User, etc.)
│   │       └── index.ts       # Exports públicos
│   │
│   ├── auth/                  # SDK de autenticación NextAuth
│   │   └── src/
│   │       ├── index.ts       # Configuración NextAuth
│   │       ├── middleware.ts  # Protección de rutas
│   │       └── types.ts       # Tipos relacionados
│   │
│   ├── configs/               # Configuraciones compartidas
│   │   ├── tailwind.preset.js # Preset Tailwind
│   │   ├── tsconfig.base.json # Config TypeScript base
│   │   └── eslint.config.js   # Config ESLint
│   │
│   ├── database/              # Utilidades MongoDB/Mongoose
│   │   └── src/
│   │       ├── connection.ts  # Conexión a MongoDB
│   │       └── index.ts
│   │
│   ├── types/                 # Tipos TypeScript compartidos
│   │   └── src/
│   │       └── index.ts       # Tipos globales
│   │
│   ├── ui/                    # Componentes UI React/React Native
│   │   ├── src/
│   │   │   ├── components/    # Componentes (Button, Input, etc)
│   │   │   ├── layouts/       # Layouts reutilizables
│   │   │   └── index.ts
│   │   └── .storybook/        # Documentación Storybook
│   │
│   └── utils/                 # Utilidades varias
│       └── src/
│           ├── validation.ts  # Funciones Zod
│           └── index.ts
│
├── scripts/                   # Scripts de configuración
│   └── environments/
│       ├── local/             # Configuración desarrollo local
│       │   ├── setup.sh       # Script principal de setup
│       │   ├── start.sh       # Script de inicio de servicios
│       │   ├── web/           # Setup específico web
│       │   ├── mobile/        # Setup específico mobile
│       │   │   ├── setup.sh   # Configura mobile para emuladores
│       │   │   └── start.sh   # Inicia mobile con emuladores
│       │   └── templates/     # Plantillas de configuración
│       ├── staging/           # Configuración staging
│       ├── production/        # Configuración producción
│       └── common/            # Utilidades compartidas
│
├── __tests__/                 # Tests de integración
└── package.json               # Root workspace config
```

---

## 🛠️ Stack Tecnológico

### Web App (`apps/web`)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 16.1.0 | Framework React con App Router |
| **React** | 19.1.0 | Librería de UI |
| **NextAuth.js** | 5.0.0-beta.4 | Autenticación |
| **MongoDB** | - | Base de datos |
| **Mongoose** | 8.0.3 | ODM para MongoDB |
| **Tailwind CSS** | 3.4.0 | Estilos |
| **Pino** | 10.1.0 | Logging |
| **Zod** | 3.22.4 | Validación de schemas |
| **TypeScript** | 5.3.3 | Tipado estático |

### Mobile App (`apps/mobile`)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Expo** | ~54.0.30 | Framework React Native |
| **React Native** | 0.81.5 | UI nativa |
| **React Navigation** | 7.x | Navegación |
| **Expo Auth Session** | 7.0.10 | Autenticación OAuth |
| **Expo Secure Store** | 15.0.8 | Almacenamiento seguro |
| **React Native Web** | 0.21.0 | Compatibilidad web |

### Paquetes Compartidos

| Paquete | Tecnologías |
|---------|-------------|
| **@retia-global/api** | Odoo XML-RPC, MongoDB, Nodemailer, Zod, bcryptjs |
| **@retia-global/auth** | NextAuth.js v5, jose |
| **@retia-global/ui** | React, React Native, Storybook |
| **@retia-global/configs** | Tailwind, TypeScript, ESLint |
| **@retia-global/types** | TypeScript |
| **@retia-global/utils** | Zod, Nodemailer |

### Herramientas de Desarrollo

| Herrámica | Propósito |
|-----------|-----------|
| **Yarn** (1.22.22) | Gestor de paquetes (workspaces) |
| **TypeScript** | Tipado estático |
| **ESLint** | Linting |
| **Prettier** | Formateo de código |
| **Husky** | Git hooks |
| **tsup** | Build de packages |

---

## 🔗 Integración con Odoo

### Visión General

La aplicación se integra con **Odoo** (ERP) para:

1. **Autenticación** - Login usando credenciales de Odoo
2. **Sincronización de usuarios** - Crear usuarios en Odoo al registrarse
3. **Gestión de contraseñas** - Sincronizar cambios de contraseña

### Arquitectura de la Integración

```
┌─────────────────────────────────────────────────────────────┐
│                     apps/web                                │
│                  (Next.js App)                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  /api/auth/[...nextauth]  - NextAuth handlers       │   │
│  │  /api/register            - Registro de usuarios    │   │
│  │  /api/change-password     - Cambio de contraseña    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   @retia-global/api                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              OdooService (JSON-RPC)                  │   │
│  │  • authenticate()                                    │   │
│  │  • createUser()                                      │   │
│  │  • updatePassword()                                  │   │
│  │  • read()                                            │   │
│  │  • executeKeyword()                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Odoo Server                                │
│                  (External ERP)                             │
│                                                             │
│  Database: res.users, res.partner, etc.                    │
└─────────────────────────────────────────────────────────────┘
```

### Configuración de Odoo

**Variables de entorno requeridas:**

```bash
# Odoo Server
ODOO_URL=https://odoo.your-domain.com
ODOO_DB=your_database_name
ODOO_ADMIN_UID=2
ODOO_ADMIN_PASSWORD=admin_password_for_operations

# Métodos de autenticación habilitados
AUTH_PROVIDERS=email,odoo
```

### OdooService - Referencia API

El servicio se encuentra en `packages/api/src/services/odoo.ts`:

```typescript
import { createOdooService } from '@retia-global/api';

// Crear instancia del servicio
const odoo = createOdooService();

// Autenticar usuario
const user = await odoo.authenticate('login', 'password');
// Returns: { uid, name, email, company_id, isAdmin }

// Crear usuario en Odoo
const newUid = await odoo.createUser('Nombre', 'email@example.com', 'password');

// Actualizar contraseña
await odoo.updatePassword(uid, 'newPassword');

// Leer datos de Odoo
const data = await odoo.read('res.users', [uid], ['name', 'email']);

// Ejecutar método personalizado
const result = await odoo.executeKeyword('res.users', 'action_do_something', [uid]);
```

### Métodos del OdooService

| Método | Descripción | Parámetros | Retorna |
|--------|-------------|------------|---------|
| `authenticate` | Autentica contra Odoo | `login`, `password` | `{ uid, name, email, company_id, isAdmin }` |
| `createUser` | Crea usuario en Odoo | `name`, `login`, `password` | `uid` (number) |
| `updatePassword` | Actualiza contraseña | `uid`, `newPassword` | `void` |
| `read` | Lee registros | `model`, `ids`, `fields` | `object[]` |
| `executeKeyword` | Ejecuta método Odoo | `model`, `method`, `args`, `kwargs` | `any` |

### Flujos de Autenticación

#### 1. Login con Odoo

```
Usuario ingresa credenciales
         │
         ▼
Mobile/Web → API /api/auth/login (provider=odoo)
         │
         ▼
@retia-global/api → OdooService.authenticate()
         │
         ▼
Odoo XML-RPC → Odoo Server (common.login)
         │
         ▼
Obtiene UID y datos del usuario
         │
         ▼
Busca/crea usuario local en MongoDB
         │
         ▼
Genera JWT/NextAuth session
```

#### 2. Registro de Usuario

```
Usuario completa formulario de registro
         │
         ▼
API /api/register
         │
         ├──▶ Crear usuario en MongoDB
         │
         └──▶ Si AUTH_PROVIDERS incluye 'odoo':
                  │
                  ▼
              OdooService.createUser()
                  │
                  ▼
              Odoo XML-RPC → res.users/create
                  │
                  ▼
              Asigna grupo 'Portal User'
```

#### 3. Cambio de Contraseña

```
Usuario solicita cambio de contraseña
         │
         ▼
API /api/change-password
         │
         ├──▶ Valida contraseña actual contra Odoo
         │         │
         │         ▼
         │    OdooService.authenticate()
         │
         ├──▶ Actualiza en MongoDB (bcrypt)
         │
         └──▶ Si tiene odoo_uid en metadata:
                  │
                  ▼
              OdooService.updatePassword()
                  │
                  ▼
              Odoo XML-RPC → res.users/write
```

### Modelos de Datos

#### Usuario en MongoDB (`packages/api/src/models/user.ts`)

```typescript
interface User {
  _id: ObjectId;
  email: string;
  name: string;
  password?: string;        // Hash bcrypt (solo si AUTH_METHODS=email)
  role: 'admin' | 'user';
  approved: boolean;
  authProvider: 'email' | 'odoo' | 'google' | 'facebook';
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    odoo_uid?: number;      // ID del usuario en Odoo
    google_id?: string;
    facebook_id?: string;
    // otros datos...
  };
}
```

### Habilitar/Deshabilitar Odoo

Para **habilitar** Odoo como método de autenticación:

```bash
# En apps/web/.env.local
AUTH_PROVIDERS=email,odoo

# En apps/mobile/.env.local  
EXPO_PUBLIC_AUTH_METHODS=email,odoo
EXPO_PUBLIC_ODOO_URL=https://odoo.your-domain.com
```

Para **deshabilitar** Odoo:

```bash
AUTH_PROVIDERS=email
EXPO_PUBLIC_AUTH_METHODS=email
```

---

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# 1. Instalar dependencias
yarn install

# 2. Configurar entorno
./scripts/environments/local/setup.sh

# 3. Iniciar servicios
./scripts/environments/local/start.sh

# O iniciar solo web
cd apps/web && yarn dev

# O iniciar mobile con emuladores
./scripts/environments/local/mobile/start.sh
```

### Puertos

| Servicio | Puerto |
|----------|--------|
| Web App | 9001 |
| Expo Metro | 8081 |
| MongoDB | 27017 |

---

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Expo Docs](https://docs.expo.dev)
- [React Native](https://reactnative.dev)
- [Odoo Developer Docs](https://www.odoo.com/documentation/16.0/developer)
- [NextAuth.js](https://next-auth.js.org)
- [MongoDB](https://docs.mongodb.com)