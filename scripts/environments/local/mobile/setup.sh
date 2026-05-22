#!/bin/bash

# Script de configuración para mobile app en desarrollo local
# Uso: ./setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
MOBILE_DIR="$PROJECT_ROOT/apps/mobile"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}📱 Configuración de MOBILE APP para desarrollo LOCAL${NC}"
echo "========================================================"

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

# Obtener IP local
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost"
    else
        echo "localhost"
    fi
}

LOCAL_IP=$(get_local_ip)

section "Opciones de configuración"
echo "Selecciona qué configurar:"
echo "1. ✅ Desarrollo con Expo Go (recomendado)"
echo "2. 🔧 Configuración para testing"
echo "3. 📁 Solo plantillas"
echo "4. 🎯 Configurar para desarrollo con emulador"
echo "5. 🚪 Salir"

read -p "Opción [1]: " OPTION
OPTION=${OPTION:-1}

case $OPTION in
    "1")
        # Desarrollo con Expo Go
        section "Configurando para desarrollo con Expo Go"
        
        ENV_DEST="$MOBILE_DIR/.env.local"
        
        # Crear variables para desarrollo
        cat > "$ENV_DEST" << EOF
# ============================================
# MOBILE APP - LOCAL DEVELOPMENT
# ============================================
# Configuración para desarrollo con Expo Go conectado a localhost

INSTANCE=Retia-Local

# Backend API - IMPORTANTE: Usar IP local, no localhost
EXPO_PUBLIC_API_URL=http://$LOCAL_IP:9001

# Authentication
EXPO_PUBLIC_AUTH_MODE=required
EXPO_PUBLIC_AUTH_METHODS=email

# App Configuration
EXPO_PUBLIC_INSTANCE=Retia-Local
EXPO_PUBLIC_MAIN_SCREEN_MESSAGE=¡Bienvenido a Retia Local!

# Design Configuration
EXPO_PUBLIC_PRIMARY_COLOR=3b82f6
EXPO_PUBLIC_SECONDARY_COLOR=10b981
EXPO_PUBLIC_BACKGROUND_COLOR=ffffff
EXPO_PUBLIC_TEXT_COLOR=1f2937
EXPO_PUBLIC_FONT_FAMILY=Manrope

# Internationalization
EXPO_PUBLIC_DEFAULT_LOCALE=es
EXPO_PUBLIC_LOCALES=es,en,pt

# Development
EXPO_PUBLIC_DEV_MODE=true
EOF
        
        echo -e "  ✅ Variables creadas en: $ENV_DEST"
        echo ""
        echo "🌐 API URL configurada: http://$LOCAL_IP:9001"
        echo ""
        echo "💡 Si 'localhost' no funciona en móvil, usa la IP mostrada arriba"
        
        # Verificar Expo CLI
        if ! command -v expo &> /dev/null; then
            echo -e "${YELLOW}⚠️  Expo CLI no está instalado${NC}"
            
            if confirm "¿Instalar Expo CLI?"; then
                npm install -g expo-cli
                echo -e "  ✅ Expo CLI instalado"
            else
                echo -e "${YELLOW}⚠️  Necesitas Expo CLI para desarrollo móvil${NC}"
            fi
        fi
        
        # Instalar Expo Go en dispositivo
        echo ""
        echo "📱 Para testing en dispositivo físico:"
        echo "1. Instala 'Expo Go' app desde Play Store/App Store"
        echo "2. Ejecuta: cd apps/mobile && expo start"
        echo "3. Escanea el QR code con Expo Go app"
        echo "4. La app cargará en tu dispositivo"
        echo ""
        echo "💡 Asegúrate que tu dispositivo esté en la misma red WiFi"
        ;;
    
    "2")
        # Configuración para testing
        section "Configurando para testing"
        
        ENV_DEST="$MOBILE_DIR/.env.test"
        
        cat > "$ENV_DEST" << EOF
# ============================================
# MOBILE APP - TESTING ENVIRONMENT
# ============================================

INSTANCE=Retia-Test

# Backend API
EXPO_PUBLIC_API_URL=http://localhost:9001

# Authentication
EXPO_PUBLIC_AUTH_MODE=required
EXPO_PUBLIC_AUTH_METHODS=email

# App Configuration
EXPO_PUBLIC_INSTANCE=Retia-Test
EXPO_PUBLIC_MAIN_SCREEN_MESSAGE=Testing Environment

# Testing flags
EXPO_PUBLIC_TEST_MODE=true
EXPO_PUBLIC_E2E_TESTING=true

# Design (simplificado para testing)
EXPO_PUBLIC_PRIMARY_COLOR=000000
EXPO_PUBLIC_SECONDARY_COLOR=666666
EXPO_PUBLIC_BACKGROUND_COLOR=ffffff
EXPO_PUBLIC_TEXT_COLOR=000000
EXPO_PUBLIC_FONT_FAMILY=System
EOF
        
        echo -e "  ✅ Variables de testing creadas en: $ENV_DEST"
        echo ""
        echo "🧪 Para testing:"
        echo "1. Usa con emulador o dispositivo de testing"
        echo "2. Configuración simplificada"
        echo "3. Flags de testing activados"
        ;;
    
    "3")
        # Solo plantillas
        section "Copiando plantillas"
        
        TEMPLATES_DIR="$SCRIPT_DIR/../templates"
        mkdir -p "$TEMPLATES_DIR"
        
        # Crear plantilla .env.mobile.local
        cat > "$TEMPLATES_DIR/.env.mobile.local" << 'EOF'
# ============================================
# MOBILE APP - LOCAL DEVELOPMENT
# ============================================
# Plantilla para desarrollo local

INSTANCE=Retia-Local

# ============================================
# Backend API Configuration
# ============================================
# IMPORTANTE: Para desarrollo en dispositivo físico, usa tu IP local
# Obtén tu IP: ipconfig getifaddr en0 (macOS) o hostname -I (Linux)
EXPO_PUBLIC_API_URL=http://[TU_IP_LOCAL]:9001

# ============================================
# Authentication
# ============================================
EXPO_PUBLIC_AUTH_MODE=required
EXPO_PUBLIC_AUTH_METHODS=email

# ============================================
# OAuth Configuration (Optional)
# ============================================
# EXPO_PUBLIC_GOOGLE_CLIENT_ID=[GOOGLE_CLIENT_ID_DEV]
# EXPO_PUBLIC_FACEBOOK_APP_ID=[FACEBOOK_APP_ID_DEV]

# ============================================
# App Configuration
# ============================================
EXPO_PUBLIC_INSTANCE=Retia-Local
EXPO_PUBLIC_MAIN_SCREEN_MESSAGE=¡Bienvenido a Retia Local!

# ============================================
# Design Configuration
# ============================================
EXPO_PUBLIC_PRIMARY_COLOR=3b82f6
EXPO_PUBLIC_SECONDARY_COLOR=10b981
EXPO_PUBLIC_BACKGROUND_COLOR=ffffff
EXPO_PUBLIC_TEXT_COLOR=1f2937
EXPO_PUBLIC_FONT_FAMILY=Manrope

# ============================================
# Internationalization
# ============================================
EXPO_PUBLIC_DEFAULT_LOCALE=es
EXPO_PUBLIC_LOCALES=es,en,pt

# ============================================
# Development Flags
# ============================================
EXPO_PUBLIC_DEV_MODE=true
EOF
        
        echo -e "  ✅ Plantilla creada en: $TEMPLATES_DIR/.env.mobile.local"
        ;;
    
    "4")
        # Configurar para desarrollo con emulador
        section "Configurando para desarrollo con emulador"
        
        ENV_DEST="$MOBILE_DIR/.env.local"
        
        # Para emulador, localhost funciona
        cat > "$ENV_DEST" << EOF
# ============================================
# MOBILE APP - EMULATOR DEVELOPMENT
# ============================================
# Configuración para desarrollo con emulador Android/iOS

INSTANCE=Retia-Local

# Backend API - Emulador puede usar localhost
EXPO_PUBLIC_API_URL=http://10.0.2.2:9001  # Android Emulator
# EXPO_PUBLIC_API_URL=http://localhost:9001  # iOS Simulator

# Authentication
EXPO_PUBLIC_AUTH_MODE=required
EXPO_PUBLIC_AUTH_METHODS=email

# App Configuration
EXPO_PUBLIC_INSTANCE=Retia-Local
EXPO_PUBLIC_MAIN_SCREEN_MESSAGE=¡Bienvenido a Retia Local (Emulador)!

# Design Configuration
EXPO_PUBLIC_PRIMARY_COLOR=3b82f6
EXPO_PUBLIC_SECONDARY_COLOR=10b981
EXPO_PUBLIC_BACKGROUND_COLOR=ffffff
EXPO_PUBLIC_TEXT_COLOR=1f2937
EXPO_PUBLIC_FONT_FAMILY=Manrope

# Internationalization
EXPO_PUBLIC_DEFAULT_LOCALE=es
EXPO_PUBLIC_LOCALES=es,en,pt

# Development
EXPO_PUBLIC_DEV_MODE=true
EOF
        
        echo -e "  ✅ Variables para emulador creadas en: $ENV_DEST"
        echo ""
        echo "🤖 Para desarrollo con emulador:"
        echo ""
        echo "Android Emulator:"
        echo "- API URL: http://10.0.2.2:9001"
        echo "- Requiere Android Studio y emulador configurado"
        echo ""
        echo "iOS Simulator:"
        echo "- API URL: http://localhost:9001"
        echo "- Requiere Xcode y simulator"
        echo ""
        echo "💡 Comentario/descomenta la línea apropiada para tu emulador"
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
ls -la "$MOBILE_DIR" | grep -E "\.env|package\.json" || true

section "Próximos pasos"
echo -e "${GREEN}✅ Configuración de mobile app completada${NC}"
echo ""
echo "📋 Para desarrollo:"
echo "1. 🚀 Asegura que web app esté corriendo: cd apps/web && yarn dev"
echo "2. 📱 Iniciar mobile app: cd apps/mobile && expo start"
echo "3. 📲 Escanear QR code con Expo Go app"
echo "4. 🧪 Probar conexión con backend local"
echo ""
echo "🔧 Comandos útiles:"
echo "- Iniciar Expo: expo start"
echo "- Limpiar cache: expo start --clear"
echo "- Ver logs: expo logs"
echo "- Build para Android: expo build:android"
echo ""
echo "🔗 Recursos:"
echo "- Documentación: $SCRIPT_DIR/../README.md"
echo "- Expo Docs: https://docs.expo.dev"
echo "- React Native: https://reactnative.dev"
