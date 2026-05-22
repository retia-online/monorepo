# Despliegue en Vercel - Guía Completa

Esta guía te llevará paso a paso para desplegar tu aplicación de autenticación en Vercel.

## Requisitos Previos

- ✅ Cuenta en [Vercel](https://vercel.com)
- ✅ Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- ✅ CLI de Vercel instalado (opcional, pero recomendado)
- ✅ Credenciales de OAuth configuradas (Google/Facebook)

## Paso 1: Preparar MongoDB Atlas

### 1.1 Crear Cuenta y Cluster

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto (ej: "Auth System Production")
4. Crea un cluster:
   - Selecciona el tier **M0 Free** (suficiente para empezar)
   - Elige la región más cercana a tus usuarios
   - Nombre: `auth-cluster` (o el que prefieras)

### 1.2 Configurar Acceso

#### Database Access (Usuarios)

1. En el menú lateral, ve a **Database Access**
2. Haz clic en **Add New Database User**
3. Configura:
   - Authentication Method: **Password**
   - Username: `authuser` (o el que prefieras)
   - Password: Genera una contraseña segura (guárdala!)
   - Database User Privileges: **Read and write to any database**
4. Haz clic en **Add User**

#### Network Access (IPs Permitidas)

1. En el menú lateral, ve a **Network Access**
2. Haz clic en **Add IP Address**
3. Selecciona **Allow Access from Anywhere** (0.0.0.0/0)
   - Esto es necesario para Vercel ya que sus IPs son dinámicas
   - Alternativamente, puedes añadir ranges de IPs específicos de Vercel
4. Haz clic en **Confirm**

### 1.3 Obtener Connection String

1. Ve a **Database** (menú lateral)
2. En tu cluster, haz clic en **Connect**
3. Selecciona **Connect your application**
4. Copia el connection string, se verá algo así:
   ```
   mongodb+srv://authuser:<password>@auth-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Reemplaza `<password>` con la contraseña que creaste
6. Añade el nombre de tu base de datos después de `.net/`:
   ```
   mongodb+srv://authuser:tupassword@auth-cluster.xxxxx.mongodb.net/auth-production?retryWrites=true&w=majority
   ```

## Paso 2: Configurar OAuth Providers para Producción

### Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto o crea uno nuevo
3. Habilita **Google+ API**:
   - APIs & Services → Library
   - Busca "Google+ API" → Enable
4. Crea credenciales:
   - APIs & Services → Credentials
   - Create Credentials → OAuth 2.0 Client ID
   - Application type: **Web application**
   - Authorized JavaScript origins:
     ```
     https://tu-dominio.vercel.app
     ```
   - Authorized redirect URIs:
     ```
     https://tu-dominio.vercel.app/api/auth/callback/google
     ```
5. Guarda **Client ID** y **Client Secret**

### Facebook OAuth

1. Ve a [Facebook Developers](https://developers.facebook.com)
2. Crea una nueva app
3. Añade producto **Facebook Login**
4. Configuración básica (Settings → Basic):
   - Copia **App ID** y **App Secret**
   - App Domains: `tu-dominio.vercel.app`
5. Facebook Login Settings:
   - Valid OAuth Redirect URIs:
     ```
     https://tu-dominio.vercel.app/api/auth/callback/facebook
     ```
6. Cambia el app a **Live** (desactiva modo Development)

## Paso 3: Desplegar en Vercel

### Opción A: Usando Vercel CLI (Recomendado)

#### 1. Instalar Vercel CLI

```bash
npm i -g vercel
```

#### 2. Login en Vercel

```bash
vercel login
```

#### 3. Desplegar desde el directorio de la app

```bash
cd /Users/lo/Code/monorepo/monorepo/apps/web
vercel
```

Responde las preguntas:
- **Set up and deploy**: Yes
- **Which scope**: Tu cuenta
- **Link to existing project**: No
- **What's your project's name**: `auth-system` (o el que prefieras)
- **In which directory is your code located**: `./`
- **Override settings**: No

#### 4. Configurar Variables de Entorno

Después del primer deploy, configura las variables:

```bash
# MongoDB
vercel env add MONGODB_URI production
# Pega tu connection string de Atlas

# NextAuth
vercel env add NEXTAUTH_URL production
# Ejemplo: https://auth-system.vercel.app

vercel env add NEXTAUTH_SECRET production
# Genera: openssl rand -base64 32

# Auth Providers
vercel env add AUTH_PROVIDERS production
# email,google,facebook

# Google OAuth
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production

# Facebook OAuth
vercel env add FACEBOOK_CLIENT_ID production
vercel env add FACEBOOK_CLIENT_SECRET production

# SMTP (Email)
vercel env add SMTP_HOST production
vercel env add SMTP_PORT production
vercel env add SMTP_USER production
vercel env add SMTP_PASSWORD production

# Theme Colors
vercel env add PRIMARY_COLOR production    # #3b82f6
vercel env add SECONDARY_COLOR production  # #10b981
vercel env add BACKGROUND_COLOR production # #ffffff
vercel env add TEXT_COLOR production       # #1f2937
```

#### 5. Re-desplegar con Variables

```bash
vercel --prod
```

### Opción B: Usando Vercel Dashboard

#### 1. Push a Git (GitHub/GitLab/Bitbucket)

```bash
cd /Users/lo/Code/monorepo/monorepo
git init
git add .
git commit -m "Initial commit: Auth system"
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

#### 2. Importar Proyecto en Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository**
3. Selecciona tu repositorio
4. Configura el proyecto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && yarn install && cd apps/web && yarn build`
   - **Install Command**: `yarn install`

#### 3. Configurar Variables de Entorno

En la pantalla de configuración, o después en **Settings → Environment Variables**, añade todas las variables (ver lista arriba).

#### 4. Deploy

Haz clic en **Deploy**. Vercel detectará cambios automáticamente en cada push a `main`.

## Paso 4: Configuración Post-Despliegue

### 1. Verificar la URL

Una vez desplegado, Vercel te dará una URL como:
```
https://auth-system-xxxxx.vercel.app
```

### 2. Actualizar OAuth Redirect URLs

Vuelve a Google Cloud Console y Facebook Developers y añade esta URL exacta a las redirect URIs.

### 3. Configurar Dominio Personalizado (Opcional)

1. En Vercel Dashboard → Settings → Domains
2. Añade tu dominio personalizado
3. Configura los DNS según las instrucciones
4. Actualiza `NEXTAUTH_URL` con tu dominio personalizado
5. Actualiza OAuth redirect URIs con el nuevo dominio

## Paso 5: Verificación

### 1. Probar Registro del Primer Usuario

1. Visita tu URL de producción
2. Deberías ser redirigido a `/register` (si no hay usuarios)
3. Crea el primer usuario → debería obtener rol ADMIN

### 2. Probar Login

1. Logout y vuelve a `/login`
2. Prueba login con email/password
3. Prueba OAuth (Google/Facebook) si están habilitados

### 3. Probar Recuperación de Contraseña

1. Ve a `/forgot-password`
2. Ingresa un email válido
3. Verifica que llegue el email
4. Usa el link para resetear contraseña

## Troubleshooting

### Error: "Cannot connect to database"

**Solución**:
- Verifica que `MONGODB_URI` esté correctamente configurado en Vercel
- Asegúrate de que Network Access en Atlas permite 0.0.0.0/0
- Verifica que el usuario de DB tenga permisos correctos

### Error: OAuth "Redirect URI mismatch"

**Solución**:
- Verifica que las URLs en Google/Facebook coincidan EXACTAMENTE con tu dominio de Vercel
- Incluye `https://` y NO incluyas `/` al final
- Espera unos minutos después de actualizar (puede tomar tiempo en propagarse)

### Emails no se envían

**Solución**:
- Para producción, usa un servicio de email transaccional:
  - [SendGrid](https://sendgrid.com) - 100 emails gratis/día
  - [Mailgun](https://www.mailgun.com) - 5,000 emails gratis/mes
  - [AWS SES](https://aws.amazon.com/ses/) - 62,000 emails gratis/mes
- Configura las variables SMTP con tus credenciales del servicio elegido

### Build Fail: "Module not found"

**Solución**:
- Asegúrate de que el build command incluya `cd ../.. && yarn install`
- Verifica que `transpilePackages` en `next.config.js` incluya todos los packages
- Revisa los logs de build en Vercel para ver el error específico

## Monitoreo y Mantenimiento

### Logs

Ver logs en tiempo real:
```bash
vercel logs
```

O en el Dashboard: **Deployments → [tu deployment] → Function Logs**

### Analytics

Habilita Vercel Analytics en Settings para ver métricas de performance.

### Updates

Para actualizar la aplicación:
1. Haz cambios en local
2. Commit y push a git
3. Vercel desplegará automáticamente

O con CLI:
```bash
vercel --prod
```

## Seguridad en Producción

### Checklist de Seguridad

- ✅ `NEXTAUTH_SECRET` debe ser único y aleatorio (nunca uses el mismo que en desarrollo)
- ✅ Usa HTTPS (Vercel lo provee automáticamente)
- ✅ Mantén las credenciales OAuth seguras (nunca en el código)
- ✅ Configura rate limiting para APIs (considera Vercel Edge Config)
- ✅ Habilita MongoDB Atlas Backup automático
- ✅ Monitorea logs regularmente para detectar actividad sospechosa

## Costos Estimados

- **Vercel**: Gratis para proyectos personales (Hobby plan)
- **MongoDB Atlas**: Gratis hasta 512 MB (M0 tier)
- **Emails**: Depende del servicio (SendGrid tiene tier gratuito)

Total: **$0/mes** para empezar 🎉

---

¿Necesitas ayuda? Revisa la [documentación de Vercel](https://vercel.com/docs) o [MongoDB Atlas](https://docs.atlas.mongodb.com/).
