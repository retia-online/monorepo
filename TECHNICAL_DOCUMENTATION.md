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
│   ├── api/                   # Servicios API, modelos
│   │   └── src/
│   │       ├── services/      # EmailService, etc.
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
| **@core/api** | MongoDB, Nodemailer, Zod, bcryptjs |
| **@core/auth** | NextAuth.js v5, jose |
| **@core/ui** | React, React Native, Storybook |
| **@core/configs** | Tailwind, TypeScript, ESLint |
| **@core/types** | TypeScript |
| **@core/utils** | Zod, Nodemailer |

### Herramientas de Desarrollo

| Herrámica | Propósito |
|-----------|-----------|
| **Yarn** (1.22.22) | Gestor de paquetes (workspaces) |
| **TypeScript** | Tipado estático |
| **ESLint** | Linting |
| **Prettier** | Formateo de código |
| **Husky** | Git hooks |
| **tsup** | Build de packages |


