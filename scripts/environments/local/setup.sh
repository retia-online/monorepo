#!/bin/bash

# Script principal de configuración para entorno local CON EMULADORES
# Uso: ./setup.sh
# 
# IMPORTANTE: Este script configura el entorno para desarrollo local
# con emuladores de Android Studio y iOS Simulator.
# Para desarrollo en dispositivo físico, usa Expo Go.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}💻 Configuración de entorno LOCAL CON EMULADORES${NC}"
echo "========================================================"
echo "🤖 Específico para Android Studio Emulator y iOS Simulator"
echo "📱 Para dispositivo físico, usa Expo Go con opción 1 en mobile/setup.sh"

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

section "Verificación de requisitos"
echo "Requisitos necesarios para desarrollo local CON EMULADORES:"
REQUIREMENTS=("node" "yarn" "git")
MISSING_REQUIREMENTS=0

for req in "${REQUIREMENTS[@]}"; do
    if ! check_requirement $req; then
        MISSING_REQUIREMENTS=1
    fi
done

# Verificar requisitos opcionales para emuladores
echo ""
echo "Requisitos opcionales para emuladores:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - verificar Xcode para iOS Simulator
    if xcode-select -p &> /dev/null; then
        echo -e "  ✅ Xcode Command Line Tools (iOS Simulator)"
    else
        echo -e "  ⚠️  Xcode Command Line Tools (necesario para iOS Simulator)"
    fi
fi

# Verificar Android Studio/emulator
if command -v emulator &> /dev/null || [ -d "$HOME/Library/Android/sdk" ]; then
    echo -e "  ✅ Android SDK/Emulator"
else
    echo -e "  ⚠️  Android SDK/Emulator (necesario para Android Emulator)"
fi

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
    echo -e "\n${RED}❌ Faltan requisitos. Instala los requerimientos antes de continuar.${NC}"
    echo ""
    echo "📦 Instalación recomendada PARA DESARROLLO CON EMULADORES:"
    echo ""
    echo "Para macOS (iOS Simulator + Android Emulator):"
    echo "  1. Xcode desde App Store (para iOS Simulator)"
    echo "  2. Android Studio desde https://developer.android.com/studio"
    echo "  3. Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo "  4. brew install node yarn git mongodb-community"
    echo ""
    echo "Para Windows (solo Android Emulator):"
    echo "  1. Android Studio desde https://developer.android.com/studio"
    echo "  2. Node.js desde https://nodejs.org"
    echo "  3. Yarn: npm install -g yarn"
    echo "  4. Git desde https://git-scm.com"
    echo "  5. MongoDB desde https://www.mongodb.com/try/download/community"
    echo ""
    echo "💡 Nota: iOS Simulator solo disponible en macOS con Xcode"
    exit 1
fi

section "Información del proyecto"
echo "Directorio del proyecto: $PROJECT_ROOT"
echo "Directorio de scripts: $SCRIPT_DIR"

# Verificar estructura del proyecto
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    echo -e "${RED}❌ No se encontró package.json en la raíz del proyecto${NC}"
    exit 1
fi

section "Opciones de configuración"
echo "Selecciona qué configurar:"
echo "1. ✅ Configuración completa (recomendado)"
echo "2. 🌐 Solo web app"
echo "3. 📱 Solo mobile app"
echo "4. 🗄️  Solo base de datos"
echo "5. 📋 Solo plantillas"
echo "6. 🚪 Salir"

read -p "Opción [1]: " OPTION
OPTION=${OPTION:-1}

case $OPTION in
    "1")
        # Configuración completa
        section "Configuración completa de desarrollo local"
        
        # Instalar dependencias
        if confirm "¿Instalar dependencias del proyecto?"; then
            echo "📦 Instalando dependencias..."
            cd "$PROJECT_ROOT"
            yarn install
            echo -e "  ✅ Dependencias instaladas"
        fi
        
        # Web app
        if confirm "¿Configurar web app para desarrollo local?"; then
            "$SCRIPT_DIR/web/setup.sh"
        fi
        
        # Mobile app
        if confirm "¿Configurar mobile app para desarrollo local?"; then
            "$SCRIPT_DIR/mobile/setup.sh"
        fi
        
        # Database
        if confirm "¿Configurar MongoDB local?"; then
            "$SCRIPT_DIR/database/setup-mongodb.sh"
        fi
        
        # Plantillas
        if confirm "¿Copiar plantillas de configuración?"; then
            mkdir -p "$PROJECT_ROOT/.local-templates"
            cp -r "$SCRIPT_DIR/templates/" "$PROJECT_ROOT/.local-templates/"
            echo -e "  ✅ Plantillas copiadas a .local-templates/"
        fi
        ;;
    
    "2")
        # Solo web app
        section "Configuración de web app"
        "$SCRIPT_DIR/web/setup.sh"
        ;;
    
    "3")
        # Solo mobile app
        section "Configuración de mobile app"
        "$SCRIPT_DIR/mobile/setup.sh"
        ;;
    
    "4")
        # Solo database
        section "Configuración de base de datos"
        "$SCRIPT_DIR/database/setup-mongodb.sh"
        ;;
    
    "5")
        # Solo plantillas
        section "Copiando plantillas"
        
        mkdir -p "$PROJECT_ROOT/.local-templates"
        cp -r "$SCRIPT_DIR/templates/" "$PROJECT_ROOT/.local-templates/"
        echo -e "  ✅ Plantillas copiadas a .local-templates/"
        echo -e "  📁 Contenido:"
        ls -la "$PROJECT_ROOT/.local-templates/"
        ;;
    
    "6")
        echo "Saliendo..."
        exit 0
        ;;
    
    *)
        echo -e "${RED}❌ Opción no válida${NC}"
        exit 1
        ;;
esac

section "Resumen de configuración"
echo -e "${GREEN}✅ Configuración de desarrollo local CON EMULADORES completada${NC}"
echo ""
echo "📋 Pasos siguientes recomendados PARA EMULADORES:"
echo "1. 🔧 Revisar archivos de configuración generados"
echo "2. 🚀 Iniciar servicios: ./scripts/environments/local/start.sh"
echo "3. 🌐 Acceder a web app: http://localhost:9001"
echo "4. 📱 Configurar mobile app para emulador (opción 4 en mobile/setup.sh)"
echo "5. 🤖 Iniciar emulador Android o iOS Simulator"
echo "6. 🧪 Probar la aplicación en el emulador"
echo ""
echo "🔗 URLs locales PARA EMULADORES:"
echo "- Web App: http://localhost:9001"
echo "- API: http://localhost:9001/api/..."
echo "- MongoDB: mongodb://localhost:27017"
echo "- Expo Metro: http://localhost:8081"
echo "- Android Emulator API: http://10.0.2.2:9001"
echo "- iOS Simulator API: http://localhost:9001"
echo ""
echo "🔧 Comandos útiles PARA EMULADORES:"
echo "- Iniciar web: cd apps/web && yarn dev"
echo "- Iniciar mobile para emulador: cd apps/mobile && expo start"
echo "- Iniciar Android Emulator: emulator -avd [NOMBRE_AVD]"
echo "- Iniciar iOS Simulator: open -a Simulator"
echo "- Iniciar MongoDB: brew services start mongodb-community"
echo "- Ver todos: ./scripts/environments/local/start.sh"

# Preguntar si quiere iniciar servicios
if confirm "¿Iniciar servicios ahora?"; then
    "$SCRIPT_DIR/start.sh"
fi

echo ""
echo "🔗 Recursos:"
echo "- Documentación: $SCRIPT_DIR/README.md"
echo "- Plantillas: $SCRIPT_DIR/templates/"
echo "- Next.js Docs: https://nextjs.org/docs"
echo "- Expo Docs: https://docs.expo.dev"
