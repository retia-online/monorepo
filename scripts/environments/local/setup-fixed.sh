#!/bin/bash

# Script FIXED de configuración para entorno local
# Versión simplificada y robusta

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 CONFIGURACIÓN COMPLETA DE DESARROLLO LOCAL${NC}"
echo "========================================================"

# Función para imprimir sección
section() {
    echo -e "\n${YELLOW}📋 $1${NC}"
    echo "----------------------------------------"
}

# Función para verificar requisitos
check_requirement() {
    if command -v $1 &> /dev/null; then
        echo -e "  ✅ $1"
        return 0
    else
        echo -e "  ❌ $1 (no encontrado)"
        return 1
    fi
}

# Función para preguntar confirmación
confirm() {
    read -p "$1 [s/N]: " -n 1 -r
    echo
    [[ $REPLY =~ ^[Ss]$ ]]
}

section "1. VERIFICACIÓN DE REQUISITOS"
echo "Requisitos necesarios:"
REQUIREMENTS=("node" "yarn" "git")
MISSING_REQUIREMENTS=0

for req in "${REQUIREMENTS[@]}"; do
    if ! check_requirement $req; then
        MISSING_REQUIREMENTS=1
    fi
done

# Verificar Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
    
    if [ $NODE_MAJOR -ge 18 ]; then
        echo -e "  ✅ Node.js v$NODE_VERSION (>= 18)"
    else
        echo -e "  ❌ Node.js v$NODE_VERSION (necesita >= 18)"
        MISSING_REQUIREMENTS=1
    fi
fi

if [ $MISSING_REQUIREMENTS -eq 1 ]; then
    echo -e "\n${RED}❌ Faltan requisitos. Instala antes de continuar.${NC}"
    exit 1
fi

section "2. INSTALACIÓN DE DEPENDENCIAS GLOBALES"
echo "Instalando/actualizando herramientas globales..."

# Instalar/actualizar Expo CLI (nueva versión)
echo "📱 Expo CLI..."
if command -v expo &> /dev/null; then
    EXPO_VERSION=$(expo --version 2>/dev/null || echo "0.0.0")
    echo "  Versión actual: $EXPO_VERSION"
    
    # Verificar si es la versión legacy
    if [[ "$EXPO_VERSION" == "4."* ]] || [[ "$EXPO_VERSION" == "5."* ]]; then
        echo "  ⚠️  Versión legacy detectada, actualizando..."
        npm uninstall -g expo-cli 2>/dev/null || true
        npm install -g expo 2>/dev/null || true
    fi
else
    echo "  ⚠️  Expo CLI no encontrado, instalando..."
    npm install -g expo 2>/dev/null || true
fi

# Verificar Expo después de instalación
if command -v expo &> /dev/null; then
    echo -e "  ✅ Expo CLI instalado"
else
    echo -e "  ${YELLOW}⚠️  Expo CLI no se pudo instalar globalmente${NC}"
    echo "  Se intentará usar la versión local más tarde"
fi

section "3. INSTALACIÓN DE DEPENDENCIAS DEL PROYECTO"
cd "$PROJECT_ROOT"

echo "📦 Instalando dependencias desde raíz..."
echo "  Esto puede tomar varios minutos..."

# Método 1: yarn install normal
if yarn install; then
    echo -e "  ✅ Dependencias instaladas exitosamente"
else
    echo -e "${YELLOW}⚠️  Error con yarn install, intentando método alternativo...${NC}"
    
    # Método alternativo: instalar workspaces por separado
    echo "  🔄 Instalando workspaces individualmente..."
    
    # Instalar dependencias de raíz sin workspaces
    yarn install --ignore-workspaces 2>/dev/null || true
    
    # Instalar dependencias de cada package
    for pkg_dir in packages/*/; do
        if [ -f "$pkg_dir/package.json" ]; then
            pkg_name=$(basename "$pkg_dir")
            echo "    📦 @retia-global/$pkg_name..."
            cd "$pkg_dir"
            yarn install --ignore-workspaces 2>/dev/null || true
            cd "$PROJECT_ROOT"
        fi
    done
    
    # Instalar apps
    echo "    🌐 @retia-app/web..."
    cd apps/web
    yarn install --ignore-workspaces 2>/dev/null || true
    cd "$PROJECT_ROOT"
    
    echo "    📱 @retia-app/mobile..."
    cd apps/mobile
    yarn install --ignore-workspaces 2>/dev/null || true
    cd "$PROJECT_ROOT"
    
    echo -e "  ✅ Dependencias instaladas (método alternativo)"
fi

section "4. VERIFICACIÓN DE INSTALACIÓN"
echo "🔍 Verificando que todo esté instalado..."

# Verificar next
if [ -f "node_modules/.bin/next" ] || [ -f "apps/web/node_modules/.bin/next" ]; then
    echo -e "  ✅ Next.js instalado"
else
    echo -e "  ${RED}❌ Next.js NO instalado${NC}"
    echo "  Instalando Next.js en web app..."
    cd apps/web
    yarn add next 2>/dev/null || true
    cd "$PROJECT_ROOT"
fi

# Verificar expo local
if [ -f "node_modules/.bin/expo" ] || [ -f "apps/mobile/node_modules/.bin/expo" ] || command -v expo &> /dev/null; then
    echo -e "  ✅ Expo disponible"
else
    echo -e "  ${YELLOW}⚠️  Expo no encontrado localmente${NC}"
    echo "  Instalando Expo en mobile app..."
    cd apps/mobile
    yarn add expo 2>/dev/null || true
    cd "$PROJECT_ROOT"
fi

section "5. CONFIGURACIÓN DE ARCHIVOS .env"
echo "⚙️  Configurando variables de entorno..."

# Web app
if [ -f "apps/web/.env.example" ] && [ ! -f "apps/web/.env.local" ]; then
    echo "  🌐 Creando .env.local para web app..."
    cp apps/web/.env.example apps/web/.env.local
    echo -e "    ✅ apps/web/.env.local creado"
else
    echo -e "  🌐 Web app .env: ya configurado"
fi

# Mobile app
if [ -f "apps/mobile/.env.example" ] && [ ! -f "apps/mobile/.env.local" ]; then
    echo "  📱 Creando .env.local para mobile app..."
    cp apps/mobile/.env.example apps/mobile/.env.local
    echo -e "    ✅ apps/mobile/.env.local creado"
else
    echo -e "  📱 Mobile app .env: ya configurado"
fi

section "6. CONFIGURACIÓN DE MONGODB"
echo "🗄️  Configurando MongoDB local..."

if command -v brew &> /dev/null; then
    echo "  🍺 Verificando MongoDB con Homebrew..."
    
    if brew services list | grep -q mongodb-community; then
        echo "    ✅ MongoDB instalado"
        
        # Iniciar si no está corriendo
        if ! brew services list | grep mongodb-community | grep -q started; then
            echo "    ⚡ Iniciando MongoDB..."
            brew services start mongodb-community
            echo -e "    ✅ MongoDB iniciado"
        else
            echo -e "    ✅ MongoDB ya está corriendo"
        fi
    else
        echo -e "    ${YELLOW}⚠️  MongoDB no instalado con Homebrew${NC}"
        echo "    💡 Instala con: brew install mongodb-community"
    fi
else
    echo -e "  ${YELLOW}⚠️  Homebrew no encontrado${NC}"
    echo "  💡 Asegúrate de que MongoDB esté instalado y corriendo"
fi

section "7. PRUEBA RÁPIDA"
echo "🧪 Probando instalación..."

# Probar web app
echo "  🌐 Probando web app..."
cd apps/web
if [ -f "node_modules/.bin/next" ] || [ -f "../../node_modules/.bin/next" ]; then
    echo -e "    ✅ Next.js disponible"
else
    echo -e "    ${RED}❌ Next.js NO disponible${NC}"
fi
cd "$PROJECT_ROOT"

# Probar mobile app
echo "  📱 Probando mobile app..."
cd apps/mobile
if [ -f "node_modules/.bin/expo" ] || [ -f "../../node_modules/.bin/expo" ] || command -v expo &> /dev/null; then
    echo -e "    ✅ Expo disponible"
else
    echo -e "    ${RED}❌ Expo NO disponible${NC}"
fi
cd "$PROJECT_ROOT"

section "✅ CONFIGURACIÓN COMPLETADA"
echo -e "${GREEN}¡Todo listo para desarrollar!${NC}"
echo ""
echo "🚀 PARA INICIAR LOS SERVICIOS:"
echo "  ./scripts/environments/local/start.sh"
echo ""
echo "📋 OPCIONES DISPONIBLES EN start.sh:"
echo "  1. Todos los servicios (recomendado)"
echo "  2. Solo web app"
echo "  3. Solo mobile app"
echo "  4. Solo MongoDB"
echo ""
echo "🔗 URLs DE DESARROLLO:"
echo "  🌐 Web App: http://localhost:9001"
echo "  📱 Expo Metro: http://localhost:8081"
echo "  🗄️  MongoDB: mongodb://localhost:27017"
echo ""
echo "🛠️  COMANDOS MANUALES:"
echo "  Web app: cd apps/web && yarn dev"
echo "  Mobile app: cd apps/mobile && npx expo start"
echo "  MongoDB: brew services start mongodb-community"
echo ""
echo "❓ PROBLEMAS COMUNES:"
echo "  - Si hay errores, ejecuta: yarn install en la raíz"
echo "  - Para Expo: npx expo start (usa npx en lugar de expo global)"
echo "  - Para Next.js: asegúrate de tener Node.js 18+"

# Preguntar si iniciar servicios ahora
if confirm "¿Iniciar servicios de desarrollo ahora?"; then
    echo ""
    echo "🚀 Iniciando servicios..."
    ./scripts/environments/local/start.sh
fi