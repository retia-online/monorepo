#!/bin/bash

# Script para generar APK de staging para testing en dispositivo físico
# Uso: ./build-apk.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
MOBILE_DIR="$PROJECT_ROOT/apps/mobile"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}📱 Generando APK de STAGING para Android${NC}"
echo "=============================================="

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

section "Verificación previa"
if [ ! -d "$MOBILE_DIR" ]; then
    echo -e "${RED}❌ No se encontró directorio de mobile app${NC}"
    exit 1
fi

# Verificar EAS CLI
if ! command -v eas &> /dev/null; then
    echo -e "${RED}❌ EAS CLI no está instalado${NC}"
    echo "Instala con: npm install -g eas-cli"
    
    if confirm "¿Instalar EAS CLI ahora?"; then
        npm install -g eas-cli
    else
        exit 1
    fi
fi

# Verificar login a Expo
section "Verificando login a Expo"
if ! eas whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  No estás logueado en Expo${NC}"
    eas login
fi

# Verificar variables de entorno
section "Verificando variables de entorno"
ENV_FILE="$MOBILE_DIR/.env.staging"
ENV_LOCAL="$MOBILE_DIR/.env.local"

if [ ! -f "$ENV_FILE" ] && [ ! -f "$ENV_LOCAL" ]; then
    echo -e "${YELLOW}⚠️  No se encontraron variables de entorno para staging${NC}"
    echo "Ejecuta primero: ./scripts/environments/staging/mobile/setup.sh"
    
    if confirm "¿Continuar de todos modos?"; then
        echo "Continuando sin variables específicas..."
    else
        exit 1
    fi
else
    echo "✅ Variables de entorno encontradas"
    
    # Verificar EXPO_PUBLIC_API_URL
    if [ -f "$ENV_FILE" ]; then
        API_URL=$(grep "EXPO_PUBLIC_API_URL" "$ENV_FILE" | cut -d '=' -f2)
    elif [ -f "$ENV_LOCAL" ]; then
        API_URL=$(grep "EXPO_PUBLIC_API_URL" "$ENV_LOCAL" | cut -d '=' -f2)
    fi
    
    if [[ "$API_URL" == *"["*"]"* ]] || [ -z "$API_URL" ]; then
        echo -e "${YELLOW}⚠️  EXPO_PUBLIC_API_URL tiene placeholders o está vacía${NC}"
        echo "Actualiza con URL real de staging antes de build"
        
        if ! confirm "¿Continuar de todos modos?"; then
            exit 1
        fi
    else
        echo "🌐 API URL: $API_URL"
    fi
fi

section "Opciones de build"
echo "Selecciona tipo de build:"
echo "1. ✅ Build completo con EAS (recomendado)"
echo "2. 🏗️  Build local de desarrollo"
echo "3. 📦 Solo preparar configuración"
echo "4. 🚪 Salir"

read -p "Opción [1]: " OPTION
OPTION=${OPTION:-1}

cd "$MOBILE_DIR"

case $OPTION in
    "1")
        # Build completo con EAS
        section "Build completo con EAS"
        
        echo "📦 Este proceso puede tomar varios minutos..."
        echo "💡 Requiere conexión a internet estable"
        echo ""
        
        # Verificar eas.json
        if [ ! -f "eas.json" ]; then
            echo -e "${YELLOW}⚠️  No se encontró eas.json${NC}"
            
            if confirm "¿Crear eas.json básico?"; then
                cat > eas.json << 'EOF'
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "https://retia-app-staging.vercel.app"
      }
    }
  }
}
EOF
                echo -e "  ✅ eas.json creado"
            fi
        fi
        
        # Copiar .env.staging a .env.local para build
        if [ -f ".env.staging" ] && [ ! -f ".env.local" ]; then
            cp .env.staging .env.local
            echo "✅ Variables de staging copiadas a .env.local"
        fi
        
        # Ejecutar build
        echo "🚀 Iniciando build con EAS..."
        echo "📱 Plataforma: Android"
        echo "🎯 Perfil: preview (staging)"
        echo ""
        
        if confirm "¿Iniciar build ahora?"; then
            eas build --platform android --profile preview --non-interactive
            
            echo ""
            section "Build completado"
            echo -e "${GREEN}✅ APK generada exitosamente!${NC}"
            echo ""
            echo "📥 Descarga desde: https://expo.dev/accounts/[tu-usuario]/projects/[proyecto]/builds"
            echo ""
            echo "📱 Para instalar en dispositivo Android:"
            echo "1. Descarga el APK desde el link anterior"
            echo "2. En Android, permite 'Instalar desde fuentes desconocidas'"
            echo "3. Instala el APK"
            echo "4. La app se conectará al backend de staging"
            echo ""
            echo "🔧 Troubleshooting:"
            echo "- Si no se instala: Ajustes → Seguridad → Fuentes desconocidas → ACTIVAR"
            echo "- Si no conecta: Verificar EXPO_PUBLIC_API_URL en variables"
            echo "- Si crash: Revisar logs en Expo Dashboard"
        fi
        ;;
    
    "2")
        # Build local de desarrollo
        section "Build local de desarrollo"
        
        echo "🔨 Este método es para desarrollo, no produce APK standalone"
        echo "🎯 Usa Expo Go app para testing"
        echo ""
        
        # Verificar Expo CLI
        if ! command -v expo &> /dev/null; then
            echo -e "${RED}❌ Expo CLI no está instalado${NC}"
            echo "Instala con: npm install -g expo-cli"
            
            if confirm "¿Instalar Expo CLI ahora?"; then
                npm install -g expo-cli
            else
                exit 1
            fi
        fi
        
        # Configurar .env.local si no existe
        if [ ! -f ".env.local" ]; then
            if [ -f ".env.staging" ]; then
                cp .env.staging .env.local
                echo "✅ .env.local creado desde staging"
            else
                echo -e "${YELLOW}⚠️  Creando .env.local básico...${NC}"
                
                cat > .env.local << 'EOF'
# Configuración para desarrollo con staging
EXPO_PUBLIC_API_URL=https://retia-app-staging.vercel.app
EXPO_PUBLIC_AUTH_MODE=required
EXPO_PUBLIC_AUTH_METHODS=email,google
EXPO_PUBLIC_INSTANCE=Retia-Staging
EOF
                echo "✅ .env.local creado"
            fi
        fi
        
        echo ""
        echo "📱 Para testing con Expo Go:"
        echo "1. Instala 'Expo Go' app desde Play Store"
        echo "2. Ejecuta: expo start"
        echo "3. Escanea el QR code con Expo Go app"
        echo "4. La app cargará en tu dispositivo"
        echo ""
        
        if confirm "¿Iniciar Expo ahora?"; then
            expo start
        fi
        ;;
    
    "3")
        # Solo preparar configuración
        section "Preparando configuración para build"
        
        # Crear app.config.staging.js si no existe
        if [ ! -f "app.config.staging.js" ]; then
            echo "Creando app.config.staging.js..."
            
            cat > app.config.staging.js << 'EOF'
// Configuración para builds de staging
module.exports = {
  expo: {
    name: "Retia Staging",
    slug: "retia-staging",
    version: "1.0.0",
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://retia-app-staging.vercel.app",
      authMode: process.env.EXPO_PUBLIC_AUTH_MODE || "required",
      authMethods: process.env.EXPO_PUBLIC_AUTH_METHODS || "email,google",
      instance: process.env.EXPO_PUBLIC_INSTANCE || "Retia-Staging",
      environment: "staging"
    },
    android: {
      package: "com.retia.staging",
      versionCode: 1
    },
    ios: {
      bundleIdentifier: "com.retia.staging",
      buildNumber: "1.0.0"
    }
  }
};
EOF
            echo -e "  ✅ app.config.staging.js creado"
        fi
        
        # Verificar estructura
        echo ""
        echo "📁 Archivos de configuración:"
        ls -la | grep -E "\.env|eas\.json|app\.config" || true
        
        echo ""
        echo "✅ Configuración preparada para build"
        echo "Para build ejecuta: eas build --platform android --profile preview"
        ;;
    
    "4")
        echo "Saliendo..."
        exit 0
        ;;
    
    *)
        echo -e "${RED}❌ Opción no válida${NC}"
        exit 1
        ;;
esac

section "Recursos y soporte"
echo "🔗 Recursos útiles:"
echo "- Expo EAS: https://docs.expo.dev/build/introduction/"
echo "- Build para Android: https://docs.expo.dev/build-reference/apk/"
echo "- Testing en dispositivo: https://docs.expo.dev/get-started/installation/"
echo "- Troubleshooting: https://docs.expo.dev/debugging/"
echo ""
echo "📞 Para ayuda:"
echo "- Revisar logs en Expo Dashboard"
echo "- Verificar variables de entorno"
echo "- Probar backend de staging primero"
echo "- Contactar con equipo de desarrollo"