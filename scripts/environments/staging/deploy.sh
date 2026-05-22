#!/bin/bash

# Script de deploy para entorno de staging en Vercel
# Uso: ./deploy.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploy a STAGING (Vercel)${NC}"
echo "========================================"

# Función para imprimir sección
section() {
    echo -e "\n${YELLOW}📋 $1${NC}"
    echo "----------------------------------------"
}

# Función para verificar comando
check_command() {
    if command -v $1 &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Función para preguntar confirmación
confirm() {
    read -p "$1 [s/N]: " -n 1 -r
    echo
    [[ $REPLY =~ ^[Ss]$ ]]
}

section "Verificación previa al deploy"

# Verificar Vercel CLI
if ! check_command "vercel"; then
    echo -e "${RED}❌ Vercel CLI no está instalado${NC}"
    echo "Instala con: npm install -g vercel"
    exit 1
fi

# Verificar login a Vercel
section "Verificando login a Vercel"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  No estás logueado en Vercel${NC}"
    echo "Iniciando sesión..."
    vercel login
fi

# Verificar que estamos en el directorio correcto
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    echo -e "${RED}❌ No se encontró package.json${NC}"
    exit 1
fi

section "Preparando build"
echo "Directorio del proyecto: $PROJECT_ROOT"

# Verificar variables de entorno
if [ ! -f "$PROJECT_ROOT/apps/web/.env.staging" ] && [ ! -f "$PROJECT_ROOT/apps/web/.env.production" ]; then
    echo -e "${YELLOW}⚠️  No se encontraron variables de entorno para staging${NC}"
    echo "Ejecuta primero: ./scripts/environments/staging/setup.sh"
    
    if confirm "¿Continuar de todos modos?"; then
        echo "Continuando sin variables de entorno específicas..."
    else
        exit 1
    fi
fi

# Opciones de deploy
section "Opciones de deploy"
echo "Selecciona tipo de deploy:"
echo "1. ✅ Deploy completo (build + deploy)"
echo "2. 🏗️  Solo build (sin deploy)"
echo "3. 🚀 Solo deploy (asumiendo build existente)"
echo "4. 🔄 Redeploy último commit"
echo "5. 🚪 Salir"

read -p "Opción [1]: " OPTION
OPTION=${OPTION:-1}

DEPLOY_URL=""

case $OPTION in
    "1")
        # Deploy completo
        section "Deploy completo a staging"
        
        # Build de paquetes
        echo "📦 Construyendo paquetes..."
        cd "$PROJECT_ROOT"
        yarn build:packages || {
            echo -e "${RED}❌ Error construyendo paquetes${NC}"
            exit 1
        }
        
        # Build de web app
        echo "🌐 Construyendo web app..."
        cd "$PROJECT_ROOT/apps/web"
        yarn build || {
            echo -e "${RED}❌ Error construyendo web app${NC}"
            exit 1
        }
        
        # Deploy a Vercel
        echo "🚀 Desplegando a Vercel..."
        DEPLOY_OUTPUT=$(vercel --prod --confirm 2>&1)
        echo "$DEPLOY_OUTPUT"
        
        # Extraer URL del deploy
        DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^ ]*\.vercel\.app' | head -1)
        ;;
    
    "2")
        # Solo build
        section "Solo build (sin deploy)"
        
        echo "📦 Construyendo paquetes..."
        cd "$PROJECT_ROOT"
        yarn build:packages
        
        echo "🌐 Construyendo web app..."
        cd "$PROJECT_ROOT/apps/web"
        yarn build
        
        echo -e "${GREEN}✅ Build completado${NC}"
        echo "Para deploy ejecuta: vercel --prod"
        ;;
    
    "3")
        # Solo deploy
        section "Solo deploy (asumiendo build existente)"
        
        echo "🚀 Desplegando a Vercel..."
        cd "$PROJECT_ROOT/apps/web"
        DEPLOY_OUTPUT=$(vercel --prod --confirm 2>&1)
        echo "$DEPLOY_OUTPUT"
        
        DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^ ]*\.vercel\.app' | head -1)
        ;;
    
    "4")
        # Redeploy
        section "Redeploy último commit"
        
        echo "🔄 Haciendo redeploy..."
        cd "$PROJECT_ROOT/apps/web"
        DEPLOY_OUTPUT=$(vercel --prod --force 2>&1)
        echo "$DEPLOY_OUTPUT"
        
        DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^ ]*\.vercel\.app' | head -1)
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

section "Resultado del deploy"
if [ -n "$DEPLOY_URL" ]; then
    echo -e "${GREEN}✅ Deploy exitoso!${NC}"
    echo "🌐 URL de staging: $DEPLOY_URL"
    echo ""
    echo "📋 Pasos siguientes:"
    echo "1. 🔗 Configurar OAuth providers con URL: $DEPLOY_URL"
    echo "2. 🧪 Probar aplicación en: $DEPLOY_URL"
    echo "3. 📱 Actualizar EXPO_PUBLIC_API_URL en mobile app"
    echo "4. 📊 Monitorear logs: vercel logs"
    echo ""
    echo "🔧 Configuración OAuth necesaria:"
    echo "   Google Cloud Console → Credenciales OAuth"
    echo "   - Authorized JavaScript origins: $DEPLOY_URL"
    echo "   - Authorized redirect URIs: $DEPLOY_URL/api/auth/callback/google"
else
    echo -e "${YELLOW}⚠️  Deploy completado, pero no se pudo obtener URL${NC}"
    echo "Revisa manualmente en: https://vercel.com/dashboard"
fi

# Preguntar si quiere abrir en navegador
if [ -n "$DEPLOY_URL" ] && confirm "¿Abrir en navegador?"; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "$DEPLOY_URL"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "$DEPLOY_URL"
    else
        echo "Abre manualmente: $DEPLOY_URL"
    fi
fi

# Preguntar si quiere ver logs
if confirm "¿Ver logs del deploy?"; then
    section "Logs del deploy"
    vercel logs --limit 20
fi

echo ""
echo "🔗 Recursos:"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- Documentación: $SCRIPT_DIR/README.md"
echo "- Configuración OAuth: $SCRIPT_DIR/oauth/README.md"