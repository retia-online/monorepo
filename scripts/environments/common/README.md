# Common — Scripts compartidos entre entornos

## 📋 Descripción
Utilidades y scripts que aplican a todos los entornos (local, develop, production).

## 📁 Estructura

```
scripts/environments/common/
├── README.md                 # Esta documentación
├── setup-mongodb.sh          # Provisiona usuarios DB en MongoDB Atlas
├── utils.sh                  # Funciones utilitarias (colores, logging)
├── requirements.sh           # Verifica herramientas instaladas
├── cleanup.sh                # Menú interactivo de limpieza
├── cleanup-soft.sh           # Limpieza suave (node_modules, caches)
└── cleanup-hard.sh           # Limpieza total (⚠️ destructivo)
```

## ⚙️ setup-mongodb.sh

Configura los usuarios de MongoDB Atlas para **ambos entornos** en una sola ejecución.

### Qué hace:
1. Lee `apps/web/.env.develop` y `apps/web/.env.production`
2. Valida que los usuarios y bases de datos sean distintos entre entornos
3. Configura el usuario **develop** con `readWrite` solo en `app_develop` (aislado)
4. Configura el usuario **production** con `atlasAdmin` (acceso total)
5. Agrega la IP pública actual al whitelist de Network Access
6. Ejecuta `test-db.sh` de cada entorno para verificar

### Prerrequisitos:
```bash
# 1. Tener los .env creados desde los templates
cp apps/web/.env.develop.template    apps/web/.env.develop
cp apps/web/.env.production.template apps/web/.env.production

# 2. Completar en .env.develop (las API keys de Atlas):
#    ATLAS_PUBLIC_KEY=...
#    ATLAS_PRIVATE_KEY=...
#    ATLAS_PROJECT_ID=...
#
#    Obtener en: Atlas → Organization → Access Manager → API Keys
#    Project ID:  Atlas → Project Settings → Project ID
```

### Uso:
```bash
./scripts/environments/common/setup-mongodb.sh
```

### Cómo toma los datos:
Los usuarios y passwords se leen **directamente de la `MONGODB_URI`** de cada `.env`:
```
mongodb+srv://USERNAME:PASSWORD@cluster.net/DATABASE?appName=app
              ↑        ↑                    ↑
           usuario   password           base de datos
```
Tú defines el usuario/password en el `.env` → el script los crea en Atlas.

---

## 🧹 Scripts de limpieza

```bash
./scripts/environments/common/cleanup.sh       # menú interactivo
./scripts/environments/common/cleanup-soft.sh  # elimina node_modules, caches, builds
./scripts/environments/common/cleanup-hard.sh  # ⚠️ elimina todo incluyendo .env
```

| Script | Elimina | Mantiene | Reversible |
|--------|---------|----------|------------|
| `cleanup-soft.sh` | node_modules, caches, builds | .env, código | Sí — `yarn install` |
| `cleanup-hard.sh` | Todo | Solo código fuente en git | No — requiere reconfiguración |

---

## 🗂️ Templates de variables de entorno

Los templates están en `apps/web/` y se commitean al repositorio como referencia:

| Template | Descripción | Copiar a |
|----------|-------------|----------|
| `.env.local.template` | Desarrollo local con MongoDB local | `.env.local` |
| `.env.develop.template` | Staging en Vercel, Atlas `app_develop` | `.env.develop` |
| `.env.production.template` | Producción en Vercel, Atlas `app_production` | `.env.production` |

```bash
# Primera vez configurando un entorno:
cp apps/web/.env.local.template      apps/web/.env.local
cp apps/web/.env.develop.template    apps/web/.env.develop
cp apps/web/.env.production.template apps/web/.env.production
```

Los archivos `.env.*` reales están en `.gitignore` — nunca se commitean.
Los archivos `.env.*.template` SÍ se commitean (solo tienen placeholders, sin valores reales).
