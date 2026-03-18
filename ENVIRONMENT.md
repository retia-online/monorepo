# Environment Setup

Antes de correr el proyecto necesitas crear los archivos de configuración a partir de los templates incluidos en el repo.

---

## 1. package.json

Cada app tiene un `package.json.template`. Cópialo como `package.json` y ajusta los valores marcados con `[...]`.

```bash
cp apps/web/package.json.template apps/web/package.json
cp apps/mobile/package.json.template apps/mobile/package.json
```

Valores a reemplazar:

- `@[YOUR_ORG]/web` y `@[YOUR_ORG]/mobile` → nombre de tu organización (ej. `@mi-empresa/web`)
- SDK: elige entre **Option A** (`retia-global`) o **Option B** (`megamercado-vzla`), deja activo solo uno y comenta el otro

Luego instala dependencias:

```bash
yarn install
```

---

## 2. Variables de entorno

Cada app tiene archivos `.env.template`, `.env.development` y `.env.production` como referencia local.
Úsalos como base para crear tus propios entornos.

### Local (desarrollo)

```bash
cp apps/web/.env.development apps/web/.env.development.local
cp apps/mobile/.env.development apps/mobile/.env.development.local
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

---

### Producción

```bash
cp apps/web/.env.production apps/web/.env.production.local
cp apps/mobile/.env.production apps/mobile/.env.production.local
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

## Resumen de archivos por app

| Archivo | Propósito | En git |
|---|---|---|
| `package.json.template` | Template del package.json | ✅ |
| `package.json` | Config activa (generada desde template) | ❌ |
| `.env.template` | Template de variables con valores vacíos | ✅ |
| `.env.development` | Variables de desarrollo activas | ❌ |
| `.env.production` | Variables de producción activas | ❌ |

> Para más detalles sobre cómo levantar el proyecto una vez configurado, ver [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)
