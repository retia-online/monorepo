#!/bin/bash

# Script para iniciar mobile app con emuladores (Android/iOS)
# Uso: ./start.sh
# 
# Este script inicia la mobile app configurada para emuladores:
# - Android Studio Emulator
# - iOS Simulator (solo macOS)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
MOBILE_DIR="$PROJECT_ROOT/apps/mobile"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}📱 Inicio de Mobile App con EMULADORES${NC}"
echo "============================================"

# Función para imprimir sección
section() {
    echo -e "\n${YELLOW}📋 $1${NC}"
    echo "----------------------------------------"
}

# Función para verificar si un puerto está en uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Función para verificar si emulador está corriendo
check_emulator() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - verificar iOS Simulator
        if xcrun simctl list devices available | grep -q "iPhone\|iPad"; then
            return 0
        fi
    fi
    
    # Verificar Android Emulator
    if command -v adb &> /dev/null; then
        if adb devices 2>/dev/null | grep -q "emulator\|device"; then
            return 0
        fi
    fi
    
    return 1
}

# Función para iniciar Android Emulator
start_android_emulator() {
    echo -e "${BLUE}🤖 Iniciando Android Emulator...${NC}"
    
    if ! command -v emulator &> /dev/null; then
        echo -e "${RED}❌ Android Emulator no encontrado${NC}"
        echo "   Asegúrate de tener Android Studio instalado"
        echo "   Descarga: https://developer.android.com/studio"
        return 1
    fi
    
    # Listar emuladores disponibles
    echo "   📱 Emuladores disponibles:"
    emulator -list-avds 2>/dev/null || echo "      No hay emuladores configurados"
    
    # Solicitar nombre del emulador
    read -p "   Ingresa el nombre del emulador (o Enter para default): " AVD_NAME
    
    if [ -z "$AVD_NAME" ]; then
        echo "   ▶️  Iniciando emulador por defecto..."
        emulator -avd $(emulator -list-avds | head -1) &
    else
        echo "   ▶️  Iniciando emulador: $AVD_NAME"
        emulator -avd "$AVD_NAME" &
    fi
    
    # Esperar a que inicie
    echo "   ⏳ Esperando a que el emulador arranque..."
    sleep 15
    
    if adb devices | grep -q "emulator"; then
        echo -e "   ✅ Android Emulator iniciado"
        return 0
    else
        echo -e "   ⚠️  Emulador iniciado pero no detectado por ADB"
        return 0
    fi
}

# Función para iniciar iOS Simulator
start_ios_simulator() {
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo -e "${RED}❌ iOS Simulator solo está disponible en macOS${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🍎 Iniciando iOS Simulator...${NC}"
    
    if ! command -v xcrun &> /dev/null; then
        echo -e "${RED}❌ Xcode Command Line Tools no encontrado${NC}"
        return 1
    fi
    
    # Listar dispositivos disponibles
    echo "   📱 Dispositivos disponibles:"
    xcrun simctl list devices available | grep -E "iPhone|iPad" | head -10
    
    # Solicitar dispositivo
    echo ""
    read -p "   Ingresa el nombre del dispositivo (ej: iPhone 15): " DEVICE_NAME
    
    if [ -z "$DEVICE_NAME" ]; then
        DEVICE_NAME="iPhone 15"
    fi
    
    echo "   ▶️  Iniciando: $DEVICE_NAME"
    open -a Simulator
    
    # Esperar a que inicie
    echo "   ⏳ Esperando a que el Simulator arranque..."
    sleep 5
    
    echo -e "   ✅ iOS Simulator iniciado"
    return 0
}

# Verificar que la mobile app esté configurada
section "Verificación de configuración"
if [ ! -f "$MOBILE_DIR/package.json" ]; then
    echo -e "${RED}❌ Mobile app no encontrada: $MOBILE_DIR${NC}"
    echo "   Ejecuta primero: ./scripts/environments/local/mobile/setup.sh"
    exit 1
fi

if [ ! -f "$MOBILE_DIR/.env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local no encontrado${NC}"
    echo "   Configurando para emuladores..."
    "$SCRIPT_DIR/setup.sh" option "1"
fi

echo "   ✅ Mobile app configurada"

# Verificar que Expo esté disponible
section "Verificando Expo"
cd "$MOBILE_DIR"

if [ -f "$PROJECT_ROOT/node_modules/.bin/expo" ]; then
    EXPO_CMD="$PROJECT_ROOT/node_modules/.bin/expo"
elif [ -f "$MOBILE_DIR/node_modules/.bin/expo" ]; then
    EXPO_CMD="$MOBILE_DIR/node_modules/.bin/expo"
elif command -v expo &> /dev/null; then
    EXPO_CMD="expo"
else
    echo -e "${YELLOW}⚠️  Expo no encontrado, usando npx expo${NC}"
    EXPO_CMD="npx expo"
fi

echo "   ✅ Expo disponible: $EXPO_CMD"

# Menú de opciones
section "Opciones de inicio"
echo "Selecciona el emulador a usar:"
echo "1. 🤖 Android Emulator"
echo "2. 🍎 iOS Simulator (solo macOS)"
echo "3. 🚀 Ambos (Android + iOS)"
echo "4. 🔧 Solo iniciar Metro bundler (sin emulador)"
echo "5. 🚪 Salir"

read -p "Opción [1]: " OPTION
OPTION=${OPTION:-1}

# Verificar servicios requeridos
section "Verificando servicios"

# Verificar Web App
if check_port 9001; then
    echo -e "   ✅ Web App corriendo en puerto 9001"
else
    echo -e "${YELLOW}⚠️  Web App NO está corriendo en puerto 9001${NC}"
    echo "   💡 Recomendación: Inicia la web app primero en otra terminal:"
    echo "      cd apps/web && yarn dev"
    echo ""
    
    read -p "   ¿Continuar de todas formas? [s/N]: " CONTINUE
    if [[ ! "$CONTINUE" =~ ^[Ss]$ ]]; then
        echo "   Saliendo..."
        exit 0
    fi
fi

# Verificar Expo Metro
if check_port 8081; then
    echo -e "   ⚠️  Metro bundler ya está corriendo en puerto 8081"
    echo "   Liberando puerto..."
    lsof -ti:8081 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Limpiar puerto 8081
lsof -ti:8081 2>/dev/null | xargs kill -9 2>/dev/null || true

case $OPTION in
    "1")
        # Android Emulator
        section "Iniciando con Android Emulator"
        
        # Intentar iniciar emulador
        start_android_emulator || true
        
        # Iniciar Expo para Android
        echo ""
        echo -e "${BLUE}▶️  Iniciando Expo para Android...${NC}"
        echo "   💡 Presiona 'a' cuando el emulador esté listo"
        echo ""
        
        $EXPO_CMD start --android
        ;;
    
    "2")
        # iOS Simulator
        section "Iniciando con iOS Simulator"
        
        if [[ "$OSTYPE" != "darwin"* ]]; then
            echo -e "${RED}❌ iOS Simulator solo está disponible en macOS${NC}"
            exit 1
        fi
        
        # Iniciar Simulator
        start_ios_simulator
        
        # Iniciar Expo para iOS
        echo ""
        echo -e "${BLUE}▶️  Iniciando Expo para iOS...${NC}"
        echo "   💡 Presiona 'i' cuando el Simulator esté listo"
        echo ""
        
        $EXPO_CMD start --ios
        ;;
    
    "3")
        # Ambos
        section "Iniciando con ambos emuladores"
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            start_ios_simulator
        else
            echo -e "${YELLOW}⚠️  iOS Simulator no disponible en este SO${NC}"
        fi
        
        start_android_emulator || true
        
        echo ""
        echo -e "${BLUE}▶️  Iniciando Expo (selecciona emulador)...${NC}"
        echo "   💡 Presiona 'a' para Android o 'i' para iOS"
        echo ""
        
        $EXPO_CMD start
        ;;
    
    "4")
        # Solo Metro
        section "Iniciando solo Metro bundler"
        
        echo -e "${BLUE}▶️  Iniciando Metro bundler...${NC}"
        echo "   💡 Conecta tu dispositivo o emulador manualmente"
        echo ""
        
        $EXPO_CMD start
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

section "Recursos útiles"
echo "📱 Documentación:"
echo "- Expo Docs: https://docs.expo.dev"
echo "- React Native: https://reactnative.dev"
echo ""
echo "🔧 Comandos útiles:"
echo "- Ver logs de Expo: expo logs"
echo "- Limpiar cache: expo start --clear"
echo "- Reiniciar Metro: expo start -r"
echo ""
echo "🛑 Para detener: Ctrl+C en la terminal de Metro"