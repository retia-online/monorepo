#!/bin/bash

# Script para iniciar servicios de desarrollo local
# Uso: ./start.sh
# 
# IMPORTANTE: Para desarrollo local NO se necesita build.
# Solo instala dependencias y ejecuta en modo desarrollo.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando servicios de desarrollo LOCAL${NC}"
echo "=============================================="
echo "💡 Modo desarrollo: NO se construyen paquetes"
echo "📦 Solo se verifican/instalan dependencias"

# Función para imprimir sección
section() {
    echo -e "\n${YELLOW}📋 $1${NC}"
    echo "----------------------------------------"
}

# Función para verificar si un puerto está en uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Puerto en uso
    else
        return 1  # Puerto libre
    fi
}

# Función para liberar puerto
free_port() {
    PORT=$1
    if check_port $PORT; then
        echo -e "${YELLOW}⚠️  Puerto $PORT en uso, liberando...${NC}"
        lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
        sleep 1
        if check_port $PORT; then
            echo -e "${RED}❌ No se pudo liberar puerto $PORT${NC}"
            return 1
        else
            echo -e "  ✅ Puerto $PORT liberado"
            return 0
        fi
    fi
    return 0
}

# Función para preguntar confirmación
confirm() {
    read -p "$1 [s/N]: " -n 1 -r
    echo
    [[ $REPLY =~ ^[Ss]$ ]]
}

# Función para verificar dependencias (sin instalación)
check_dependencies() {
    echo "📦 Verificando dependencias..."
    cd "$PROJECT_ROOT"
    
    # Verificar dependencias en raíz
    if [ ! -d "node_modules" ]; then
        echo -e "${RED}❌ node_modules no encontrado en raíz${NC}"
        echo "  💡 Ejecuta primero: ./scripts/environments/local/setup.sh"
        return 1
    else
        echo -e "  ✅ Dependencias de raíz instaladas"
    fi
    
    # Verificar dependencias en apps/web
    if [ ! -d "apps/web/node_modules" ]; then
        echo -e "${RED}❌ node_modules no encontrado en apps/web${NC}"
        echo "  💡 Ejecuta primero: ./scripts/environments/local/setup.sh"
        return 1
    else
        echo -e "  ✅ Dependencias de web app instaladas"
    fi
    
    # Verificar dependencias en apps/mobile
    if [ ! -d "apps/mobile/node_modules" ]; then
        echo -e "${RED}❌ node_modules no encontrado en apps/mobile${NC}"
        echo "  💡 Ejecuta primero: ./scripts/environments/local/setup.sh"
        return 1
    else
        echo -e "  ✅ Dependencias de mobile app instaladas"
    fi
    
    return 0
}

section "Verificación de puertos"
PORTS=(9001 8081 27017)
for port in "${PORTS[@]}"; do
    if check_port $port; then
        echo -e "  ⚠️  Puerto $port en uso"
    else
        echo -e "  ✅ Puerto $port libre"
    fi
done

section "Opciones de inicio"
echo "Selecciona qué servicios iniciar:"
echo "1. ✅ Todos los servicios (recomendado)"
echo "2. 🌐 Solo web app (modo desarrollo)"
echo "3. 📱 Solo mobile app (modo desarrollo)"
echo "4. 🗄️  Solo MongoDB"
echo "5. 🚪 Salir"

read -p "Opción [1]: " OPTION
OPTION=${OPTION:-1}

# Array para almacenar PIDs de procesos
declare -a PIDS

# Función para limpiar procesos al salir
cleanup() {
    echo -e "\n${YELLOW}🛑 Deteniendo servicios...${NC}"
    for pid in "${PIDS[@]}"; do
        if kill -0 $pid 2>/dev/null; then
            kill $pid 2>/dev/null && echo "  ✅ Proceso $pid detenido"
        fi
    done
    exit 0
}

# Configurar trap para Ctrl+C
trap cleanup SIGINT SIGTERM

case $OPTION in
    "1")
        # Todos los servicios
        section "Iniciando todos los servicios"
        
        # 1. Verificar dependencias
        if ! check_dependencies; then
            echo -e "${RED}❌ Dependencias no instaladas. Ejecuta primero:${NC}"
            echo "  ./scripts/environments/local/setup.sh"
            exit 1
        fi
        
        # 2. MongoDB
        echo "🗄️  Iniciando MongoDB..."
        if command -v brew &> /dev/null; then
            brew services start mongodb-community
            echo -e "  ✅ MongoDB iniciado (brew services)"
        else
            echo -e "${YELLOW}⚠️  Brew no encontrado, asumiendo MongoDB ya iniciado${NC}"
        fi
        
        # Verificar MongoDB
        sleep 2
        if mongosh --eval "db.version()" --quiet &> /dev/null; then
            echo -e "  ✅ MongoDB conectado"
        else
            echo -e "${YELLOW}⚠️  MongoDB no responde, pero continuando...${NC}"
        fi
        
        # 3. Web app (modo desarrollo)
        echo "🌐 Iniciando web app (modo desarrollo)..."
        cd "$PROJECT_ROOT/apps/web"
        free_port 9001
        yarn dev &
        WEB_PID=$!
        PIDS+=($WEB_PID)
        
        # Esperar a que web app esté lista
        echo "  ⏳ Esperando web app..."
        sleep 5
        if check_port 9001; then
            echo -e "  ✅ Web app iniciada en http://localhost:9001"
        else
            echo -e "${YELLOW}⚠️  Web app no responde en puerto 9001${NC}"
        fi
        
        # 4. Mobile app (modo desarrollo)
        echo "📱 Iniciando mobile app (modo desarrollo)..."
        cd "$PROJECT_ROOT/apps/mobile"
        free_port 8081
        
        # Verificar si Expo CLI está instalado
        if ! command -v expo &> /dev/null; then
            echo -e "${YELLOW}⚠️  Expo CLI no encontrado, instalando...${NC}"
            npm install -g expo-cli
        fi
        
        # Iniciar Expo en background
        expo start &
        EXPO_PID=$!
        PIDS+=($EXPO_PID)
        
        # Esperar a que Expo esté listo
        echo "  ⏳ Esperando Expo Metro..."
        sleep 8
        if check_port 8081; then
            echo -e "  ✅ Expo Metro iniciado en http://localhost:8081"
        else
            echo -e "${YELLOW}⚠️  Expo Metro no responde en puerto 8081${NC}"
        fi
        ;;
    
    "2")
        # Solo web app
        section "Iniciando web app (modo desarrollo)"
        
        # Verificar dependencias
        if ! check_dependencies; then
            echo -e "${RED}❌ Dependencias no instaladas. Ejecuta primero:${NC}"
            echo "  ./scripts/environments/local/setup.sh"
            exit 1
        fi
        
        # Iniciar web app
        echo "🌐 Iniciando web app..."
        cd "$PROJECT_ROOT/apps/web"
        free_port 9001
        yarn dev
        
        # No background, run in foreground
        ;;
    
    "3")
        # Solo mobile app
        section "Iniciando mobile app (modo desarrollo)"
        
        # Verificar dependencias
        if ! check_dependencies; then
            echo -e "${RED}❌ Dependencias no instaladas. Ejecuta primero:${NC}"
            echo "  ./scripts/environments/local/setup.sh"
            exit 1
        fi
        
        # Iniciar mobile app
        echo "📱 Iniciando mobile app..."
        cd "$PROJECT_ROOT/apps/mobile"
        free_port 8081
        
        # Verificar si Expo CLI está instalado
        if ! command -v expo &> /dev/null; then
            echo -e "${YELLOW}⚠️  Expo CLI no encontrado, instalando...${NC}"
            npm install -g expo-cli
        fi
        
        expo start
        ;;
    
    "4")
        # Solo MongoDB
        section "Iniciando MongoDB"
        
        if command -v brew &> /dev/null; then
            brew services start mongodb-community
            echo -e "  ✅ MongoDB iniciado"
            
            # Verificar conexión
            sleep 2
            if mongosh --eval "db.version()" --quiet &> /dev/null; then
                echo -e "  ✅ MongoDB conectado correctamente"
                echo "  💡 Usa 'mongosh' para acceder a la shell"
            else
                echo -e "${YELLOW}⚠️  MongoDB iniciado pero no responde${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  Brew no encontrado${NC}"
            echo "Inicia MongoDB manualmente según tu sistema operativo"
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

if [ "$OPTION" = "1" ]; then
    section "Servicios en ejecución"
    echo -e "${GREEN}✅ Todos los servicios iniciados${NC}"
    echo ""
    echo "🔗 URLs de acceso:"
    echo "- 🌐 Web App: http://localhost:9001"
    echo "- 📱 Expo Metro: http://localhost:8081"
    echo "- 🗄️  MongoDB: mongodb://localhost:27017"
    echo ""
    echo "📱 Para mobile app:"
    echo "1. Instala 'Expo Go' app en tu dispositivo"
    echo "2. Escanea el QR code en http://localhost:8081"
    echo "3. O usa emulador Android/iOS"
    echo ""
    echo "🔧 Comandos útiles:"
    echo "- Ver logs web: tail -f apps/web/.next/server/logs/*"
    echo "- Ver logs Expo: expo logs"
    echo "- MongoDB shell: mongosh"
    echo ""
    echo "🛑 Para detener todos los servicios: Ctrl+C"
    echo ""
    
    # Mantener script corriendo
    echo "⏳ Servicios en ejecución. Presiona Ctrl+C para detener."
    wait
fi

section "Recursos y soporte"
echo "🔗 Recursos útiles:"
echo "- Next.js Docs: https://nextjs.org/docs"
echo "- Expo Docs: https://docs.expo.dev"
echo "- MongoDB Docs: https://docs.mongodb.com"
echo "- React Native: https://reactnative.dev"
echo ""
echo "📞 Para ayuda:"
echo "- Revisar logs de cada servicio"
echo "- Verificar variables de entorno"
echo "- Probar conexiones individualmente"
echo "- Contactar con equipo de desarrollo"