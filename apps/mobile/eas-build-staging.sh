#!/bin/bash

# Script para crear builds de staging de la app móvil
# Uso: ./eas-build-staging.sh [android|ios|both]

set -e

PLATFORM="${1:-both}"

echo "📱 Iniciando build de staging para app móvil..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta desde apps/mobile/"
    exit 1
fi

# Verificar que EAS CLI está instalado
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI no está instalado. Instala con: npm install -g eas-cli"
    exit 1
fi

# Configurar variables de staging
echo "⚙️  Configurando variables de staging..."
if [ -f ".env.staging" ]; then
    cp .env.staging .env.local
    echo "✅ Variables de staging configuradas"
else
    echo "⚠️  No se encontró .env.staging, usando .env.local existente"
fi

# Login a Expo si es necesario
echo "🔐 Verificando login a Expo..."
eas whoami &> /dev/null || {
    echo "⚠️  No estás logueado en Expo. Inicia sesión:"
    eas login
}

# Crear builds según la plataforma
case $PLATFORM in
    "android")
        echo "🤖 Creando build de staging para Android..."
        eas build --platform android --profile preview --non-interactive
        ;;
    "ios")
        echo "🍎 Creando build de staging para iOS..."
        eas build --platform ios --profile preview --non-interactive
        ;;
    "both")
        echo "🤖🍎 Creando builds de staging para Android e iOS..."
        eas build --platform all --profile preview --non-interactive
        ;;
    *)
        echo "❌ Plataforma no válida: $PLATFORM"
        echo "   Uso: $0 [android|ios|both]"
        exit 1
        ;;
esac

echo ""
echo "✅ Build(s) de staging creados exitosamente!"
echo ""
echo "📋 Pasos siguientes:"
echo "1. Los builds estarán disponibles en: https://expo.dev/accounts/[tu-usuario]/projects/[proyecto]/builds"
echo "2. Para distribuir a testers:"
echo "   - Android: npx eas submit --platform android --profile preview"
echo "   - iOS: npx eas submit --platform ios --profile preview"
echo "3. Los testers pueden instalar usando:"
echo "   - Expo Go app (para desarrollo)"
echo "   - Links de descarga directa (para staging)"
echo "4. Configurar web app de staging primero en: https://retia-app-staging.vercel.app"
echo ""
echo "🔗 Recursos:"
echo "- Expo Dashboard: https://expo.dev"
echo "- Documentación EAS: https://docs.expo.dev/build/introduction/"
echo "- Configuración de staging: ver docs/STAGING_SETUP.md"