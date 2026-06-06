#!/bin/bash

# ==============================================================================
# Script para eliminar las variables de entorno en Vercel
# Ubicación: /scripts/environments/develop/clear-vercel-env.sh
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧹 Limpiador de Variables de Entorno de Vercel${NC}"
echo "=================================================="

# 1. Verificar Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI no está instalado.${NC}"
    echo "Instálalo globalmente ejecutando: npm install -g vercel"
    exit 1
fi

# 2. Leer la cuenta de Vercel requerida desde .env.develop
ENV_FILE="$PROJECT_ROOT/apps/web/.env.develop"
VERCEL_EMAIL="info@retia.online" # Fallback por defecto

if [ -f "$ENV_FILE" ]; then
    EXTRACTED_EMAIL=$(grep -E "^VERCEL_EMAIL=" "$ENV_FILE" | cut -d'=' -f2- | xargs || true)
    if [ -n "$EXTRACTED_EMAIL" ]; then
        VERCEL_EMAIL="$EXTRACTED_EMAIL"
    fi
fi

echo -e "📧 Cuenta objetivo de Vercel: ${GREEN}$VERCEL_EMAIL${NC}"

# 3. Verificar y conectar a la cuenta de Vercel correcta
echo -e "\n🔑 Verificando sesión actual en Vercel..."
CURRENT_USER=$(vercel whoami 2>&1 || true)

if [[ "$CURRENT_USER" == *"Logged in as"* || "$CURRENT_USER" == *"Active team"* || ! "$CURRENT_USER" == *"Error:"* ]]; then
    USER_CLEAN=$(echo "$CURRENT_USER" | grep -E "Logged in as|Active team" | xargs || echo "$CURRENT_USER")
    echo -e "👤 Sesión activa encontrada: \n${YELLOW}$USER_CLEAN${NC}"
    echo ""
    
    # Preguntar si se desea cambiar a la cuenta correcta
    read -p "¿Deseas cerrar esta sesión e iniciar sesión con $VERCEL_EMAIL? [S/n]: " SWITCH_ACCOUNT
    SWITCH_ACCOUNT=${SWITCH_ACCOUNT:-S}
    
    if [[ "$SWITCH_ACCOUNT" =~ ^[Ss]$ ]]; then
        echo -e "\n🛑 Cerrando sesión actual en Vercel..."
        vercel logout || true
        
        echo -e "🔄 Iniciando sesión con: ${GREEN}$VERCEL_EMAIL${NC}"
        echo "💡 Por favor, completa el inicio de sesión en la ventana del navegador que se abrirá..."
        vercel login "$VERCEL_EMAIL"
    else
        echo -e "\n⚠️ Continuando con la sesión actual..."
    fi
else
    echo -e "${YELLOW}⚠️  No tienes sesión iniciada en Vercel.${NC}"
    echo -e "🔄 Iniciando sesión con: ${GREEN}$VERCEL_EMAIL${NC}"
    echo "💡 Por favor, completa el inicio de sesión en la ventana del navegador que se abrirá..."
    vercel login "$VERCEL_EMAIL"
fi

# Verificar si el login fue exitoso
echo -e "\n✅ Verificando estado de conexión..."
if ! vercel whoami &>/dev/null; then
    echo -e "${RED}❌ No se pudo verificar la sesión en Vercel. Por favor, asegúrate de haber completado el login.${NC}"
    exit 1
fi
echo -e "👤 Conectado como: ${GREEN}$(vercel whoami | head -n1)${NC}"

# 4. Determinar directorio de la aplicación (apps/web)
WEB_APP_DIR="$PROJECT_ROOT/apps/web"

# 5. Verificar si el proyecto de Vercel está vinculado localmente (project.json en apps/web o repo.json en la raíz)
cd "$WEB_APP_DIR"
LINK_EXISTS=0
if [ -f ".vercel/project.json" ] || [ -f "$PROJECT_ROOT/.vercel/repo.json" ]; then
    LINK_EXISTS=1
fi

if [ $LINK_EXISTS -eq 0 ]; then
    echo -e "\n🔗 Vinculando proyecto local a Vercel..."
    echo -e "${YELLOW}💡 INSTRUCCIONES CLAVE PARA EL ASISTENTE DE VERCEL LINK:${NC}"
    echo -e "1. A la pregunta ${CYAN}'Link to it?'${NC}, responde ${GREEN}yes${NC}."
    echo -e "2. A la pregunta ${CYAN}'Would you like to pull environment variables now?'${NC}, responde ${RED}no${NC} (o presiona Enter)."
    echo -e "   ${YELLOW}(De esta forma NO intentará sobrescribir tu archivo local .env.local).${NC}"
    echo "----------------------------------------------------------------------"
    echo ""
    
    # Se usa "|| true" para que no aborte el script si se cancela la descarga de variables
    vercel link || true
    
    # Comprobar si ahora existe el archivo de enlace en cualquier formato (monorepo o standalone)
    if [ ! -f ".vercel/project.json" ] && [ ! -f "$PROJECT_ROOT/.vercel/repo.json" ]; then
        echo -e "${RED}❌ No se pudo vincular el proyecto.${NC}"
        echo "Asegúrate de responder 'yes' a la pregunta para vincular el proyecto."
        exit 1
    fi
fi

# Extraer el nombre del proyecto y el ID del archivo de configuración correspondiente
PROJECT_NAME=""
PROJECT_ID=""

if [ -f "$PROJECT_ROOT/.vercel/repo.json" ]; then
    # Formato monorepo (se encuentra en la raíz del repositorio)
    if command -v jq &> /dev/null; then
        PROJECT_NAME=$(jq -r '.projects[0].name' "$PROJECT_ROOT/.vercel/repo.json")
        PROJECT_ID=$(jq -r '.projects[0].id' "$PROJECT_ROOT/.vercel/repo.json")
    else
        PROJECT_NAME=$(cat "$PROJECT_ROOT/.vercel/repo.json" | grep -o '"name": "[^"]*' | head -n1 | cut -d'"' -f4)
        PROJECT_ID=$(cat "$PROJECT_ROOT/.vercel/repo.json" | grep -o '"id": "[^"]*' | head -n1 | cut -d'"' -f4)
    fi
elif [ -f ".vercel/project.json" ]; then
    # Formato standalone (se encuentra en apps/web)
    if command -v jq &> /dev/null; then
        PROJECT_NAME=$(jq -r '.name' .vercel/project.json)
        PROJECT_ID=$(jq -r '.projectId' .vercel/project.json)
    else
        PROJECT_NAME=$(cat .vercel/project.json | grep -o '"name": "[^"]*' | head -n1 | cut -d'"' -f4)
        PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId": "[^"]*' | head -n1 | cut -d'"' -f4)
    fi
fi

echo -e "\n${GREEN}✅ Proyecto vinculado detectado:${NC}"
echo "🌐 Proyecto Vercel: $PROJECT_NAME"
echo "🆔 ID Proyecto: $PROJECT_ID"
echo "----------------------------------------"

# ==========================================
# OBTENCIÓN Y EXPOSICIÓN DE VARIABLES
# ==========================================
echo -e "\n🔍 Obteniendo variables de entorno actuales de Vercel..."

# Obtener variables de entorno
ENV_VARS=""
if command -v jq &> /dev/null; then
    ENV_VARS=$(vercel env ls --json 2>/dev/null | jq -r '.[].key' | sort -u || true)
fi

# Fallbacks si no hay jq o el formato JSON falló
if [ -z "$ENV_VARS" ]; then
    ENV_VARS=$(vercel env ls 2>/dev/null | grep -E '^[a-zA-Z_][a-zA-Z0-9_]*' | awk '{print $1}' | sort -u || true)
fi

if [ -z "$ENV_VARS" ]; then
    ENV_VARS=$(vercel env ls 2>/dev/null | tail -n +5 | grep -v 'Environment' | awk '{print $1}' | grep -E '^[a-zA-Z_][a-zA-Z0-9_]*' | sort -u || true)
fi

ENV_VARS=$(echo "$ENV_VARS" | xargs)

if [ -z "$ENV_VARS" ] || [ "$ENV_VARS" = " " ]; then
    echo -e "${GREEN}🎉 No se encontraron variables de entorno en Vercel para este proyecto.${NC}"
    exit 0
fi

echo -e "\n📋 Variables encontradas en Vercel para eliminar:"
for VAR in $ENV_VARS; do
    echo "  • $VAR"
done
echo "----------------------------------------"

# Confirmar acción peligrosa
echo -e "${RED}⚠️  ¡ADVERTENCIA CRÍTICA! ⚠️${NC}"
echo -e "${RED}Esto eliminará permanentemente TODAS las variables listadas arriba en Vercel.${NC}"
echo -e "${RED}Esta acción no se puede deshacer y afectará a los despliegues activos.${NC}"
echo ""
read -p "Escribe 'ELIMINAR' para confirmar el borrado en Vercel: " CONFIRMATION

if [ "$CONFIRMATION" != "ELIMINAR" ]; then
    echo -e "\n❌ Operación cancelada por el usuario."
    exit 0
fi

# ==========================================
# ELIMINACIÓN DE VARIABLES
# ==========================================
echo -e "\n🗑️  Eliminando variables de entorno..."
COUNT=0
for VAR in $ENV_VARS; do
    COUNT=$((COUNT+1))
    echo "  ⏳ ($COUNT) Eliminando $VAR..."
    # Eliminar en background para mayor velocidad
    vercel env rm "$VAR" -y &>/dev/null &
done

echo "  ⏳ Esperando que termine el borrado de todas las variables..."
wait

echo -e "\n============================================================"
echo -e "${GREEN}🎉 ¡PROCESO DE BORRADO COMPLETADO CON ÉXITO!${NC}"
echo -e "Se han eliminado $COUNT variables de entorno de Vercel."
echo -e "============================================================"
