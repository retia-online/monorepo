#!/bin/bash

# ==============================================================================
# Script de Despliegue Automatizado para Staging (Vercel)
# Ubicación: /scripts/environments/develop/deploy.sh
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando Despliegue Automatizado a Staging Vercel${NC}"
echo "=========================================================="

# 1. Verificar Vercel CLI y Git
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI no está instalado.${NC}"
    echo "Instálalo globalmente ejecutando: npm install -g vercel"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git no está instalado.${NC}"
    exit 1
fi

# 2. Leer la cuenta de Vercel requerida desde .env.develop
ENV_FILE="$PROJECT_ROOT/apps/web/.env.develop"
VERCEL_EMAIL="info@retia.online" # Fallback por defecto
VERCEL_USERNAME="retia-online" # Fallback por defecto

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ No se encontró el archivo de variables: $ENV_FILE${NC}"
    exit 1
fi

EXTRACTED_EMAIL=$(grep -E "^VERCEL_EMAIL=" "$ENV_FILE" | cut -d'=' -f2- | xargs || true)
if [ -n "$EXTRACTED_EMAIL" ]; then
    VERCEL_EMAIL="$EXTRACTED_EMAIL"
fi

EXTRACTED_USER=$(grep -E "^VERCEL_USERNAME=" "$ENV_FILE" | cut -d'=' -f2- | xargs || true)
if [ -n "$EXTRACTED_USER" ]; then
    VERCEL_USERNAME="$EXTRACTED_USER"
fi

echo -e "📧 Cuenta objetivo de Vercel: ${GREEN}$VERCEL_EMAIL${NC} (Usuario: ${GREEN}$VERCEL_USERNAME${NC})"

# 3. Verificar y conectar a la cuenta de Vercel correcta
echo -e "\n🔑 Verificando sesión actual en Vercel..."
CURRENT_USER_OUTPUT=$(vercel whoami 2>&1 || true)
# Limpiar la salida de whoami quitando prefijos de logueo habituales
CURRENT_USER_NAME=$(echo "$CURRENT_USER_OUTPUT" | sed 's/> Logged in as //g' | head -n1 | xargs || true)

SESSION_IS_CORRECT=0
if [ "$CURRENT_USER_NAME" = "$VERCEL_USERNAME" ] || [ "$CURRENT_USER_NAME" = "$VERCEL_EMAIL" ]; then
    SESSION_IS_CORRECT=1
fi

if [ $SESSION_IS_CORRECT -eq 1 ]; then
    echo -e "👤 Sesión activa correcta encontrada: ${GREEN}$CURRENT_USER_NAME${NC}"
    echo "✅ No requiere cambio de cuenta. Continuando..."
else
    if [[ "$CURRENT_USER_OUTPUT" == *"Error:"* || -z "$CURRENT_USER_NAME" ]]; then
        echo -e "${YELLOW}⚠️  No tienes sesión iniciada en Vercel.${NC}"
        echo -e "🔄 Iniciando sesión con: ${GREEN}$VERCEL_EMAIL${NC}"
        echo "💡 Por favor, completa el inicio de sesión en la ventana del navegador que se abrirá..."
        vercel login "$VERCEL_EMAIL"
    else
        echo -e "👤 Sesión activa diferente encontrada: \n${YELLOW}$CURRENT_USER_OUTPUT${NC}"
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
    fi
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

# 5. Verificar si el proyecto de Vercel está vinculado localmente (repo.json en raíz o project.json en apps/web)
cd "$WEB_APP_DIR"
LINK_EXISTS=0
if [ -f ".vercel/project.json" ] || [ -f "$PROJECT_ROOT/.vercel/repo.json" ]; then
    LINK_EXISTS=1
fi

if [ $LINK_EXISTS -eq 0 ]; then
    echo -e "\n🔗 Vinculando proyecto local a Vercel..."
    
    # Para evitar que 'vercel link --yes' sobrescriba el archivo .env.local del usuario,
    # hacemos un backup temporal del archivo .env.local, corremos el link, y luego lo restauramos.
    if [ -f ".env.local" ]; then
        echo "  📦 Respaldando archivo .env.local temporalmente..."
        cp ".env.local" ".env.local.bak"
    fi
    
    # Vincular automáticamente
    vercel link --yes || true
    
    # Restaurar backup
    if [ -f ".env.local.bak" ]; then
        echo "  🔄 Restaurando archivo .env.local..."
        mv ".env.local.bak" ".env.local"
    fi
    
    # Comprobar si ahora existe el archivo de enlace
    if [ ! -f ".vercel/project.json" ] && [ ! -f "$PROJECT_ROOT/.vercel/repo.json" ]; then
        echo -e "${RED}❌ No se pudo vincular el proyecto automáticamente.${NC}"
        echo "Intenta ejecutar 'vercel link' manualmente en apps/web respondiendo 'no' a descargar variables."
        exit 1
    fi
fi

# Extraer el nombre del proyecto y el ID
PROJECT_NAME=""
PROJECT_ID=""

if [ -f "$PROJECT_ROOT/.vercel/repo.json" ]; then
    if command -v jq &> /dev/null; then
        PROJECT_NAME=$(jq -r '.projects[0].name' "$PROJECT_ROOT/.vercel/repo.json")
        PROJECT_ID=$(jq -r '.projects[0].id' "$PROJECT_ROOT/.vercel/repo.json")
    else
        PROJECT_NAME=$(cat "$PROJECT_ROOT/.vercel/repo.json" | grep -o '"name": "[^"]*' | head -n1 | cut -d'"' -f4)
        PROJECT_ID=$(cat "$PROJECT_ROOT/.vercel/repo.json" | grep -o '"id": "[^"]*' | head -n1 | cut -d'"' -f4)
    fi
elif [ -f ".vercel/project.json" ]; then
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

# ==============================================================================
# 6. COMPARAR VARIABLES DE ENTORNO EN VERCEL CON .env.develop
# ==============================================================================
echo -e "\n🔍 Comparando variables de entorno en Vercel con .env.develop..."

# Descargar temporalmente las variables de desarrollo de Vercel para comparar sus valores reales
# Respaldamos temporalmente .env.local si existiera, para que vercel pull no lo pise
if [ -f ".env.local" ]; then
    cp ".env.local" ".env.local.temp.bak"
fi

vercel env pull temp_vercel.env &>/dev/null || true

# Si existía backup, restaurar .env.local original
if [ -f ".env.local.temp.bak" ]; then
    mv ".env.local.temp.bak" ".env.local"
fi

DIFFERENCES_FOUND=0
declare -a VARS_TO_UPDATE

if [ -f "temp_vercel.env" ]; then
    # Leer las variables del archivo .env.develop
    while IFS= read -r line || [ -n "$line" ]; do
        # Omitir comentarios y líneas vacías
        if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
            continue
        fi
        
        # Extraer clave y valor de formato LLAVE=VALOR
        if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
            KEY="${BASH_REMATCH[1]}"
            VAL="${BASH_REMATCH[2]}"
            
            # Omitir VERCEL_EMAIL y VERCEL_USERNAME
            if [ "$KEY" = "VERCEL_EMAIL" ] || [ "$KEY" = "VERCEL_USERNAME" ]; then
                continue
            fi
            
            # Limpiar comillas
            VAL="${VAL#\"}"
            VAL="${VAL%\"}"
            VAL="${VAL#\'}"
            VAL="${VAL%\'}"
            
            # Buscar en el archivo temporal de Vercel
            VERCEL_VAL=$(grep -E "^$KEY=" temp_vercel.env | cut -d'=' -f2- | xargs || true)
            VERCEL_VAL="${VERCEL_VAL#\"}"
            VERCEL_VAL="${VERCEL_VAL%\"}"
            VERCEL_VAL="${VERCEL_VAL#\'}"
            VERCEL_VAL="${VERCEL_VAL%\'}"
            
            # Comparar
            if [ -z "$VERCEL_VAL" ] && ! grep -q "^$KEY=" temp_vercel.env; then
                echo -e "  ➕ Variable faltante en Vercel: ${YELLOW}$KEY${NC}"
                DIFFERENCES_FOUND=1
                VARS_TO_UPDATE+=("$KEY")
            elif [ "$VAL" != "$VERCEL_VAL" ]; then
                echo -e "  🔄 Variable diferente: ${YELLOW}$KEY${NC} (Local: '${VAL:0:15}...' vs Vercel: '${VERCEL_VAL:0:15}...')"
                DIFFERENCES_FOUND=1
                VARS_TO_UPDATE+=("$KEY")
            fi
        fi
    done < "$ENV_FILE"
    
    # Eliminar archivo temporal
    rm -f temp_vercel.env
else
    echo -e "${YELLOW}⚠️  No se pudieron comprobar los valores en Vercel. Se asumirá que deben cargarse.${NC}"
    DIFFERENCES_FOUND=1
fi

if [ $DIFFERENCES_FOUND -eq 1 ]; then
    echo -e "\n${YELLOW}⚠️  Se encontraron discrepancias en las variables de entorno de Vercel.${NC}"
    read -p "¿Deseas sobrescribir o crear las variables discrepantes en Vercel usando .env.develop? [S/n]: " OVERWRITE_ENV
    OVERWRITE_ENV=${OVERWRITE_ENV:-S}
    
    if [[ "$OVERWRITE_ENV" =~ ^[Ss]$ ]]; then
        echo -e "\n📤 Actualizando variables en Vercel..."
        for KEY in "${VARS_TO_UPDATE[@]}"; do
            # Extraer el valor de .env.develop
            VAL=$(grep -E "^$KEY=" "$ENV_FILE" | cut -d'=' -f2- | xargs || true)
            VAL="${VAL#\"}"
            VAL="${VAL%\"}"
            VAL="${VAL#\'}"
            VAL="${VAL%\'}"
            
            echo "  🚀 Procesando $KEY..."
            # Eliminar la variable anterior en Vercel si existe
            vercel env rm "$KEY" -y &>/dev/null || true
            # Agregar la nueva en todos los entornos en paralelo
            for ENV in production preview development; do
                printf "%s" "$VAL" | vercel env add "$KEY" "$ENV" &>/dev/null &
            done
        done
        wait
        echo -e "${GREEN}✅ Variables de entorno sincronizadas en Vercel.${NC}"
    else
        echo -e "${YELLOW}⚠️ Continuando sin actualizar las variables en Vercel.${NC}"
    fi
else
    echo -e "${GREEN}✅ Las variables de entorno en Vercel coinciden con .env.develop.${NC}"
fi

# ==============================================================================
# 7. LOGICA DE CHANGELOG Y GIT COMMIT (FORZADO CON INFO@RETIA.ONLINE)
# ==============================================================================
echo -e "\n📝 Verificando historial de commits para CHANGELOG.md..."

cd "$PROJECT_ROOT"
CHANGELOG_FILE="$PROJECT_ROOT/CHANGELOG.md"

if [ ! -f "$CHANGELOG_FILE" ]; then
    echo "# Changelog" > "$CHANGELOG_FILE"
    echo "" >> "$CHANGELOG_FILE"
fi

# Obtener últimos 15 commits en la rama actual develop (omitir merges)
RECENT_COMMITS=$(git log --oneline -n 15 --no-merges || true)
NEW_ENTRIES=""

if [ -n "$RECENT_COMMITS" ]; then
    while IFS= read -r commit_line; do
        if [ -z "$commit_line" ]; then
            continue
        fi
        
        COMMIT_HASH=$(echo "$commit_line" | awk '{print $1}')
        COMMIT_MSG=$(echo "$commit_line" | cut -d' ' -f2-)
        
        # Verificar si el hash del commit ya está registrado en CHANGELOG.md
        if ! grep -q "$COMMIT_HASH" "$CHANGELOG_FILE"; then
            echo -e "  ➕ Detectado nuevo commit: ${CYAN}$COMMIT_HASH${NC} - $COMMIT_MSG"
            NEW_ENTRIES="${NEW_ENTRIES}\n- [$COMMIT_HASH] $COMMIT_MSG ($(date +%Y-%m-%d))"
        fi
    done <<< "$RECENT_COMMITS"
fi

if [ -n "$NEW_ENTRIES" ]; then
    echo -e "\n📝 Actualizando CHANGELOG.md..."
    
    # Crear un changelog temporal insertando las nuevas entradas arriba del contenido anterior
    TEMP_CHANGELOG=$(mktemp)
    echo "# Changelog" > "$TEMP_CHANGELOG"
    echo -e "$NEW_ENTRIES" >> "$TEMP_CHANGELOG"
    
    # Agregar el resto del archivo original, omitiendo el header de la primera línea
    tail -n +2 "$CHANGELOG_FILE" >> "$TEMP_CHANGELOG"
    mv "$TEMP_CHANGELOG" "$CHANGELOG_FILE"
    
    echo -e "💾 Haciendo commit de CHANGELOG.md forzando usuario..."
    git add "$CHANGELOG_FILE"
    
    # Forzar el commit con el usuario VERCEL_EMAIL (info@retia.online) y nombre Retia Develop
    git -c user.name="Retia Develop" -c user.email="$VERCEL_EMAIL" commit -m "chore: update CHANGELOG.md with recent commits [skip ci]"
    
    echo -e "${GREEN}✅ CHANGELOG.md actualizado y comprometido en Git con el usuario $VERCEL_EMAIL.${NC}"
else
    echo -e "${GREEN}✅ El archivo CHANGELOG.md ya cuenta con todos los commits registrados.${NC}"
fi

# ==============================================================================
# 8. COMPILACIÓN Y DESPLIEGUE A VERCEL
# ==============================================================================
echo -e "\n📦 Paso 1: Construyendo paquetes del monorepositorio..."
yarn build:packages || {
    echo -e "${RED}❌ Error construyendo los paquetes compartidos del monorepo.${NC}"
    exit 1
}

echo -e "\n🌐 Paso 2: Construyendo aplicación web..."
cd "$WEB_APP_DIR"
yarn build || {
    echo -e "${RED}❌ Error construyendo la aplicación web.${NC}"
    exit 1
}

echo -e "\n🚀 Paso 3: Desplegando en Vercel..."
vercel --yes || {
    echo -e "${RED}❌ Falló el despliegue en Vercel.${NC}"
    exit 1
}

# ==============================================================================
# 9. VERIFICACIÓN DEL DESPLIEGUE EN LA URL DE VERCEL
# ==============================================================================
DEPLOY_TARGET_URL="https://develop-monorepo.vercel.app/"
echo -e "\n🔍 Paso 4: Verificando estado del despliegue en la URL oficial de Staging..."
echo -e "🔗 URL Objetivo: ${GREEN}$DEPLOY_TARGET_URL${NC}"

# Esperar unos segundos a que Vercel propague los cambios
echo "⏳ Esperando 6 segundos a que se propague el despliegue..."
sleep 6

# Hacer test con curl para verificar el código HTTP
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$DEPLOY_TARGET_URL" || echo "000")

if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 301 ] || [ "$HTTP_STATUS" -eq 302 ] || [ "$HTTP_STATUS" -eq 401 ]; then
    echo -e "${GREEN}======================================================================${NC}"
    if [ "$HTTP_STATUS" -eq 401 ]; then
        echo -e "${GREEN}🎉 ¡DESPLIEGUE CONFIRMADO! (HTTP 401 - Protegido por Vercel Deployment Protection)${NC}"
    else
        echo -e "${GREEN}🎉 ¡DESPLIEGUE CONFIRMADO Y ONLINE! (HTTP $HTTP_STATUS)${NC}"
    fi
    echo -e "🔗 URL: ${CYAN}$DEPLOY_TARGET_URL${NC}"
    echo -e "${GREEN}======================================================================${NC}"
else
    echo -e "${RED}======================================================================${NC}"
    echo -e "${RED}⚠️  Advertencia: El despliegue finalizó pero la URL respondió HTTP $HTTP_STATUS.${NC}"
    echo -e "${RED}   Es posible que Vercel esté tardando en propagar o que haya algún error.${NC}"
    echo -e "${RED}======================================================================${NC}"
    echo -e "\n${YELLOW}📋 Extrayendo los últimos logs de Vercel para diagnóstico...${NC}"
    echo "----------------------------------------------------------------------"
    vercel logs --limit 10 || true
    echo "----------------------------------------------------------------------"
fi
