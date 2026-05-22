#!/bin/bash

# Script principal de configuración para entorno de staging
# Uso: ./setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Cargar utilidades comunes
source "$SCRIPT_DIR/../common/utils.sh"
source "$SCRIPT_DIR/../common/requirements.sh"

print_section "🚀 Configuración de entorno STAGING"

# Verificar requisitos para staging
print_subsection "Verificación de requisitos"
echo "Requisitos necesarios:"
REQUIREMENTS=("node" "yarn" "git")
MISSING_REQUIREMENTS=0

for req in "${REQUIREMENTS[@]}"; do
    if ! check_command "$req"; then
        MISSING_REQUIREMENTS=1
    fi
done

if [ $MISSING_REQUIREMENTS -eq 1 ]; then
    print_error "Faltan requisitos. Instala los requerimientos antes de continuar."
    exit 1
fi

print_subsection "Información del proyecto"
echo "Directorio del proyecto: $PROJECT_ROOT"
echo "Directorio de scripts: $SCRIPT_DIR"

# Verificar estructura del proyecto
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    print_error "No se encontró package.json en la raíz del proyecto"
    exit 1
fi

print_subsection "Opciones de configuración"
echo "Selecciona qué configurar:"
echo "1. ✅ Configuración completa (recomendado)"
echo "2. 🌐 Solo web app"
echo "3. 📱 Solo mobile app"
echo "4. 🗄️  Solo base de datos"
echo "5. 🔐 Solo OAuth"
echo "6. 📋 Solo plantillas"
echo "7. 🚪 Salir"

read -p "Opción [1]: " OPTION
OPTION=${OPTION:-1}

case $OPTION in
    "1")
        # Configuración completa
        print_section "Configuración completa de staging"
        
        # Web app
        if confirm "¿Configurar web app para staging?"; then
            "$SCRIPT_DIR/web/setup.sh"
        fi
        
        # Mobile app
        if confirm "¿Configurar mobile app para staging?"; then
            "$SCRIPT_DIR/mobile/setup.sh"
        fi
        
        # Database
        if confirm "¿Configurar MongoDB Atlas para staging?"; then
            "$SCRIPT_DIR/database/setup-mongodb.sh"
        fi
        
        # OAuth
        if confirm "¿Configurar OAuth providers para staging?"; then
            "$SCRIPT_DIR/oauth/setup-google.sh"
        fi
        
        # Plantillas
        if confirm "¿Copiar plantillas de configuración?"; then
            create_directory "$PROJECT_ROOT/.staging-templates"
            cp -r "$SCRIPT_DIR/templates/" "$PROJECT_ROOT/.staging-templates/"
            print_success "Plantillas copiadas a .staging-templates/"
        fi
        ;;
    
    "2")
        # Solo web app
        print_section "Configuración de web app"
        "$SCRIPT_DIR/web/setup.sh"
        ;;
    
    "3")
        # Solo mobile app
        print_section "Configuración de mobile app"
        "$SCRIPT_DIR/mobile/setup.sh"
        ;;
    
    "4")
        # Solo database
        print_section "Configuración de base de datos"
        "$SCRIPT_DIR/database/setup-mongodb.sh"
        ;;
    
    "5")
        # Solo OAuth
        print_section "Configuración de OAuth"
        "$SCRIPT_DIR/oauth/setup-google.sh"
        ;;
    
    "6")
        # Solo plantillas
        print_section "Copiando plantillas"
        create_directory "$PROJECT_ROOT/.staging-templates"
        cp -r "$SCRIPT_DIR/templates/" "$PROJECT_ROOT/.staging-templates/"
        print_success "Plantillas copiadas a .staging-templates/"
        echo "📁 Contenido:"
        ls -la "$PROJECT_ROOT/.staging-templates/"
        ;;
    
    "7")
        echo "Saliendo..."
        exit 0
        ;;
    
    *)
        print_error "Opción no válida"
        exit 1
        ;;
esac

print_section "Resumen de configuración"
print_success "Configuración de staging completada"
echo ""
echo "📋 Pasos siguientes recomendados:"
echo "1. 🔧 Revisar archivos de configuración generados"
echo "2. 🌐 Desplegar web app: ./scripts/environments/staging/deploy.sh"
echo "3. 📱 Generar APK mobile: ./scripts/environments/staging/mobile/build-apk.sh"
echo "4. 🧪 Probar la aplicación en staging"
echo "5. 📝 Documentar cualquier problema encontrado"
echo ""
echo "🔗 Recursos:"
echo "- Documentación: $SCRIPT_DIR/README.md"
echo "- Plantillas: $SCRIPT_DIR/templates/"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- MongoDB Atlas: https://cloud.mongodb.com"
echo "- Google Cloud Console: https://console.cloud.google.com"

# Preguntar si quiere continuar con deploy
if confirm "¿Deseas desplegar a Vercel ahora?"; then
    "$SCRIPT_DIR/deploy.sh"
fi