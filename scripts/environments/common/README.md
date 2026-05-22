# Common Utilities - Environment Scripts

## 📋 Descripción
Utilidades compartidas para todos los entornos (local, staging, production).

## 🛠️ Utilidades Disponibles

### 1. **Verificación de requisitos**
- Verificar Node.js, Yarn, Git, etc.
- Verificar versiones mínimas
- Verificar herramientas específicas por entorno

### 2. **Funciones de ayuda**
- Logging con colores
- Manejo de errores
- Validación de input
- Formateo de output

### 3. **Limpieza de entornos**
- Limpieza SOFT: Archivos temporales, caches, node_modules
- Limpieza HARD: Configuraciones, datos, dependencias (destructivo)
- Menú interactivo para selección segura

### 4. **Plantillas y configuraciones**
- Plantillas reutilizables
- Configuraciones base
- Estructuras comunes

## 📁 Estructura

```
scripts/environments/common/
├── README.md                    # Esta documentación
├── utils.sh                     # Funciones utilitarias
├── requirements.sh              # Verificación de requisitos
├── cleanup.sh                   # Menú principal de limpieza
├── cleanup-soft.sh              # Limpieza SOFT (seguro)
├── cleanup-hard.sh              # Limpieza HARD (destructivo)
├── templates/                   # Plantillas comunes
│   ├── .env.base               # Variables base
│   ├── mongodb-connection.txt  # Plantilla conexión MongoDB
│   └── oauth-config.txt        # Plantilla configuración OAuth
└── docs/                       # Documentación común
    ├── troubleshooting.md      # Solución de problemas
    └── best-practices.md       # Mejores prácticas
```

## 🚀 Uso Rápido

### Incluir utilidades en scripts:
```bash
# En tus scripts de entorno
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMMON_DIR="$SCRIPT_DIR/../common"

# Cargar utilidades
source "$COMMON_DIR/utils.sh"
source "$COMMON_DIR/requirements.sh"
```

### Ejemplo de script usando utilidades:
```bash
#!/bin/bash

# Cargar utilidades comunes
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../common/utils.sh"
source "$SCRIPT_DIR/../common/requirements.sh"

# Usar funciones
print_section "Configuración de entorno"
check_node_version 18
check_yarn_installed

# Continuar con configuración específica...
```

### Ejemplo de limpieza:
```bash
# Menú interactivo de limpieza
./scripts/environments/common/cleanup.sh

# Solo limpieza SOFT
./scripts/environments/common/cleanup-soft.sh

# Limpieza HARD (¡peligroso!)
./scripts/environments/common/cleanup-hard.sh
```

## 🔧 Funciones Disponibles

### Logging y output:
```bash
# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funciones
print_section "Título de sección"
print_info "Mensaje informativo"
print_success "Operación exitosa"
print_warning "Advertencia"
print_error "Error crítico"
```

### Verificación de requisitos:
```bash
# Verificar herramientas
check_command "node"
check_command "yarn"
check_command "git"

# Verificar versiones
check_node_version 18
check_npm_version 8
check_yarn_version 1.22

# Verificar servicios
check_port_available 9001
check_port_available 27017
```

### Manejo de errores:
```bash
# Exit on error
set -e

# Trap para limpieza
setup_error_trap

# Función de limpieza
cleanup() {
    # Limpiar recursos
    echo "Limpiando..."
}
```

### Input y validación:
```bash
# Preguntas con confirmación
confirm "¿Continuar?"
read_input "Ingresa tu nombre: " NAME

# Validación
validate_email "usuario@example.com"
validate_url "https://example.com"
validate_port "9001"
```

### Limpieza de entornos:
```bash
# Menú interactivo
./cleanup.sh

# Limpieza SOFT (recomendado)
./cleanup-soft.sh

# Limpieza HARD (¡ADVERTENCIA! destructivo)
./cleanup-hard.sh
```

## 🧹 Limpieza de Entornos

### Diferencias entre SOFT y HARD:

**🧹 LIMPIEZA SOFT (recomendado para uso regular):**
- ✅ Elimina: `node_modules`, caches, archivos temporales, builds
- ✅ Mantiene: Configuraciones (`.env`), datos, código fuente
- ✅ Reversible: `yarn install` restaura todo
- ✅ Uso: Entre sesiones de desarrollo, para liberar espacio

**☢️ LIMPIEZA HARD (solo para casos extremos):**
- 🔴 Elimina: TODO (`node_modules`, `.env`, datos, builds, caches, lock files)
- 🔴 Mantiene: Solo código fuente en git
- 🔴 Irreversible: Requiere reconfiguración completa
- 🔴 Uso: Corrupción de dependencias, cambios mayores, reset completo

### Cuándo usar cada una:

| Situación | Recomendación | Tiempo restauración |
|-----------|---------------|---------------------|
| Liberar espacio en disco | 🧹 SOFT | 2-5 minutos |
| Problemas con dependencias | 🧹 SOFT | 2-5 minutos |
| Cache corrupto | 🧹 SOFT | 2-5 minutos |
| Cambio mayor de versión | ☢️ HARD | 10-30 minutos |
| Corrupción grave | ☢️ HARD | 10-30 minutos |
| Reset completo | ☢️ HARD | 10-30 minutos |

### Comandos rápidos:
```bash
# Desde la raíz del proyecto
./scripts/environments/common/cleanup.sh      # Menú interactivo
./scripts/environments/common/cleanup-soft.sh # Limpieza SOFT directa
./scripts/environments/common/cleanup-hard.sh # Limpieza HARD directa (¡cuidado!)
```

## 📋 Plantillas Comunes

### Variables de entorno base (`.env.base`):
```env
# ============================================
# BASE ENVIRONMENT VARIABLES
# ============================================
# Plantilla base para todos los entornos

# Application
INSTANCE=[INSTANCE_NAME]
NODE_ENV=[ENVIRONMENT]

# Database
MONGODB_URI=[DATABASE_CONNECTION_STRING]

# Authentication
AUTH_MODE=required
AUTH_PROVIDERS=email

# Logging
LOG_LEVEL=info

# Theme
PRIMARY_COLOR=3b82f6
SECONDARY_COLOR=10b981
BACKGROUND_COLOR=ffffff
TEXT_COLOR=1f2937
FONT_FAMILY=Manrope
```

### Conexión MongoDB (`mongodb-connection.txt`):
```
# MongoDB Connection String Template
# ==================================

Local Development:
  mongodb://localhost:27017/[database-name]

MongoDB Atlas (Staging):
  mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database]?retryWrites=true&w=majority

MongoDB Atlas (Production):
  mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database]?retryWrites=true&w=majority&maxPoolSize=20

Docker:
  mongodb://admin:secret@localhost:27017
```

### Configuración OAuth (`oauth-config.txt`):
```
# OAuth Configuration Template
# ============================

Google OAuth:
  - Client ID: [GOOGLE_CLIENT_ID]
  - Client Secret: [GOOGLE_CLIENT_SECRET]
  - Authorized JavaScript origins: [APP_URL]
  - Authorized redirect URIs: [APP_URL]/api/auth/callback/google

Facebook OAuth:
  - App ID: [FACEBOOK_APP_ID]
  - App Secret: [FACEBOOK_APP_SECRET]
  - App Domains: [APP_DOMAIN]
  - Site URL: [APP_URL]
```

## 🧪 Testing de Utilidades

### Ejecutar tests:
```bash
# Desde scripts/environments/common
./test-utils.sh
```

### Coverage:
- Funciones de logging
- Verificación de requisitos
- Validación de input
- Manejo de errores

## 🔄 Mantenimiento

### Actualizar utilidades:
1. **Modificar** funciones en `utils.sh` o `requirements.sh`
2. **Probar** cambios con `./test-utils.sh`
3. **Actualizar** documentación en README
4. **Notificar** a otros entornos de cambios

### Versionado:
- **v1.0.0**: Funciones base
- **v1.1.0**: Mejoras en validación
- **v1.2.0**: Plantillas adicionales

### Dependencias:
- **Bash 4.0+**: Para arrays asociativos
- **Core utilities**: grep, sed, awk
- **Herramientas específicas**: node, yarn, git (verificadas)

## 🛠️ Solución de Problemas

### "source: command not found":
```bash
# En algunos sistemas, usar '.' en lugar de 'source'
. "$COMMON_DIR/utils.sh"
```

### "Permission denied":
```bash
# Dar permisos de ejecución
chmod +x scripts/environments/common/*.sh
```

### "Variable not found":
```bash
# Asegurar que se carguen las utilidades primero
source "$COMMON_DIR/utils.sh"
```

### "Color codes not working":
```bash
# Algunas terminals no soportan colores
# Usar variables sin color como fallback
if [ -t 1 ]; then
    # Terminal soporta colores
    GREEN='\033[0;32m'
else
    # Terminal no soporta colores
    GREEN=''
fi
```

## 🔗 Integración con Entornos

### Local:
```bash
# scripts/environments/local/setup.sh
source "../common/utils.sh"
source "../common/requirements.sh"

print_section "Configuración Local"
check_node_version 18
# ... configuración específica local
```

### Staging:
```bash
# scripts/environments/staging/setup.sh
source "../common/utils.sh"
source "../common/requirements.sh"

print_section "Configuración Staging"
check_command "vercel"
# ... configuración específica staging
```

### Production:
```bash
# scripts/environments/production/setup.sh
source "../common/utils.sh"
source "../common/requirements.sh"

print_section "Configuración Production"
check_domain_configuration
# ... configuración específica production
```

## 📞 Soporte

- **Documentación**: Este archivo
- **Ejemplos**: En directorios de entornos
- **Issues**: Reportar en repositorio
- **Contribuciones**: Pull requests welcome

---

**Nota**: Las utilidades comunes deben mantenerse compatibles con todos los entornos. Cambios deben probarse en local, staging y production.
