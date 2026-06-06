#!/bin/bash

# Script para generar APK de staging para testing en dispositivo físico
# Uso: ./generate-staging-apk.sh

set -e

echo "📱 Generando APK de staging para testing..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta desde apps/mobile/"
    exit 1
fi

# Configurar variables de staging
echo "⚙️  Configurando variables de staging..."
if [ -f ".env.staging" ]; then
    echo "✅ Usando variables de .env.staging"
    # Para build local, necesitamos configurar las variables de otra manera
    # ya que .env.local se usa en runtime, no en build time
    echo "⚠️  Nota: Para builds locales, las variables EXPO_PUBLIC_* deben estar en app.config.js"
else
    echo "⚠️  No se encontró .env.staging"
fi

echo ""
echo "🔧 Selecciona el método de build:"
echo "1. EAS Build (recomendado) - Requiere cuenta Expo"
echo "2. Build local con desarrollo"
echo "3. Solo configurar para desarrollo"
read -p "Opción [1]: " OPTION
OPTION=${OPTION:-1}

case $OPTION in
    "1")
        # Método 1: EAS Build
        echo "🚀 Usando EAS Build..."
        
        # Verificar EAS CLI
        if ! command -v eas &> /dev/null; then
            echo "❌ EAS CLI no está instalado. Instala con: npm install -g eas-cli"
            exit 1
        fi
        
        # Login si es necesario
        eas whoami &> /dev/null || {
            echo "🔐 Iniciando sesión en Expo..."
            eas login
        }
        
        echo "📦 Creando build con EAS..."
        eas build --platform android --profile preview --non-interactive
        
        echo ""
        echo "✅ APK generada con EAS!"
        echo "📥 Descarga desde: https://expo.dev/accounts/[tu-usuario]/projects/[proyecto]/builds"
        echo "📱 Para instalar en dispositivo:"
        echo "   1. Descarga el APK desde el link"
        echo "   2. En Android, permite 'Instalar desde fuentes desconocidas'"
        echo "   3. Instala el APK"
        echo "   4. La app se conectará a: https://[your-app]-staging.vercel.app"
        ;;
    
    "2")
        # Método 2: Build local (simulación)
        echo "🔨 Build local (modo desarrollo)..."
        
        # Verificar que Expo está instalado
        if ! command -v expo &> /dev/null; then
            echo "❌ Expo CLI no está instalado. Instala con: npm install -g expo-cli"
            exit 1
        fi
        
        echo "⚠️  Build local completo requiere configuraciones adicionales:"
        echo "   1. Credenciales de Google Play"
        echo "   2. Keystore de producción"
        echo "   3. Configuración de gradle"
        echo ""
        echo "🎯 Alternativa recomendada:"
        echo "   Usar 'expo start' y Expo Go app para testing"
        echo ""
        echo "📱 Para testing con Expo Go:"
        echo "   1. Ejecuta: expo start"
        echo "   2. Escanea el QR code con Expo Go app"
        echo "   3. Configura .env.local con variables de staging"
        echo "   4. La app se conectará al backend de staging"
        
        # Preguntar si quiere iniciar Expo
        read -p "¿Iniciar Expo para desarrollo? [s/N]: " START_EXPO
        if [[ $START_EXPO =~ ^[Ss]$ ]]; then
            echo "🚀 Iniciando Expo..."
            expo start
        fi
        ;;
    
    "3")
        # Método 3: Solo configuración
        echo "⚙️  Configurando para desarrollo/staging..."
        
        # Crear archivo de configuración temporal
        cat > .env.local << 'EOF'
# Configuración para staging/testing
INSTANCE=Core-Staging
EXPO_PUBLIC_API_URL=https://[your-app]-staging.vercel.app
EXPO_PUBLIC_AUTH_MODE=required
EXPO_PUBLIC_AUTH_METHODS=email,google
EXPO_PUBLIC_INSTANCE=Core-Staging
EXPO_PUBLIC_MAIN_SCREEN_MESSAGE=¡Bienvenido a Staging!
EXPO_PUBLIC_PRIMARY_COLOR=6366f1
EXPO_PUBLIC_SECONDARY_COLOR=ec4899
EXPO_PUBLIC_BACKGROUND_COLOR=f8fafc
EXPO_PUBLIC_TEXT_COLOR=1e293b
EXPO_PUBLIC_FONT_FAMILY=Manrope
EXPO_PUBLIC_DEFAULT_LOCALE=es
EXPO_PUBLIC_LOCALES=es,en,pt
EOF
        
        echo "✅ .env.local creado para staging"
        echo ""
        echo "📱 Para testing:"
        echo "   1. Ejecuta: expo start"
        echo "   2. Usa Expo Go app en tu dispositivo"
        echo "   3. Escanea el QR code"
        echo "   4. La app usará el backend de staging"
        echo ""
        echo "🔧 Variables configuradas:"
        echo "   - API URL: https://[your-app]-staging.vercel.app"
        echo "   - Instancia: Core-Staging"
        echo "   - Auth: email,google"
        
        read -p "¿Iniciar Expo ahora? [s/N]: " START_EXPO
        if [[ $START_EXPO =~ ^[Ss]$ ]]; then
            expo start
        fi
        ;;
    
    *)
        echo "❌ Opción no válida"
        exit 1
        ;;
esac

echo ""
echo "📋 Resumen:"
echo "✅ Para APK lista para instalar: Usa EAS Build (Opción 1)"
echo "✅ Para testing rápido: Usa Expo Go (Opción 3)"
echo "✅ Backend de staging: https://[your-app]-staging.vercel.app"
echo ""
echo "🔗 Recursos:"
echo "- Expo EAS: https://docs.expo.dev/build/introduction/"
echo "- Testing en dispositivo: https://docs.expo.dev/get-started/installation/#2-expo-go-app-for-ios-and"
echo "- Configuración de staging: ver ../docs/STAGING_SETUP.md"