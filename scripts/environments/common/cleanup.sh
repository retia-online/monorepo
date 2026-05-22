#!/bin/bash

# Script wrapper principal para limpieza de entornos
# Ofrece opciones de limpieza SOFT y HARD

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Cargar utilidades
source "$SCRIPT_DIR/utils.sh"

print_section "🧹 SISTEMA DE LIMPIEZA de entornos"
echo "Selecciona el tipo de limpieza:"
echo "=========================================="

# Función para mostrar diferencias
show_differences() {
    print_subsection "📊 DIFERENCIAS entre limpieza SOFT y HARD"
    echo ""
    echo "🧹 LIMPIEZA SOFT (recomendado):"
    echo "✅ Elimina: node_modules, caches, archivos temporales"
    echo "✅ Mantiene: Configuraciones (.env), datos, código fuente"
    echo "✅ Reversible: Fácil restaurar (yarn install)"
    echo "✅ Uso: Regular, entre sesiones de desarrollo"
    echo ""
    echo "☢️  LIMPIEZA HARD (peligroso):"
    echo "🔴 Elimina: TODO (node_modules, configs, datos, builds, caches)"
    echo "🔴 Mantiene: Solo código fuente en git"
    echo "🔴 Irreversible: Requiere reconfiguración completa"
    echo "🔴 Uso: Solo en casos extremos (corrupción, cambios mayores)"
    echo ""
    echo "⏱️  Tiempo de restauración:"
    echo "- SOFT: 2-5 minutos (solo yarn install)"
    echo "- HARD: 10-30 minutos (reconfiguración completa)"
}

# Mostrar diferencias primero
show_differences

# Menú principal
print_subsection "🎯 SELECCIONA tipo de limpieza"
echo "1. 🧹 Limpieza SOFT (seguro, recomendado)"
echo "2. ☢️  Limpieza HARD (peligroso, destructivo)"
echo "3. 📊 Ver detalles de cada tipo"
echo "4. 🚪 Salir"

read -p "Opción [1]: " OPTION
OPTION=${OPTION:-1}

case $OPTION in
    "1")
        # Limpieza SOFT
        print_info "Ejecutando limpieza SOFT..."
        "$SCRIPT_DIR/cleanup-soft.sh"
        ;;
    
    "2")
        # Limpieza HARD
        print_section "🚨 CONFIRMACIÓN para limpieza HARD"
        echo "Estás a punto de ejecutar una limpieza HARD."
        echo "Esto ELIMINARÁ configuraciones, datos y dependencias."
        echo ""
        echo "¿Estás seguro que quieres continuar?"
        echo "1. ✅ Sí, ejecutar limpieza HARD (peligroso)"
        echo "2. 🔙 No, volver al menú principal"
        echo "3. 🧹 No, ejecutar limpieza SOFT en su lugar"
        
        read -p "Opción: " HARD_OPTION
        
        case $HARD_OPTION in
            "1")
                print_info "Ejecutando limpieza HARD..."
                "$SCRIPT_DIR/cleanup-hard.sh"
                ;;
            "2")
                print_info "Volviendo al menú principal..."
                exec "$0"  # Reiniciar script
                ;;
            "3")
                print_info "Ejecutando limpieza SOFT en su lugar..."
                "$SCRIPT_DIR/cleanup-soft.sh"
                ;;
            *)
                print_error "Opción no válida. Volviendo al menú principal."
                exec "$0"
                ;;
        esac
        ;;
    
    "3")
        # Mostrar detalles
        show_differences
        echo ""
        read -p "Presiona Enter para volver al menú..."
        exec "$0"  # Reiniciar script
        ;;
    
    "4")
        print_info "Saliendo..."
        exit 0
        ;;
    
    *)
        print_error "❌ Opción no válida"
        exit 1
        ;;
esac

# Resumen final
print_section "✅ PROCESO DE LIMPIEZA COMPLETADO"
echo "📋 Recomendaciones post-limpieza:"
echo "1. Verifica que todo funcione correctamente"
echo "2. Ejecuta tests: yarn test"
echo "3. Revisa logs si hay errores"
echo ""
echo "🔧 Scripts disponibles:"
echo "- ./scripts/environments/common/cleanup.sh      # Este menú"
echo "- ./scripts/environments/common/cleanup-soft.sh # Solo limpieza SOFT"
echo "- ./scripts/environments/common/cleanup-hard.sh # Solo limpieza HARD"
echo ""
echo "📞 Para ayuda:"
echo "- Revisa scripts/environments/common/README.md"
echo "- Ejecuta scripts de setup específicos"
echo "- Consulta la documentación del proyecto"