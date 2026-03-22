# Environment Setup

## 1. CONFIGURAR UN NUEVO CLIENTE

### 1.1. Configurar el repositorio

1. Dar acceso a la cuenta del cliente desde `@retia-global/monorepo` como colaborador
2. Hacer fork del repositorio base desde la cuenta del cliente en GitHub
3. Convertir el repo en Template
4. Clonar el fork como `app`
5. Invitar a los desarrolladores al nuevo repositorio

### 1.2. Clonar el repositorio

```bash
# Reemplaza [ORG] con el nombre de la organización del cliente
git clone https://github.com/[ORG]/app.git
```

### 1.3. Crear los package.json desde los templates

```bash
cp package.json.template package.json
cp apps/web/package.json.template apps/web/package.json
cp apps/mobile/package.json.template apps/mobile/package.json
```

Ajusta los valores marcados con `[...]` en cada archivo.

---

## 2. SETUP DE DESARROLLO

### Paso 1 — Configurar .npmrc

Crea el archivo `.npmrc` en la raíz a partir del template:

```bash
cp .npmrc.template .npmrc
```

Edita `.npmrc` y reemplaza `YOUR_GITHUB_TOKEN` con tu Personal Access Token de GitHub.

Generar token: https://github.com/settings/tokens → scope `read:packages`

> `.npmrc` está en `.gitignore` — nunca lo commitees.

### Paso 2 — Variables de entorno

Crea los archivos `.env.local` para cada app a partir de los templates:

```bash
cp apps/web/.env.template apps/web/.env.local
cp apps/mobile/.env.template apps/mobile/.env.local
```

> `.env.local` es cargado automáticamente por Next.js y Expo en todos los entornos.
> Está en `.gitignore` — nunca lo commitees.

Genera el `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

Variables mínimas requeridas:

**`apps/web/.env.local`**
```env
MONGODB_URI=mongodb://127.0.0.1:27017/[nombre-db]
NEXTAUTH_URL=http://[TU_IP_LOCAL]:9001
NEXTAUTH_SECRET=[mínimo 32 caracteres]
AUTH_MODE=required
AUTH_PROVIDERS=email
INSTANCE=[nombre-instancia]
```

**`apps/mobile/.env.local`**
```env
EXPO_PUBLIC_API_URL=http://[TU_IP_LOCAL]:9001
EXPO_PUBLIC_AUTH_MODE=required
EXPO_PUBLIC_AUTH_METHODS=email
INSTANCE=[nombre-instancia]
```

> Usa tu IP local (no `localhost`) para que el dispositivo/emulador alcance el backend.
> Obtén tu IP con: `ipconfig getifaddr en0`

### Paso 3 — Instalar dependencias

```bash
yarn install
```

### Paso 4 — Base de datos

```bash
brew services start mongodb-community
```

Verificar:
```bash
brew services list | grep mongodb
# Debe mostrar: mongodb-community started
```

> Para resetear la BD: `yarn clean-db:force`

---

## 3. LEVANTAR EL ENTORNO

### Terminal 1 — App Web

```bash
yarn dev
# o desde la raíz del monorepo
```

Disponible en **http://localhost:9001**. Espera hasta ver `✓ Ready`.

> La app mobile depende del backend web — levanta la web primero.

### Terminal 2 — App Mobile Android

```bash
yarn workspace @retia-app/mobile android
```

Si el emulador no arranca automáticamente:
```bash
~/Library/Android/sdk/emulator/emulator -avd Pixel_8_Pro
```

### Terminal 3 — App Mobile iOS

```bash
yarn workspace @retia-app/mobile ios
```

> iOS y Android comparten el mismo servidor Metro y pueden correr simultáneamente.

---

## 4. PUERTOS

| Servicio   | Puerto | URL                       |
|------------|--------|---------------------------|
| MongoDB    | 27017  | mongodb://localhost:27017 |
| Web (Next) | 9001   | http://localhost:9001     |
| Expo Metro | 8081   | http://localhost:8081     |

---

## 5. TROUBLESHOOTING

### "Puerto en uso"
Los scripts `dev` y `start` liberan los puertos automáticamente al iniciar.

### "Cannot connect to API" en el móvil
1. Verifica que la web está corriendo en el puerto 9001
2. Comprueba que `EXPO_PUBLIC_API_URL` usa tu IP local, no `localhost`
3. En emulador Android, `localhost` no apunta a tu Mac — usa la IP real

### "MongoDB connection refused"
```bash
brew services restart mongodb-community
```

---

## 6. PRODUCCIÓN


```bash
cp apps/web/.env.template apps/web/.env.production
```

https://cloud.mongodb.com/

Build a Cluster
name: app

Crear Usuario y Contrasena
Seleccionar tipo de coneccion Driver 
node.js
Copiar el stream a .env



Variables clave:
```env
MONGODB_URI=mongodb+srv://[user]:[pass]@[cluster]/[db]
NEXTAUTH_URL=https://[tu-dominio.com]
NEXTAUTH_SECRET=[clave segura]
NODE_ENV=production
```

Crear Proyecto en Vercel


Para el build:
```bash
yarn build
```

---

## 7. IMÁGENES Y BRANDING

Todas las imágenes de branding se ubican en:

```
apps/web/public/assets/images/branding/
apps/mobile/assets/images/branding/
```

> Ambas carpetas deben mantenerse sincronizadas con los mismos archivos.
> Puedes usar el script `yarn sync-assets` para copiarlos automáticamente.

### Archivos requeridos

| Archivo                  | Uso                                      | Formato | Tamaño recomendado |
|--------------------------|------------------------------------------|---------|--------------------|
| `logo-rectangular.svg`   | Home, login, register (header)           | SVG     | 400×160 px (ratio 2.5:1) |
| `logo-square.svg`        | Favicon, iconos cuadrados                | SVG     | 200×200 px (1:1)   |
| `favicon.svg`            | Tab del navegador                        | SVG     | 32×32 px           |
| `favicon-32x32.png`      | Tab del navegador (fallback PNG)         | PNG     | 32×32 px           |
| `avatar.svg`             | Avatar de usuario por defecto            | SVG     | 200×200 px (1:1)   |

### Dónde aparece cada imagen

- `logo-rectangular.svg` — pantalla de Home, Login y Register (versión pequeña 180×72 px)
- `logo-square.svg` — Navbar y componentes compactos
- `favicon.svg` / `favicon-32x32.png` — definidos en `apps/web/src/app/layout.tsx`
- `avatar.svg` — perfil de usuario cuando no hay foto

### Cómo reemplazar las imágenes

1. Prepara tus archivos respetando los nombres y formatos de la tabla
2. Copia los archivos a ambas carpetas:

```bash
# Web
cp tu-logo-rectangular.svg apps/web/public/assets/images/branding/logo-rectangular.svg
cp tu-logo-square.svg      apps/web/public/assets/images/branding/logo-square.svg
cp tu-favicon.svg          apps/web/public/assets/images/branding/favicon.svg
cp tu-favicon.png          apps/web/public/assets/images/branding/favicon-32x32.png
cp tu-avatar.svg           apps/web/public/assets/images/branding/avatar.svg

# Mobile (sincronizar)
yarn sync-assets
```

3. El favicon también está en `apps/web/public/favicon.svg` — reemplázalo también:

```bash
cp tu-favicon.svg apps/web/public/favicon.svg
```

### Notas

- SVG es el formato preferido por ser escalable y liviano
- Para PNG, usa fondo transparente
- El logo rectangular se muestra a **180×72 px** en login/register y **400×160 px** en home
- Los colores del logo deben coincidir o complementar los definidos en `NEXT_PUBLIC_PRIMARY_COLOR` y `NEXT_PUBLIC_SECONDARY_COLOR` del `.env.local`
