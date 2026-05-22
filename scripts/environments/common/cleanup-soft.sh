#!/bin/bash

# Script de limpieza SOFT para entornos
# Elimina archivos temporales, caches, y dependencias de node_modules
# pero mantiene configuraciones y datos importantes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Cargar utilidades
source "$SCRIPT_DIR/utils.sh"

print_section "🧹 LIMPIEZA SOFT de entorno"
echo "Elimina archivos temporales, caches y node_modules"
echo "Mantiene configuraciones, datos y archivos importantes"
echo "======================================================"

# Función para preguntar confirmación
confirm() {
    read -p "$1 [s/N]: " -n 1 -r
    echo
    [[ $REPLY =~ ^[Ss]$ ]]
}

# Función para limpiar directorio específico
clean_directory() {
    local dir="$1"
    local description="$2"
    
    if [ -d "$dir" ]; then
        print_info "Limpiando $description..."
        echo "Directorio: $dir"
        
        # Mostrar tamaño antes
        local size_before=$(du -sh "$dir" 2>/dev/null | cut -f1 || echo "0B")
        echo "Tamaño antes: $size_before"
        
        # Limpiar
        rm -rf "$dir"/*
        rm -rf "$dir"/.* 2>/dev/null || true  # Archivos ocultos
        
        # Crear .gitkeep si no existe
        touch "$dir/.gitkeep" 2>/dev/null || true
        
        print_success "✅ $description limpiado"
    else
        print_warning "⚠️  Directorio no encontrado: $dir"
    fi
}

# Función para limpiar archivos específicos
clean_files() {
    local pattern="$1"
    local description="$2"
    
    print_info "Buscando $description..."
    local files=$(find "$PROJECT_ROOT" -name "$pattern" -type f 2>/dev/null | head -20)
    
    if [ -n "$files" ]; then
        echo "Archivos encontrados:"
        echo "$files" | while read -r file; do
            echo "  - $file"
        done
        
        if confirm "¿Eliminar estos archivos?"; then
            find "$PROJECT_ROOT" -name "$pattern" -type f -delete 2>/dev/null
            print_success "✅ $description eliminados"
        else
            print_info "⏭️  Saltando $description"
        fi
    else
        print_success "✅ No se encontraron $description"
    fi
}

# Función para limpiar cache específico
clean_cache() {
    local cache_dir="$1"
    local description="$2"
    
    if [ -d "$cache_dir" ]; then
        print_info "Limpiando cache de $description..."
        local size_before=$(du -sh "$cache_dir" 2>/dev/null | cut -f1 || echo "0B")
        echo "Tamaño antes: $size_before"
        
        rm -rf "$cache_dir"/*
        print_success "✅ Cache de $description limpiado"
    fi
}

# Menú principal
print_subsection "Opciones de limpieza SOFT"
echo "Selecciona qué limpiar:"
echo "1. ✅ Limpieza COMPLETA SOFT (recomendado)"
echo "2. 📦 Solo node_modules y dependencias"
echo "3. 🗑️  Solo archivos temporales y caches"
echo "4. 🧪 Solo archivos de testing"
echo "5. 🚪 Salir"

read -p "Opción [1]: " OPTION
OPTION=${OPTION:-1}

case $OPTION in
    "1")
        # Limpieza COMPLETA SOFT
        print_section "LIMPIEZA COMPLETA SOFT"
        
        if ! confirm "¿Realizar limpieza COMPLETA SOFT? Esto eliminará node_modules, caches y archivos temporales."; then
            print_info "Limpieza cancelada"
            exit 0
        fi
        
        # 1. node_modules en todo el proyecto
        print_subsection "1. Limpiando node_modules"
        find "$PROJECT_ROOT" -name "node_modules" -type d -exec echo "  - {}" \; | head -20
        if confirm "¿Eliminar todos los node_modules?"; then
            find "$PROJECT_ROOT" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null
            print_success "✅ Todos los node_modules eliminados"
        fi
        
        # 2. Limpiar .next (Next.js build)
        print_subsection "2. Limpiando builds de Next.js"
        clean_directory "$PROJECT_ROOT/apps/web/.next" "build de Next.js"
        
        # 3. Limpiar .expo (Expo cache)
        print_subsection "3. Limpiando cache de Expo"
        clean_directory "$PROJECT_ROOT/apps/mobile/.expo" "cache de Expo"
        clean_directory "$PROJECT_ROOT/.expo" "cache global de Expo"
        
        # 4. Limpiar yarn/npm caches
        print_subsection "4. Limpiando caches de package managers"
        if command -v yarn &> /dev/null; then
            print_info "Limpiando cache de Yarn..."
            yarn cache clean --force
            print_success "✅ Cache de Yarn limpiado"
        fi
        
        if command -v npm &> /dev/null; then
            print_info "Limpiando cache de npm..."
            npm cache clean --force
            print_success "✅ Cache de npm limpiado"
        fi
        
        # 5. Limpiar archivos temporales
        print_subsection "5. Limpiando archivos temporales"
        clean_files "*.log" "archivos de log"
        clean_files "*.tmp" "archivos temporales"
        clean_files "*.temp" "archivos temporales"
        clean_files "*.swp" "archivos swap de vim"
        clean_files "*.swo" "archivos swap de vim"
        
        # 6. Limpiar coverage reports
        print_subsection "6. Limpiando reports de coverage"
        clean_directory "$PROJECT_ROOT/coverage" "coverage reports"
        clean_files "lcov.info" "report de lcov"
        
        # 7. Limpiar dist/build directories
        print_subsection "7. Limpiando directorios de build"
        find "$PROJECT_ROOT" -name "dist" -type d -exec echo "  - {}" \; | head -10
        if confirm "¿Eliminar directorios dist?"; then
            find "$PROJECT_ROOT" -name "dist" -type d -exec rm -rf {} + 2>/dev/null
            print_success "✅ Directorios dist eliminados"
        fi
        
        find "$PROJECT_ROOT" -name "build" -type d -exec echo "  - {}" \; | head -10
        if confirm "¿Eliminar directorios build?"; then
            find "$PROJECT_ROOT" -name "build" -type d -exec rm -rf {} + 2>/dev/null
            print_success "✅ Directorios build eliminados"
        fi
        
        # 8. Limpiar lock files (opcional)
        print_subsection "8. Limpiando lock files"
        if confirm "¿Regenerar yarn.lock y package-lock.json?"; then
            rm -f "$PROJECT_ROOT/yarn.lock"
            rm -f "$PROJECT_ROOT/package-lock.json"
            find "$PROJECT_ROOT" -name "yarn.lock" -type f -delete 2>/dev/null
            find "$PROJECT_ROOT" -name "package-lock.json" -type f -delete 2>/dev/null
            print_success "✅ Lock files eliminados"
        fi
        ;;
    
    "2")
        # Solo node_modules y dependencias
        print_section "Limpieza de node_modules y dependencias"
        
        if ! confirm "¿Eliminar todos los node_modules?"; then
            exit 0
        fi
        
        print_info "Buscando node_modules..."
        local node_modules_count=$(find "$PROJECT_ROOT" -name "node_modules" -type d | wc -l)
        echo "Encontrados: $node_modules_count directorios node_modules"
        
        if [ "$node_modules_count" -gt 0 ]; then
            find "$PROJECT_ROOT" -name "node_modules" -type d | head -10 | while read -r dir; do
                local size=$(du -sh "$dir" 2>/dev/null | cut -f1 || echo "0B")
                echo "  - $dir ($size)"
            done
            
            if confirm "¿Eliminar estos $node_modules_count directorios node_modules?"; then
                find "$PROJECT_ROOT" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null
                print_success "✅ Todos los node_modules eliminados"
                
                # También limpiar lock files
                if confirm "¿Eliminar también lock files (yarn.lock, package-lock.json)?"; then
                    rm -f "$PROJECT_ROOT/yarn.lock"
                    rm -f "$PROJECT_ROOT/package-lock.json"
                    print_success "✅ Lock files eliminados"
                fi
            fi
        else
            print_success "✅ No se encontraron node_modules"
        fi
        ;;
    
    "3")
        # Solo archivos temporales y caches
        print_section "Limpieza de archivos temporales y caches"
        
        print_subsection "1. Caches de aplicaciones"
        clean_directory "$PROJECT_ROOT/apps/web/.next" "Next.js cache"
        clean_directory "$PROJECT_ROOT/apps/mobile/.expo" "Expo cache"
        clean_directory "$PROJECT_ROOT/.expo" "Expo global cache"
        
        print_subsection "2. Caches de package managers"
        if command -v yarn &> /dev/null; then
            yarn cache clean --force
            print_success "✅ Yarn cache limpiado"
        fi
        
        if command -v npm &> /dev/null; then
            npm cache clean --force
            print_success "✅ npm cache limpiado"
        fi
        
        print_subsection "3. Archivos temporales"
        clean_files "*.log" "archivos de log"
        clean_files "*.tmp" "archivos temporales"
        clean_files "*.temp" "archivos temporales"
        clean_files "*.swp" "archivos swap de vim"
        clean_files "*.swo" "archivos swap de vim"
        
        print_subsection "4. Directorios de cache del sistema"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            clean_cache "$HOME/Library/Caches" "sistema macOS"
            clean_cache "/private/var/folders" "temp folders macOS" 2>/dev/null || true
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            clean_cache "$HOME/.cache" "sistema Linux"
        fi
        ;;
    
    "4")
        # Solo archivos de testing
        print_section "Limpieza de archivos de testing"
        
        print_subsection "1. Coverage reports"
        clean_directory "$PROJECT_ROOT/coverage" "coverage reports"
        clean_files "lcov.info" "lcov reports"
        clean_files "coverage-final.json" "coverage JSON"
        clean_files "*.coverage" "coverage files"
        
        print_subsection "2. Test results"
        clean_files "test-results.xml" "test results XML"
        clean_files "junit.xml" "JUnit results"
        clean_files "*.test-report" "test reports"
        clean_directory "$PROJECT_ROOT/test-results" "test results directory"
        
        print_subsection "3. Snapshots obsoletos"
        if confirm "¿Buscar y limpiar snapshots obsoletos de Jest?"; then
            if command -v jest &> /dev/null; then
                cd "$PROJECT_ROOT"
                jest --clearCache
                print_success "✅ Cache de Jest limpiado"
            fi
            
            clean_files "*.snap" "snapshots"  # Con cuidado
            print_warning "⚠️  Snapshots eliminados - puede afectar tests"
        fi
        
        print_subsection "4. Playwright/Vite caches"
        clean_directory "$PROJECT_ROOT/playwright-report" "Playwright reports"
        clean_directory "$PROJECT_ROOT/test-results" "test results"
        clean_directory "$PROJECT_ROOT/.vite" "Vite cache"
        ;;
    
    "5")
        print_info "Saliendo..."
        exit 0
        ;;
    
    *)
        print_error "❌ Opción no válida"
        exit 1
        ;;
esac

# Resumen final
print_section "🧹 RESUMEN de limpieza SOFT"
echo "✅ Limpieza SOFT completada"
echo ""
echo "📋 Recomendaciones post-limpieza:"
echo "1. 📦 Instalar dependencias: yarn install"
echo "2. 🔧 Verificar configuraciones: Revisar .env files"
echo "3. 🧪 Ejecutar tests: yarn test"
echo "4. 🚀 Iniciar desarrollo: yarn dev"
echo ""
echo "💾 Espacio liberado:"
echo "- node_modules: ~200-500MB"
echo "- .next cache: ~100-300MB"
echo "- .expo cache: ~50-150MB"
echo "- System caches: ~50-200MB"
echo ""
echo "🔧 Comandos para restaurar:"
echo "- yarn install          # Instalar dependencias"
echo "- cd apps/web && yarn dev  # Iniciar web"
echo "- cd apps/mobile && expo start  # Iniciar mobile"
echo ""
echo "⚠️  NOTA: Esta es una limpieza SOFT. No elimina:"
echo "- Archivos de configuración (.env, config files)"
echo "- Datos de base de datos"
echo "- Código fuente"
echo "- Repositorio git"
echo "- Archivos importantes del proyecto"

# Preguntar si quiere instalar dependencias
if confirm "¿Instalar dependencias ahora (yarn install)?"; then
    print_info "Instalando dependencias..."
    cd "$PROJECT_ROOT"
    yarn install
    print_success "✅ Dependencias instaladas"
fi

print_section "✅ LIMPIEZA SOFT FINALIZADA"