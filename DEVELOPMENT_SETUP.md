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

### `apps/web/.env.local`
```env
MONGODB_URI=mongodb://127.0.0.1:27017/monorepo
NEXTAUTH_URL=http://TU_IP_LOCAL:9001        # Ej: http://192.168.1.100:9001
NEXTAUTH_SECRET=<mínimo 32 caracteres>
AUTH_MODE=required
AUTH_PROVIDERS=email
INSTANCE=Megamercado
```

### `apps/mobile/.env.local`
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
