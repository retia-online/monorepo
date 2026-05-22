#!/bin/bash

# Script para deploy a staging en Vercel
# Uso: ./scripts/deploy-staging.sh

set -e  # Exit on error

echo "🚀 Iniciando deploy a staging..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta desde la raíz del proyecto."
    exit 1
fi

# Verificar que Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado. Instala con: npm i -g vercel"
    exit 1
fi

# Paso 1: Build de paquetes
echo "📦 Construyendo paquetes..."
yarn build:packages

# Paso 2: Build de web app
echo "🌐 Construyendo web app..."
cd apps/web
yarn build

# Paso 3: Deploy a Vercel (preview/staging)
echo "🚀 Desplegando a Vercel..."
vercel --prod --confirm

# Paso 4: Obtener URL del deploy
echo "🔗 Obteniendo URL del deploy..."
DEPLOY_URL=$(vercel --prod 2>&1 | grep -o 'https://[^ ]*\.vercel\.app' | head -1)

if [ -n "$DEPLOY_URL" ]; then
    echo "✅ Deploy completado exitosamente!"
    echo "🌐 URL de staging: $DEPLOY_URL"
    echo ""
    echo "📋 Pasos siguientes:"
    echo "1. Configurar variables de entorno en Vercel Dashboard"
    echo "2. Configurar OAuth providers con la URL: $DEPLOY_URL"
    echo "3. Probar la aplicación en: $DEPLOY_URL"
    echo "4. El primer usuario registrado obtendrá rol ADMIN"
else
    echo "⚠️  Deploy completado, pero no se pudo obtener la URL."
    echo "   Revisa manualmente en: https://vercel.com/dashboard"
fi

cd ../..