# Environment Setup

# 1. AGREGAR UNA CUENTA DE CLIENTE PARA DESPLAGAR APLICACUIONES

Este monorepo está configurado para sincronizarse con múltiples cuentas o repositorios remotos (actualmente `megamercado` y `retia`). Esto permite mantener la misma base de código centralizada, pero desplegar o enviar actualizaciones a diferentes organizaciones o clientes configurando ramas y variables de entorno específicas.

Si deseas agregar una nueva cuenta a esta lógica, debes seguir los pasos detallados a continuación:

## 1.1. Configurar el nuevo repositorio

Dar Acceso a la cuenta de cliente desde el repositorio Principal @retia-global/monorepo como colaborador 

Debes loguearte a la cuenta en github.com con el Id de google del Cliente y hacer un fork del repositorio base.

Comvertir Repo en Template

Hacer clone de repo monorepo a app

Invitar al Usuario a Colaborar en el Nuevo Repositorio 'app'


## 1.2. Clonar el nuevo repositorio remoto


```bash
# Reemplaza 'ORG' con el nombre del cliente y la URL correcta
git clone https://github.com/[ORG]/app.git
```

Antes de correr el proyecto necesitas crear los archivos de configuración a partir de los templates incluidos en el repo.

## 1.3. package.json

Cada app tiene un `package.json.template`. Cópialo como `package.json` y ajusta los valores marcados con `[...]`.

```bash
cp apps/web/package.json.template apps/web/package.json
cp apps/mobile/package.json.template apps/mobile/package.json
```

Valores a reemplazar:

- `@[YOUR_ORG]/web` y `@[YOUR_ORG]/mobile` → nombre de tu organización (ej. `@mi-empresa/web`)
- SDK: elige entre **Option A** (`retia-global`) o **Option B** (`megamercado-vzla`), deja activo solo uno y comenta el otro


## 1.4 Variables de entorno

Cada app tiene archivos `.env.template`, `.env.development` y `.env.production` como referencia local.
Úsalos como base para crear tus propios entornos.

### Local (desarrollo)

```bash
cp apps/web/.env.template apps/web/.env.development
cp apps/mobile/.env.template apps/mobile/.env.development
```

> Los archivos `.env.development` ya existentes en el repo reflejan la configuración local activa.
> Si estás configurando una instancia nueva, revisa cada variable y ajusta según tu entorno.

Variables clave para desarrollo:

**apps/web/.env.development**
```env
MONGODB_URI=mongodb://127.0.0.1:27017/[tu-db]
NEXTAUTH_URL=http://[TU_IP_LOCAL]:9001
NEXTAUTH_SECRET=[genera con: openssl rand -base64 32]
INSTANCE=[nombre de tu instancia]
```

**apps/mobile/.env.development**
```env
EXPO_PUBLIC_API_URL=http://[TU_IP_LOCAL]:9001
EXPO_PUBLIC_INSTANCE=[nombre de tu instancia]
```

> Usa tu IP local (no `localhost`) para que el dispositivo/emulador alcance el backend.
> Obtén tu IP con: `ipconfig getifaddr en0`

### Producción

```bash
cp apps/web/.env.template apps/web/.env.production
cp apps/mobile/.env.template apps/mobile/.env.production
```

Variables clave para producción:

**apps/web/.env.production**
```env
MONGODB_URI=mongodb+srv://[user]:[pass]@[cluster]/[db]
NEXTAUTH_URL=https://[tu-dominio.com]
NEXTAUTH_SECRET=[clave segura]
NODE_ENV=production
```

**apps/mobile/.env.production**
```env
EXPO_PUBLIC_API_URL=https://[tu-dominio.com]
NODE_ENV=production
```

---

## 2 DEVELOP SETUP

# Development Setup

Guía para levantar el entorno de desarrollo completo.
Abre **4 terminales separadas** y sigue el orden exacto.

> Los comandos usan rutas relativas (`cd apps/...`) para que funcionen
> en cualquier fork independientemente del nombre del proyecto.

---

## Puertos

| Servicio   | Puerto | URL                        |
|------------|--------|----------------------------|
| MongoDB    | 27017  | mongodb://localhost:27017  |
| Web (Next) | 9001   | http://localhost:9001      |
| Expo Metro | 8081   | http://localhost:8081      |

---

## Terminal 1 — Base de Datos (MongoDB)

```bash
brew services start mongodb-community
```

Verificar que está corriendo:
```bash
brew services list | grep mongodb
# Debe mostrar: mongodb-community started
```

> Si necesitas resetear la BD antes de iniciar:
> ```bash
> yarn clean-db:force
> ```

---

## Terminal 2 — App Web (Next.js)

```bash
cd apps/web
yarn dev
```

La app estará disponible en **http://localhost:9001**

Espera hasta ver:
```
▲ Next.js
- Local: http://localhost:9001
✓ Ready
```

> ⚠️ **No lances el móvil hasta que la web esté lista.** El móvil depende del backend web.

---

## Terminal 3 — App Mobile Android

```bash
cd apps/mobile
yarn android
```

Si el emulador no arranca automáticamente, inícialo manualmente primero:
```bash
~/Library/Android/sdk/emulator/emulator -avd Pixel_8_Pro
```
Y luego vuelve a ejecutar el comando de arriba.

---

## Terminal 4 — App Mobile iOS

```bash
cd apps/mobile
yarn ios
```

> iOS y Android comparten el mismo servidor Metro (Terminal 3).
> Pueden correr simultáneamente sin conflictos.

---

## Variables de entorno requeridas

Antes de iniciar, asegúrate de tener estos archivos configurados:

### `apps/web/.env.development`
```env
MONGODB_URI=mongodb://127.0.0.1:27017/monorepo
NEXTAUTH_URL=http://TU_IP_LOCAL:9001        # Ej: http://192.168.1.100:9001
NEXTAUTH_SECRET=<mínimo 32 caracteres>
AUTH_MODE=required
AUTH_PROVIDERS=email
INSTANCE=Monorepo
```

### `apps/mobile/.env.development`
```env
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:9001  # Misma IP que NEXTAUTH_URL
EXPO_PUBLIC_AUTH_MODE=required
EXPO_PUBLIC_AUTH_METHODS=email
```

> 💡 Usa tu IP local (no `localhost`) para que el dispositivo/emulador pueda
> alcanzar el backend. Obtén tu IP con: `ipconfig getifaddr en0`

---

## Troubleshooting

### "Puerto 9001 en uso"
```bash
lsof -i :9001 -t | xargs kill -9
```
El script `dev` de la web ya hace esto automáticamente.

### "Puerto 8081 en uso"
```bash
lsof -i :8081 -t | xargs kill -9
```
El script `start` del móvil ya hace esto automáticamente.

### "Cannot connect to API" en el móvil
1. Verifica que la web está corriendo en el puerto 9001
2. Comprueba que `EXPO_PUBLIC_API_URL` usa tu IP local, no `localhost`
3. En emulador Android, `localhost` **no** apunta a tu Mac — usa la IP real

### "MongoDB connection refused"
```bash
brew services restart mongodb-community
```


## 2 PRODUCTION SETUP
