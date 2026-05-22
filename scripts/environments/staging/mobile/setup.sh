#!/bin/bash

# Script de configuración para mobile app en staging
# Uso: ./setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
MOBILE_DIR="$PROJECT_ROOT/apps/mobile"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}📱 Configuración de MOBILE APP para STAGING${NC}"
echo "=================================================="

# Función para imprimir sección
section() {
    echo -e "\n${YELLOW}📋 $1${NC}"
    echo "----------------------------------------"
}

# Función para preguntar confirmación
confirm() {
    read -p "$1 [s/N]: " -n 1 -r
    echo
    [[ $REPLY =~ ^[Ss]$ ]]
}

section "Verificación de directorio"
if [ ! -d "$MOBILE_DIR" ]; then
    echo -e "${RED}❌ No se encontró directorio de mobile app: $MOBILE_DIR${NC}"
    exit 1
fi

echo "Directorio mobile: $MOBILE_DIR"

section "Opciones de configuración"
echo "Selecciona qué configurar:"
echo "1. ✅ Variables de entorno para staging"
echo "2. 🔧 Configuración EAS (Expo Application Services)"
echo "3. 📱 Generar APK para testing"
echo "4. 🎯 Configurar para desarrollo con Expo Go"
echo "5. 🚪 Salir"

read -p "Opción [1]: " OPTION
OPTION=${OPTION:-1}

case $OPTION in
    "1")
        # Variables de entorno
        section "Configurando variables de entorno para staging"
        
        ENV_TEMPLATE="$SCRIPT_DIR/../templates/.env.mobile.staging"
        ENV_DEST="$MOBILE_DIR/.env.staging"
        ENV_LOCAL="$MOBILE_DIR/.env.local"
        
        if [ ! -f "$ENV_TEMPLATE" ]; then
            echo -e "${YELLOW}⚠️  No se encontró plantilla, creando básica...${NC}"
            
            # Crear plantilla básica
            cat > "$ENV_DEST" << 'EOF'
# ============================================
# MOBILE APP - STAGING ENVIRONMENT VARIABLES
# ============================================

INSTANCE=Retia-Staging

# Backend API
EXPO_PUBLIC_API_URL=https://retia-app-staging.vercel.app

# Authentication
EXPO_PUBLIC_AUTH_MODE=required
EXPO_PUBLIC_AUTH_METHODS=email,google

# OAuth Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID=[GOOGLE_CLIENT_ID_STAGING]
EXPO_PUBLIC_FACEBOOK_APP_ID=[FACEBOOK_APP_ID_STAGING]
EXPO_PUBLIC_ODOO_URL=https://labs.retia.vzla.online/

# App Configuration
EXPO_PUBLIC_INSTANCE=Retia-Staging
EXPO_PUBLIC_MAIN_SCREEN_MESSAGE=¡Bienvenido a Retia Staging!

# Design Configuration
EXPO_PUBLIC_PRIMARY_COLOR=6366f1
EXPO_PUBLIC_SECONDARY_COLOR=ec4899
EXPO_PUBLIC_BACKGROUND_COLOR=f8fafc
EXPO_PUBLIC_TEXT_COLOR=1e293b
EXPO_PUBLIC_FONT_FAMILY=Manrope

# Internationalization
EXPO_PUBLIC_DEFAULT_LOCALE=es
EXPO_PUBLIC_LOCALES=es,en,pt
EOF
        else
            # Copiar plantilla existente
            cp "$ENV_TEMPLATE" "$ENV_DEST"
        fi
        
        echo -e "  ✅ Variables creadas en: $ENV_DEST"
        
        # Preguntar si copiar a .env.local
        if confirm "¿Copiar también a .env.local para desarrollo?"; then
            cp "$ENV_DEST" "$ENV_LOCAL"
            echo -e "  ✅ Copiado a .env.local"
        fi
        
        # Verificar que EXPO_PUBLIC_API_URL tenga valor real
        if grep -q "\[.*\]" "$ENV_DEST"; then
            echo -e "${YELLOW}⚠️  Algunas variables tienen placeholders [VALORES]${NC}"
            echo "Edita $ENV_DEST con valores reales antes de build"
        fi
        ;;
    
    "2")
        # Configuración EAS
        section "Configurando EAS (Expo Application Services)"
        
        if ! command -v eas &> /dev/null; then
            echo -e "${RED}❌ EAS CLI no está instalado${NC}"
            echo "Instala con: npm install -g eas-cli"
            
            if confirm "¿Instalar EAS CLI ahora?"; then
                npm install -g eas-cli
            else
                exit 1
            fi
        fi
        
        echo "Verificando login a Expo..."
        if ! eas whoami &> /dev/null; then
            echo -e "${YELLOW}⚠️  No estás logueado en Expo${NC}"
            eas login
        fi
        
        # Configurar EAS para staging
        cd "$MOBILE_DIR"
        
        if [ ! -f "eas.json" ]; then
            echo "Creando eas.json..."
            
            cat > eas.json << 'EOF'
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "http://localhost:9001"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "https://retia-app-staging.vercel.app",
        "EXPO_PUBLIC_AUTH_MODE": "required",
        "EXPO_PUBLIC_AUTH_METHODS": "email,google",
        "EXPO_PUBLIC_INSTANCE": "Retia-Staging"
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "EXPO_PUBLIC_API_URL": "https://retia-app.vercel.app",
        "EXPO_PUBLIC_AUTH_MODE": "required",
        "EXPO_PUBLIC_AUTH_METHODS": "odoo,email,google",
        "EXPO_PUBLIC_INSTANCE": "Retia"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
EOF
            echo -e "  ✅ eas.json creado"
        else
            echo -e "  ✅ eas.json ya existe"
        fi
        
        # Inicializar proyecto EAS si no está inicializado
        if [ ! -f ".easignore" ]; then
            if confirm "¿Inicializar proyecto EAS?"; then
                eas init
            fi
        fi
        ;;
    
    "3")
        # Generar APK
        section "Generando APK para testing"
        
        echo "📱 Este proceso generará un APK para testing en staging"
        echo ""
        echo "Requisitos:"
        echo "1. ✅ Backend de staging desplegado en Vercel"
        echo "2. ✅ Variables de entorno configuradas"
        echo "3. ✅ Cuenta Expo configurada"
        echo ""
        
        if confirm "¿Continuar con generación de APK?"; then
            # Ejecutar script de build de APK
            if [ -f "$MOBILE_DIR/generate-staging-apk.sh" ]; then
                cd "$MOBILE_DIR"
                ./generate-staging-apk.sh
            else
                echo -e "${YELLOW}⚠️  Script generate-staging-apk.sh no encontrado${NC}"
                echo "Ejecuta primero la opción 1 para configurar variables"
            fi
        fi
        ;;
    
    "4")
        # Configurar para desarrollo con Expo Go
        section "Configurando para desarrollo con Expo Go"
        
        ENV_LOCAL="$MOBILE_DIR/.env.local"
        
        # Crear .env.local para desarrollo
        cat > "$ENV_LOCAL" << 'EOF'
# ============================================
# MOBILE APP - DESARROLLO CON STAGING
# ============================================
# Configuración para testing con Expo Go conectado a staging

INSTANCE=Retia-Staging
EXPO_PUBLIC_API_URL=https://retia-app-staging.vercel.app
EXPO_PUBLIC_AUTH_MODE=required
EXPO_PUBLIC_AUTH_METHODS=email,google
EXPO_PUBLIC_INSTANCE=Retia-Staging
EXPO_PUBLIC_MAIN_SCREEN_MESSAGE=¡Bienvenido a Retia Staging!
EXPO_PUBLIC_PRIMARY_COLOR=6366f1
EXPO_PUBLIC_SECONDARY_COLOR=ec4899
EXPO_PUBLIC_BACKGROUND_COLOR=f8fafc
EXPO_PUBLIC_TEXT_COLOR=1e293b
EXPO_PUBLIC_FONT_FAMILY=Manrope
EXPO_PUBLIC_DEFAULT_LOCALE=es
EXPO_PUBLIC_LOCALES=es,en,pt
EOF
        
        echo -e "  ✅ .env.local creado para desarrollo con staging"
        echo ""
        echo "📱 Para testing con Expo Go:"
        echo "1. Ejecuta: cd apps/mobile && expo start"
        echo "2. Escanea el QR code con Expo Go app"
        echo "3. La app se conectará al backend de staging"
        echo ""
        
        if confirm "¿Iniciar Expo ahora?"; then
            cd "$MOBILE_DIR"
            expo start
        fi
        ;;
    
    "5")
        echo "Saliendo..."
        exit 0
        ;;
    
    *)
        echo -e "${RED}❌ Opción no válida${NC}"
        exit 1
        ;;
esac

section "Verificación de configuración"
echo "Archivos en $MOBILE_DIR:"
ls -la "$MOBILE_DIR" | grep -E "\.env|eas\.json|app\.config" || true

section "Próximos pasos"
echo -e "${GREEN}✅ Configuración de mobile app completada${NC}"
echo ""
echo "📋 Para continuar:"
echo "1. 🔧 Verificar EXPO_PUBLIC_API_URL apunta a backend correcto"
echo "2. 📱 Para APK: ./scripts/environments/staging/mobile/build-apk.sh"
echo "3. 🎯 Para desarrollo: cd apps/mobile && expo start"
echo "4. 🧪 Probar conexión con backend de staging"
echo ""
echo "🔗 Recursos:"
echo "- Documentación: $SCRIPT_DIR/../README.md"
echo "- Expo EAS: https://docs.expo.dev/build/introduction/"
echo "- Testing en dispositivo: https://docs.expo.dev/get-started/installation/"