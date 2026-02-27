# Configuración Local - Guía de Desarrollo

Esta guía te ayudará a configurar el entorno de desarrollo local paso a paso.

## Requisitos del Sistema

- **Node.js**: v18.0.0 o superior
- **Yarn**: v1.22.0 o superior
- **MongoDB**: Local o Atlas
- **Git**: Para control de versiones

### Verificar Instalaciones

```bash
node --version   # Debería mostrar v18.x.x o superior
yarn --version   # Debería mostrar 1.22.x o superior
```

## Instalación de MongoDB Local (Opcional)

Si prefieres usar MongoDB localmente en vez de Atlas:

### macOS

```bash
# Usando Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Iniciar MongoDB
brew services start mongodb-community

# Verificar que esté corriendo
brew services list | grep mongodb
```

### Linux (Ubuntu/Debian)

```bash
# Importar clave pública
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Crear archivo de lista
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Actualizar e instalar
sudo apt-get update
sudo apt-get install -y mongodb-org

# Iniciar servicio
sudo systemctl start mongod
sudo systemctl enable mongod  # Para que inicie al arrancar
```

### Windows

1. Descarga el instalador desde [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Ejecuta el instalador
3. Selecciona "Complete" installation
4. Asegúrate de marcar "Install MongoDB as a Service"

## Configuración del Proyecto

### 1. Clonar el Repositorio (si es necesario)

```bash
git clone <tu-repositorio>
cd monorepo
```

### 2. Instalar Dependencias

```bash
# Desde la raíz del monorepo
yarn install
```

Esto instalará todas las dependencias de todos los packages y apps.

### 3. Configurar Variables de Entorno

#### 3.1 Copiar Template

```bash
cp .env.local.template .env.local
```

#### 3.2 Editar .env.local

Abre `.env.local` y configura los valores:

```bash
# MongoDB - Conexión local
MONGODB_URI=mongodb://localhost:27017/auth-system

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=super-secret-change-this

# Auth Providers (elige cuáles quieres habilitar)
AUTH_PROVIDERS=email,google

# ... resto de configuraciones
```

#### 3.3 Generar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copia el resultado y pégalo en `NEXTAUTH_SECRET` en tu `.env.local`.

### 4. Configurar OAuth (Opcional pero Recomendado)

#### Google OAuth - Desarrollo Local

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto (ej: "Auth System Dev")
3. Habilita Google+ API
4. Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configura:
   - Application type: **Web application**
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
6. Copia Client ID y Client Secret a `.env.local`

#### Facebook OAuth - Desarrollo Local

1. Ve a [Facebook Developers](https://developers.facebook.com)
2. Crea nueva app (Development mode)
3. Añade "Facebook Login"
4. Settings → Basic:
   - App Domains: `localhost`
5. Facebook Login → Settings:
   - Valid OAuth Redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/facebook
     ```
6. Copia App ID y App Secret a `.env.local`

### 5. Configurar Email (Para Recuperación de Contraseña)

#### Opción A: Gmail

1. Ve a tu cuenta de Google
2. Security → 2-Step Verification (actívalo si no lo está)
3. App passwords → Genera una contraseña para "Mail"
4. En `.env.local`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASSWORD=la-app-password-generada
   ```

#### Opción B: Mailtrap (Recomendado para Desarrollo)

[Mailtrap](https://mailtrap.io) es ideal para dev - captura emails sin enviarlos realmente:

1. Crea cuenta gratis en [mailtrap.io](https://mailtrap.io)
2. Ve a Email Testing → Inboxes → [tu inbox]
3. Copia las credenciales SMTP
4. En `.env.local`:
   ```
   SMTP_HOST=sandbox.smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=tu-mailtrap-user
   SMTP_PASSWORD=tu-mailtrap-password
   ```

## Iniciar el Servidor de Desarrollo

### Desde la Raíz del Monorepo

```bash
yarn dev
```

Esto ejecuta `yarn workspace @monorepo/web dev`, iniciando Next.js en puerto 3000.

### O Directamente desde apps/web

```bash
cd apps/web
yarn dev
```

La aplicación estará disponible en:
```
http://localhost:3000
```

## Estructura del Proyecto

```
monorepo/
├── apps/
│   └── web/                    # Aplicación Next.js
│       ├── src/
│       │   ├── app/           # App Router (rutas)
│       │   ├── lib/           # Utilidades (auth, theme)
│       │   └── types/         # Type definitions
│       └── package.json
│
├── packages/
│   ├── database/              # MongoDB models y conexión
│   ├── types/                 # TypeScript types compartidos
│   ├── utils/                 # Funciones de utilidad
│   └── ui/                    # Componentes React compartidos
│
├── .env.local                 # Variables de entorno (NO commitear)
├── .env.local.template        # Template de ejemplo
└── package.json               # Root workspace config
```

## Flujo de Desarrollo

### 1. Primera Ejecución

1. Inicia el servidor: `yarn dev`
2. Abre http://localhost:3000
3. Serás redirigido a `/register` (no hay usuarios aún)
4. Registra el primer usuario → obtendrá rol **ADMIN** automáticamente

### 2. Desarrollo de Features

#### Hot Reload

Next.js recargará automáticamente cuando cambies archivos:
- Frontend: Cambios en `apps/web/src/app/**`
- Componentes UI: Cambios en `packages/ui/src/**`
- Modelos DB: Cambios en `packages/database/src/**`

#### Agregar Nuevas Rutas

```bash
# Crear nueva página en apps/web/src/app/
mkdir apps/web/src/app/nueva-ruta
touch apps/web/src/app/nueva-ruta/page.tsx
```

#### Modificar Modelos de DB

Edita los modelos en `packages/database/src/models/`, por ejemplo para añadir un campo:

```typescript
// packages/database/src/models/User.ts
const userSchema = new Schema({
  // ... campos existentes
  phoneNumber: { type: String },  // Nuevo campo
});
```

### 3. Testing

#### Pruebas Manuales

**Registro**:
- Ir a `/register`
- Completar formulario
- Verificar que el primer usuario es ADMIN

**Login**:
- Ir a `/login`
- Probar con email/password
- Probar OAuth (Google/Facebook)

**Recuperación**:
- Ir a `/forgot-password`
- Ingresar email
- Verificar email en Mailtrap o Gmail

#### Ver Base de Datos

Usa MongoDB Compass para ver los datos:

1. Descarga [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Conecta con: `mongodb://localhost:27017`
3. Navega a database `auth-system` → collections

### 4. Debugging

#### Server-side Logs

Los logs aparecerán en la terminal donde corriste `yarn dev`:

```bash
# Ver logs en tiempo real
yarn dev

# Logs saldrán aquí automáticamente
```

#### Client-side Debugging

Usa las Dev Tools del navegador:
- Console: `Cmd+Option+J` (Mac) o `F12` (Windows/Linux)
- Network: Para ver requests/responses
- React DevTools: Instala la extensión

#### VS Code Debugging

Crea `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "yarn dev",
      "cwd": "${workspaceFolder}/apps/web",
      "serverReadyAction": {
        "pattern": "started server on .+, url: (https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

## Personalización

### Cambiar Colores del Tema

Edita `.env.local`:

```bash
PRIMARY_COLOR=#6366f1        # Indigo
SECONDARY_COLOR=#ec4899      # Pink
BACKGROUND_COLOR=#f9fafb     # Gray claro
TEXT_COLOR=#111827           # Casi negro
```

Reinicia el servidor para ver los cambios.

### Agregar Nuevo Provider OAuth

1. Instala el provider de NextAuth:
   ```bash
   yarn workspace @monorepo/web add next-auth
   ```

2. Edita `apps/web/src/lib/auth.ts`:
   ```typescript
   import GitHubProvider from 'next-auth/providers/github';
   
   // Añade al array de providers:
   if (enabledProviders.includes('github')) {
     providers.push(
       GitHubProvider({
         clientId: process.env.GITHUB_ID,
         clientSecret: process.env.GITHUB_SECRET,
       })
     );
   }
   ```

3. Añade las variables en `.env.local`:
   ```
   AUTH_PROVIDERS=email,google,github
   GITHUB_ID=tu-github-client-id
   GITHUB_SECRET=tu-github-client-secret
   ```

## Scripts Útiles

```bash
# Desarrollo
yarn dev                  # Inicia dev server

# Build
yarn build                # Build de producción en todos los packages

# Linting
yarn lint                 # Ejecuta ESLint

# Limpiar todo
yarn clean                # Borra node_modules y .next
rm -rf yarn.lock
yarn install              # Reinstala todo desde cero
```

## Troubleshooting Común

### Error: "Cannot find module '@monorepo/...'"

**Solución**:
```bash
cd /Users/lo/Code/monorepo/monorepo
yarn install
```

### Error: "EADDRINUSE: Port 3000 already in use"

**Solución**:
```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# O usa otro puerto
PORT=3001 yarn dev
```

### MongoDB no conecta

**Solución**:
```bash
# Verificar que MongoDB esté corriendo
brew services list | grep mongodb

# Si no está corriendo:
brew services start mongodb-community

# Verificar connection string en .env.local
```

### Hot reload no funciona

**Solución**:
- Reinicia el servidor (`Ctrl+C` y `yarn dev`)
- Verifica que los cambios estén en archivos dentro de `apps/` o `packages/`
- Borra `.next` y reinicia:
  ```bash
  rm -rf apps/web/.next
  yarn dev
  ```

## Mejores Prácticas

### Variables de Entorno

- ✅ Nunca commitees `.env.local`
- ✅ Mantén `.env.local.template` actualizado
- ✅ Usa diferentes secrets para dev y prod

### Git Workflow

```bash
# Crear feature branch
git checkout -b feature/nueva-funcionalidad

# Hacer cambios
git add .
git commit -m "feat: descripción del cambio"

# Push
git push origin feature/nueva-funcionalidad

# Crear Pull Request en GitHub/GitLab
```

### Code Style

```bash
# Antes de commit, ejecuta:
yarn lint

# Arreglar issues automáticamente:
yarn lint --fix
```

## Recursos Adicionales

- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [MongoDB Docs](https://docs.mongodb.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

¿Problemas? Revisa el archivo `/docs/TROUBLESHOOTING.md` o abre un issue en el repositorio.
