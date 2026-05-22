#!/bin/bash

# Script de limpieza HARD para entornos
# Elimina TODO: node_modules, configuraciones, datos, builds, caches
# ¡ADVERTENCIA! Esto es DESTRUCTIVO. Solo usar cuando sea necesario.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Cargar utilidades
source "$SCRIPT_DIR/utils.sh"

print_section "☢️  LIMPIEZA HARD de entorno"
echo "⚠️  ⚠️  ⚠️  ADVERTENCIA CRÍTICA ⚠️  ⚠️  ⚠️"
echo "Este script ELIMINARÁ:"
echo "- TODAS las dependencias (node_modules)"
echo "- TODAS las configuraciones (.env files)"
echo "- TODOS los datos locales (MongoDB, SQLite)"
echo "- TODOS los builds y caches"
echo "- Archivos de lock (yarn.lock, package-lock.json)"
echo ""
echo "🔴 ESTA ACCIÓN ES IRREVERSIBLE 🔴"
echo "======================================================"

# Función para preguntar confirmación EXTRA
confirm_hard() {
    local prompt="$1"
    echo -e "${RED}❓ $prompt${NC}"
    read -p "Escribe 'ELIMINAR' para confirmar: " -r
    echo
    [[ "$REPLY" == "ELIMINAR" ]]
}

# Verificar que el usuario realmente quiere esto
if ! confirm_hard "¿Estás ABSOLUTAMENTE SEGURO de realizar limpieza HARD?"; then
    print_info "Limpieza HARD cancelada. Usa cleanup-soft.sh para limpieza segura."
    exit 0
fi

# Segunda confirmación
echo ""
echo "📋 Lista de lo que se ELIMINARÁ:"
echo "1. 📦 TODOS los node_modules (~500MB-1GB)"
echo "2. ⚙️  TODAS las configuraciones .env"
echo "3. 🗄️  TODOS los datos locales (MongoDB, SQLite)"
echo "4. 🏗️  TODOS los builds (.next, dist, build)"
echo "5. 🗑️  TODOS los caches (.expo, yarn, npm)"
echo "6. 🔒 TODOS los lock files"
echo "7. 🧪 TODOS los reports de testing"
echo "8. 📝 ALGUNOS archivos de log y temporales"
echo ""

if ! confirm_hard "¿CONFIRMAS la eliminación de TODO lo anterior?"; then
    print_info "Limpieza HARD cancelada."
    exit 0
fi

# Tercera confirmación - última oportunidad
echo ""
echo "🚨 ÚLTIMA OPORTUNIDAD PARA CANCELAR 🚨"
echo "Esta acción:"
echo "- ❌ NO se puede deshacer"
echo "- ❌ Requerirá reconfiguración COMPLETA"
echo "- ❌ Eliminará datos de desarrollo"
echo "- ❌ Tomará tiempo restaurar"
echo ""

if ! confirm_hard "¿FINALMENTE confirmas la LIMPIEZA HARD TOTAL?"; then
    print_info "Limpieza HARD cancelada en el último momento."
    exit 0
fi

# Iniciar limpieza HARD
print_section "🚀 INICIANDO LIMPIEZA HARD"

# 1. ELIMINAR TODOS los node_modules
print_subsection "1. ELIMINANDO node_modules"
print_info "Buscando todos los node_modules..."
NODE_MODULES_COUNT=0

# Contar y listar
find "$PROJECT_ROOT" -name "node_modules" -type d | while read -r dir; do
    NODE_MODULES_COUNT=$((NODE_MODULES_COUNT + 1))
    SIZE=$(du -sh "$dir" 2>/dev/null | cut -f1 || echo "0B")
    echo "  [$NODE_MODULES_COUNT] $dir ($SIZE)"
done

echo "Total: $NODE_MODULES_COUNT directorios node_modules"

print_info "ELIMINANDO node_modules..."
find "$PROJECT_ROOT" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null
print_success "✅ TODOS los node_modules ELIMINADOS"

# 2. ELIMINAR configuraciones .env
print_subsection "2. ELIMINANDO configuraciones .env"
print_info "Buscando archivos .env..."

ENV_FILES=$(find "$PROJECT_ROOT" -name ".env*" -type f ! -name "*.example" ! -name "*.template" ! -name "*.sample" 2>/dev/null)
ENV_COUNT=$(echo "$ENV_FILES" | wc -l)

if [ "$ENV_COUNT" -gt 0 ]; then
    echo "Archivos .env encontrados ($ENV_COUNT):"
    echo "$ENV_FILES" | while read -r file; do
        echo "  - $file"
    done
    
    print_info "ELIMINANDO archivos .env..."
    echo "$ENV_FILES" | while read -r file; do
        rm -f "$file"
        echo "  ✅ Eliminado: $file"
    done
    print_success "✅ TODAS las configuraciones .env ELIMINADAS"
    
    # Crear backups de las plantillas si existen
    print_info "Creando backups de plantillas..."
    find "$PROJECT_ROOT" -name ".env*.example" -o -name ".env*.template" -o -name ".env*.sample" | while read -r template; do
        BACKUP="${template}.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$template" "$BACKUP"
        echo "  📋 Backup: $BACKUP"
    done
else
    print_success "✅ No se encontraron archivos .env (ya están en .gitignore)"
fi

# 3. ELIMINAR datos locales
print_subsection "3. ELIMINANDO datos locales"

# MongoDB data
print_info "Buscando datos de MongoDB..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    MONGODB_DATA_DIRS=(
        "/usr/local/var/mongodb"
        "$HOME/.mongodb"
        "/data/db"
    )
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    MONGODB_DATA_DIRS=(
        "/var/lib/mongodb"
        "/data/db"
        "$HOME/.mongodb"
    )
else
    MONGODB_DATA_DIRS=()
fi

for dir in "${MONGODB_DATA_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "  📁 Directorio MongoDB encontrado: $dir"
        SIZE=$(du -sh "$dir" 2>/dev/null | cut -f1 || echo "0B")
        echo "  📊 Tamaño: $SIZE"
        
        if confirm_hard "¿ELIMINAR datos de MongoDB en $dir?"; then
            # Detener servicio MongoDB primero
            if command -v brew &> /dev/null && brew services list | grep -q mongodb; then
                print_info "Deteniendo servicio MongoDB..."
                brew services stop mongodb-community 2>/dev/null || true
            fi
            
            rm -rf "$dir"/*
            print_success "  ✅ Datos MongoDB ELIMINADOS en $dir"
        fi
    fi
done

# SQLite databases
print_info "Buscando bases de datos SQLite..."
find "$PROJECT_ROOT" -name "*.db" -o -name "*.sqlite" -o -name "*.sqlite3" | while read -r db; do
    echo "  🗄️  Base de datos: $db"
    SIZE=$(du -h "$db" 2>/dev/null | cut -f1 || echo "0B")
    echo "  📊 Tamaño: $SIZE"
    
    if confirm_hard "¿ELIMINAR base de datos $db?"; then
        rm -f "$db"
        print_success "  ✅ Base de datos ELIMINADA: $db"
    fi
done

# 4. ELIMINAR builds
print_subsection "4. ELIMINANDO builds"

BUILD_DIRS=(
    "$PROJECT_ROOT/apps/web/.next"
    "$PROJECT_ROOT/apps/web/dist"
    "$PROJECT_ROOT/apps/web/build"
    "$PROJECT_ROOT/apps/mobile/build"
    "$PROJECT_ROOT/apps/mobile/dist"
    "$PROJECT_ROOT/packages/*/dist"
    "$PROJECT_ROOT/packages/*/build"
    "$PROJECT_ROOT/dist"
    "$PROJECT_ROOT/build"
)

for pattern in "${BUILD_DIRS[@]}"; do
    for dir in $pattern; do
        if [ -d "$dir" ]; then
            echo "  🏗️  Build directory: $dir"
            SIZE=$(du -sh "$dir" 2>/dev/null | cut -f1 || echo "0B")
            echo "  📊 Tamaño: $SIZE"
            
            rm -rf "$dir"
            print_success "  ✅ Build ELIMINADO: $dir"
        fi
    done
done

# 5. ELIMINAR caches
print_subsection "5. ELIMINANDO caches"

# Expo cache
print_info "Eliminando cache de Expo..."
rm -rf "$PROJECT_ROOT/.expo" 2>/dev/null
rm -rf "$PROJECT_ROOT/apps/mobile/.expo" 2>/dev/null
print_success "✅ Cache de Expo ELIMINADO"

# Yarn cache
print_info "Eliminando cache de Yarn..."
if command -v yarn &> /dev/null; then
    yarn cache clean --force
    print_success "✅ Cache de Yarn ELIMINADO"
fi

# npm cache
print_info "Eliminando cache de npm..."
if command -v npm &> /dev/null; then
    npm cache clean --force
    print_success "✅ Cache de npm ELIMINADO"
fi

# System caches
print_info "Eliminando caches del sistema..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    rm -rf ~/Library/Caches/* 2>/dev/null || true
    print_success "✅ Caches de macOS ELIMINADOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    rm -rf ~/.cache/* 2>/dev/null || true
    print_success "✅ Caches de Linux ELIMINADOS"
fi

# 6. ELIMINAR lock files
print_subsection "6. ELIMINANDO lock files"
print_info "Eliminando archivos de lock..."
rm -f "$PROJECT_ROOT/yarn.lock" 2>/dev/null
rm -f "$PROJECT_ROOT/package-lock.json" 2>/dev/null
find "$PROJECT_ROOT" -name "yarn.lock" -type f -delete 2>/dev/null
find "$PROJECT_ROOT" -name "package-lock.json" -type f -delete 2>/dev/null
print_success "✅ Lock files ELIMINADOS"

# 7. ELIMINAR reports de testing
print_subsection "7. ELIMINANDO reports de testing"
print_info "Eliminando reports de testing..."
rm -rf "$PROJECT_ROOT/coverage" 2>/dev/null
rm -rf "$PROJECT_ROOT/test-results" 2>/dev/null
rm -rf "$PROJECT_ROOT/playwright-report" 2>/dev/null
rm -rf "$PROJECT_ROOT/.nyc_output" 2>/dev/null
find "$PROJECT_ROOT" -name "*.log" -type f -delete 2>/dev/null
find "$PROJECT_ROOT" -name "lcov.info" -type f -delete 2>/dev/null
find "$PROJECT_ROOT" -name "coverage-final.json" -type f -delete 2>/dev/null
find "$PROJECT_ROOT" -name "junit.xml" -type f -delete 2>/dev/null
find "$PROJECT_ROOT" -name "test-results.xml" -type f -delete 2>/dev/null
print_success "✅ Reports de testing ELIMINADOS"

# 8. ELIMINAR archivos temporales
print_subsection "8. ELIMINANDO archivos temporales"
print_info "Eliminando archivos temporales..."
find "$PROJECT_ROOT" -name "*.tmp" -type f -delete 2>/dev/null
find "$PROJECT_ROOT" -name "*.temp" -type f -delete 2>/dev/null
find "$PROJECT_ROOT" -name "*.swp" -type f -delete 2>/dev/null
find "$PROJECT_ROOT" -name "*.swo" -type f -delete 2>/dev/null
find "$PROJECT_ROOT" -name ".DS_Store" -type f -delete 2>/dev/null
find "$PROJECT_ROOT" -name "Thumbs.db" -type f -delete 2>/dev/null
print_success "✅ Archivos temporales ELIMINADOS"

# 9. Limpieza EXTRA opcional
print_subsection "9. Limpieza EXTRA (opcional)"

if confirm_hard "¿Realizar limpieza EXTRA (git clean, docker, etc.)?"; then
    # Git clean
    print_info "Ejecutando git clean..."
    cd "$PROJECT_ROOT"
    git clean -fdx -e "!.vscode" -e "!.idea" 2>/dev/null || true
    print_success "✅ Git clean ejecutado"
    
    # Docker cleanup
    print_info "Limpiando Docker..."
    if command -v docker &> /dev/null; then
        docker system prune -af 2>/dev/null || true
        docker volume prune -f 2>/dev/null || true
        print_success "✅ Docker limpiado"
    fi
    
    # VSCode/IDE caches
    print_info "Limpiando caches de IDEs..."
    rm -rf "$PROJECT_ROOT/.vscode"/* 2>/dev/null || true
    rm -rf "$PROJECT_ROOT/.idea"/* 2>/dev/null || true
    print_success "✅ Caches de IDEs limpiados"
fi

# Resumen final
print_section "☢️  RESUMEN de limpieza HARD"
echo "🔴 LIMPIEZA HARD COMPLETADA 🔴"
echo ""
echo "📊 ELIMINADO:"
echo "✅ $NODE_MODULES_COUNT directorios node_modules"
echo "✅ $ENV_COUNT archivos de configuración .env"
echo "✅ Todos los builds y distribuciones"
echo "✅ Todos los caches (Expo, Yarn, npm, sistema)"
echo "✅ Todos los lock files"
echo "✅ Todos los reports de testing"
echo "✅ Todos los archivos temporales"
echo ""
echo "🚨 EL PROYECTO HA SIDO RESTABLECIDO A ESTADO VIRGEN 🚨"
echo ""
echo "📋 PASOS CRÍTICOS para restaurar:"
echo "1. 📦 Instalar dependencias: yarn install"
echo "2. ⚙️  Configurar entorno: Copiar .env.example a .env.local"
echo "3. 🗄️  Configurar base de datos: Iniciar MongoDB"
echo "4. 🔧 Configurar cada app: Revisar configuraciones individuales"
echo "5. 🧪 Ejecutar tests: yarn test"
echo ""
echo "⏱️  Tiempo estimado de restauración: 10-30 minutos"
echo ""
echo "🔧 Comandos de restauración:"
echo "cd $PROJECT_ROOT"
echo "yarn install                    # Instalar dependencias"
echo "cp apps/web/.env.example apps/web/.env.local  # Config web"
echo "cp apps/mobile/.env.example apps/mobile/.env.local  # Config mobile"
echo "brew services start mongodb-community  # Iniciar MongoDB (macOS)"
echo "yarn dev                         # Iniciar desarrollo"
echo ""
echo "📞 Soporte necesario:"
echo "- Revisar documentación en scripts/environments/local/README.md"
echo "- Revisar plantillas en scripts/environments/local/templates/"
echo "- Ejecutar scripts de setup: ./scripts/environments/local/setup.sh"
echo ""
echo "⚠️  ADVERTENCIA FINAL:"
echo "Si tienes datos importantes que no estaban en git,"
echo "¡HAN SIDO ELIMINADOS PERMANENTEMENTE!"

# Crear archivo de restauración
RESTORE_FILE="$PROJECT_ROOT/RESTORE_AFTER_HARD_CLEANUP.md"
cat > "$RESTORE_FILE" << 'EOF'
# 🚀 GUÍA DE RESTAURACIÓN después de limpieza HARD

## 📋 Qué se eliminó:
- TODAS las dependencias (node_modules)
- TODAS las configuraciones (.env files)  
- TODOS los datos locales (MongoDB, SQLite)
- TODOS los builds y caches
- TODOS los lock files
- TODOS los reports de testing

## 🔧 Pasos de restauración:

### 1. Instalar dependencias
```bash
cd /ruta/al/proyecto
yarn install
```

### 2. Configurar entorno local
```bash
# Web app
cp apps/web/.env.example apps/web/.env.local

# Mobile app  
cp apps/mobile/.env.example apps/mobile/.env.local

# Revisar y configurar variables según necesidad
```

### 3. Configurar base de datos
```bash
# macOS con Homebrew
brew services start mongodb-community

# Verificar conexión
mongosh
```

### 4. Configurar cada entorno
```bash
# Desarrollo local (emuladores)
./scripts/environments/local/setup.sh

# Staging (Vercel)
./scripts/environments/staging/setup.sh
```

### 5. Iniciar desarrollo
```bash
# Web app
cd apps/web && yarn dev

# Mobile app (emulador)
cd apps/mobile && expo start
```

## 📞 Recursos:
- Documentación local: `scripts/environments/local/README.md`
- Plantillas: `scripts/environments/local/templates/`
- Utilidades: `scripts/environments/common/`

## ⚠️ Notas importantes:
- Los datos de desarrollo se perdieron permanentemente
- Las configuraciones deben recrearse desde plantillas
- Puede tomar 10-30 minutos restaurar completamente

## 🔗 Enlaces útiles:
- Next.js Docs: https://nextjs.org/docs
- Expo Docs: https://docs.expo.dev
- MongoDB Docs: https://docs.mongodb.com
EOF

print_success "📝 Guía de restauración creada en: $RESTORE_FILE"

# Preguntar si quiere comenzar restauración
print_section "🔄 INICIAR RESTAURACIÓN"
if confirm_hard "¿Comenzar proceso de restauración AHORA?"; then
    print_info "Iniciando restauración..."
    
    # 1. Instalar dependencias
    print_subsection "1. Instalando dependencias..."
    cd "$PROJECT_ROOT"
    yarn install
    print_success "✅ Dependencias instaladas"
    
    # 2. Mostrar próximos pasos
    print_subsection "2. Próximos pasos manuales:"
    echo "📋 Debes realizar manualmente:"
    echo "1. ⚙️  Configurar archivos .env.local desde .env.example"
    echo "2. 🗄️  Iniciar base de datos MongoDB"
    echo "3. 🔧 Ejecutar scripts de setup específicos"
    echo ""
    echo "💡 Usa: ./scripts/environments/local/setup.sh"
    
else
    print_info "Restauración diferida. Usa la guía en $RESTORE_FILE"
fi

print_section "✅ LIMPIEZA HARD FINALIZADA"
echo "🔴 Proceso completado. El proyecto está en estado virgen."
echo "📝 Guía de restauración: $RESTORE_FILE"
echo "🚀 Buena suerte con la restauración!"