#!/bin/bash

# ==============================================================================
# Script de configuración de MongoDB Atlas — ambos entornos
# Ubicación: /scripts/environments/common/setup-mongodb.sh
#
# Qué hace:
#   1. Lee .env.develop y .env.production para obtener usuarios, passwords y
#      credenciales de la Atlas Admin API
#   2. Configura el usuario DEVELOP con readWrite SOLO en app_develop
#   3. Configura el usuario PRODUCTION con readWrite SOLO en app_production
#      → Aislamiento total: ningún usuario puede tocar la base del otro
#   4. Agrega la IP pública actual al whitelist de Network Access
#   5. Verifica el aislamiento ejecutando los test-db.sh de cada entorno
#
# Uso:
#   ./scripts/environments/common/setup-mongodb.sh
#
# Prerequisitos en .env.develop (y .env.production):
#   ATLAS_PUBLIC_KEY=...
#   ATLAS_PRIVATE_KEY=...
#   ATLAS_PROJECT_ID=...
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

ENV_DEVELOP="$PROJECT_ROOT/apps/web/.env.develop"
ENV_PRODUCTION="$PROJECT_ROOT/apps/web/.env.production"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BLUE}${BOLD}⚙️  Setup MongoDB Atlas — develop + production${NC}"
echo "=========================================================================="

# ==============================================================================
# HELPERS
# ==============================================================================
_read_env() {
    local FILE="$1" KEY="$2"
    grep -E "^${KEY}=" "$FILE" 2>/dev/null | cut -d'=' -f2- | xargs 2>/dev/null || echo ""
}

_extract_uri_part() {
    local URI="$1" PART="$2"
    case "$PART" in
        user) echo "$URI" | sed -E 's|mongodb\+srv://([^:]+):.*|\1|' ;;
        pass) echo "$URI" | sed -E 's|mongodb\+srv://[^:]+:([^@]+)@.*|\1|' ;;
        host) echo "$URI" | sed -E 's|.*@([^/]+)/.*|\1|' ;;
        db)   echo "$URI" | grep -oE '/[^/?]+' | tail -n1 | tr -d '/' ;;
    esac
}

atlas_api() {
    local METHOD="$1" ENDPOINT="$2" DATA="$3"
    local BASE="https://cloud.mongodb.com/api/atlas/v2"
    if [ -n "$DATA" ]; then
        curl -s --digest \
            -u "${ATLAS_PUBLIC_KEY}:${ATLAS_PRIVATE_KEY}" \
            -H "Content-Type: application/json" \
            -H "Accept: application/vnd.atlas.2023-01-01+json" \
            -X "$METHOD" -d "$DATA" "${BASE}${ENDPOINT}"
    else
        curl -s --digest \
            -u "${ATLAS_PUBLIC_KEY}:${ATLAS_PRIVATE_KEY}" \
            -H "Accept: application/vnd.atlas.2023-01-01+json" \
            -X "$METHOD" "${BASE}${ENDPOINT}"
    fi
}

setup_db_user() {
    local USERNAME="$1"
    local PASSWORD="$2"
    local DB_NAME="$3"
    local LABEL="$4"      # "DEVELOP" o "PRODUCTION"

    echo -e "\n${BLUE}👤 Configurando usuario ${BOLD}$USERNAME${NC}${BLUE} [$LABEL]...${NC}"

    # Ambos entornos usan readWrite restringido a su propia base de datos
    local ROLES_JSON="[{\"roleName\":\"readWrite\",\"databaseName\":\"${DB_NAME}\"}]"
    local ROLE_DESC="readWrite SOLO en $DB_NAME"

    local PAYLOAD
    PAYLOAD=$(python3 -c "
import json
print(json.dumps({
    'databaseName': 'admin',
    'username': '${USERNAME}',
    'password': '${PASSWORD}',
    'roles': ${ROLES_JSON},
    'scopes': []
}))
")

    # ¿Existe el usuario?
    local EXISTING
    EXISTING=$(atlas_api GET "/groups/${ATLAS_PROJECT_ID}/databaseUsers/admin/${USERNAME}" 2>/dev/null)

    local RESPONSE
    if echo "$EXISTING" | grep -q '"username"'; then
        echo -e "   Usuario existente — actualizando permisos..."
        RESPONSE=$(atlas_api PATCH "/groups/${ATLAS_PROJECT_ID}/databaseUsers/admin/${USERNAME}" "$PAYLOAD")
    else
        echo -e "   Usuario no encontrado — creando..."
        RESPONSE=$(atlas_api POST "/groups/${ATLAS_PROJECT_ID}/databaseUsers" "$PAYLOAD")
    fi

    if echo "$RESPONSE" | grep -q '"username"'; then
        echo -e "   ${GREEN}✅ $USERNAME configurado: $ROLE_DESC${NC}"
    else
        echo -e "   ${RED}❌ Error configurando $USERNAME${NC}"
        echo -e "   ${RED}Respuesta: $RESPONSE${NC}"
        return 1
    fi
}

# ==============================================================================
# 1. VERIFICAR ARCHIVOS .env
# ==============================================================================
echo -e "\n${BLUE}📄 Verificando archivos de configuración...${NC}"

[ ! -f "$ENV_DEVELOP" ]    && echo -e "${RED}❌ No se encontró $ENV_DEVELOP${NC}"    && exit 1
[ ! -f "$ENV_PRODUCTION" ] && echo -e "${RED}❌ No se encontró $ENV_PRODUCTION${NC}" && exit 1

echo -e "   ✅ $ENV_DEVELOP"
echo -e "   ✅ $ENV_PRODUCTION"

# ==============================================================================
# 2. LEER CREDENCIALES DE ATLAS API (desde .env.develop)
# ==============================================================================
ATLAS_PUBLIC_KEY=$(_read_env "$ENV_DEVELOP" "ATLAS_PUBLIC_KEY")
ATLAS_PRIVATE_KEY=$(_read_env "$ENV_DEVELOP" "ATLAS_PRIVATE_KEY")
ATLAS_PROJECT_ID=$(_read_env "$ENV_DEVELOP" "ATLAS_PROJECT_ID")

echo -e "\n${BLUE}🔑 Verificando credenciales de Atlas API...${NC}"

if [ -z "$ATLAS_PUBLIC_KEY" ] || [ -z "$ATLAS_PRIVATE_KEY" ] || [ -z "$ATLAS_PROJECT_ID" ]; then
    echo -e "${RED}❌ Faltan credenciales en .env.develop:${NC}"
    [ -z "$ATLAS_PUBLIC_KEY" ]  && echo -e "   ${RED}✗ ATLAS_PUBLIC_KEY${NC}"
    [ -z "$ATLAS_PRIVATE_KEY" ] && echo -e "   ${RED}✗ ATLAS_PRIVATE_KEY${NC}"
    [ -z "$ATLAS_PROJECT_ID" ]  && echo -e "   ${RED}✗ ATLAS_PROJECT_ID${NC}"
    echo -e "\n${YELLOW}📝 Cómo obtenerlas:${NC}"
    echo -e "   1. cloud.mongodb.com → Organization → Access Manager → API Keys"
    echo -e "   2. Create API Key → permisos: ${CYAN}Project Owner${NC}"
    echo -e "   3. Agregar en .env.develop:"
    echo -e "      ATLAS_PUBLIC_KEY=xxxxxxxx"
    echo -e "      ATLAS_PRIVATE_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    echo -e "      ATLAS_PROJECT_ID=xxxxxxxxxxxxxxxxxxxxxxxx  ← Atlas → Project Settings"
    exit 1
fi

# Verificar conectividad con la API
TEST=$(atlas_api GET "/groups/${ATLAS_PROJECT_ID}" 2>/dev/null)
if ! echo "$TEST" | grep -q '"id"'; then
    echo -e "${RED}❌ No se pudo acceder a la Atlas API.${NC}"
    echo -e "${RED}   Respuesta: $TEST${NC}"
    exit 1
fi

PROJECT_NAME=$(echo "$TEST" | python3 -c "import sys,json; print(json.load(sys.stdin).get('name','?'))" 2>/dev/null)
echo -e "   ✅ Proyecto: ${GREEN}$PROJECT_NAME${NC} (${ATLAS_PROJECT_ID})"

# ==============================================================================
# 3. LEER URIs DE CADA ENTORNO
# ==============================================================================
DEV_URI=$(_read_env "$ENV_DEVELOP" "MONGODB_URI")
DEV_URI="${DEV_URI#\"}" ; DEV_URI="${DEV_URI%\"}"

PROD_URI=$(_read_env "$ENV_PRODUCTION" "MONGODB_URI")
PROD_URI="${PROD_URI#\"}" ; PROD_URI="${PROD_URI%\"}"

DEV_USER=$(_extract_uri_part "$DEV_URI" "user")
DEV_PASS=$(_extract_uri_part "$DEV_URI" "pass")
DEV_DB=$(_extract_uri_part "$DEV_URI" "db")

PROD_USER=$(_extract_uri_part "$PROD_URI" "user")
PROD_PASS=$(_extract_uri_part "$PROD_URI" "pass")
PROD_DB=$(_extract_uri_part "$PROD_URI" "db")

echo -e "\n${BLUE}📊 Configuración detectada:${NC}"
echo -e "   DEVELOP    → usuario: ${CYAN}$DEV_USER${NC}  | base de datos: ${CYAN}$DEV_DB${NC}"
echo -e "   PRODUCTION → usuario: ${CYAN}$PROD_USER${NC} | base de datos: ${CYAN}$PROD_DB${NC}"

# Validar que no comparten usuario ni base de datos
if [ "$DEV_USER" = "$PROD_USER" ]; then
    echo -e "${RED}❌ develop y production tienen el mismo usuario DB ('$DEV_USER').${NC}"
    echo -e "${RED}   Usa usuarios distintos para garantizar el aislamiento.${NC}"
    exit 1
fi
if [ "$DEV_DB" = "$PROD_DB" ]; then
    echo -e "${RED}❌ develop y production apuntan a la misma base de datos ('$DEV_DB').${NC}"
    echo -e "${RED}   Usa bases de datos distintas para garantizar el aislamiento.${NC}"
    exit 1
fi
echo -e "   ✅ Usuarios y bases de datos distintos — configuración válida."

# ==============================================================================
# 4. CONFIGURAR USUARIOS EN ATLAS
# ==============================================================================
setup_db_user "$DEV_USER"  "$DEV_PASS"  "$DEV_DB"  "DEVELOP"
setup_db_user "$PROD_USER" "$PROD_PASS" "$PROD_DB" "PRODUCTION"

# ==============================================================================
# 5. AGREGAR IP ACTUAL AL WHITELIST
# ==============================================================================
echo -e "\n${BLUE}🌍 Actualizando whitelist de Network Access...${NC}"

CURRENT_IP=$(curl -s -4 ifconfig.me 2>/dev/null || curl -s -4 icanhazip.com 2>/dev/null || echo "")

if [ -z "$CURRENT_IP" ]; then
    echo -e "${YELLOW}⚠️  No se pudo obtener la IP pública. Agrega tu IP manualmente en Atlas → Network Access.${NC}"
else
    echo -e "   IP pública actual: ${CYAN}$CURRENT_IP${NC}"

    EXISTING_IPS=$(atlas_api GET "/groups/${ATLAS_PROJECT_ID}/accessList" 2>/dev/null)

    if echo "$EXISTING_IPS" | grep -q "\"$CURRENT_IP\""; then
        echo -e "   ${GREEN}✅ IP ya está en el whitelist.${NC}"
    else
        IP_PAYLOAD=$(python3 -c "
import json
print(json.dumps([{'ipAddress': '${CURRENT_IP}', 'comment': 'setup-mongodb.sh - auto added'}]))
")
        IP_RESP=$(atlas_api POST "/groups/${ATLAS_PROJECT_ID}/accessList" "$IP_PAYLOAD")

        if echo "$IP_RESP" | grep -q '"ipAddress"\|"cidrBlock"'; then
            echo -e "   ${GREEN}✅ IP $CURRENT_IP agregada al whitelist.${NC}"
        else
            echo -e "   ${YELLOW}⚠️  No se pudo agregar automáticamente. Agrégala en Atlas → Network Access.${NC}"
        fi
    fi
fi

# ==============================================================================
# 6. VERIFICAR — ejecutar test-db.sh de cada entorno
# ==============================================================================
echo -e "\n${BLUE}🧪 Verificando conexiones e aislamiento...${NC}"
echo -e "⏳ Esperando 5 segundos para que Atlas propague los cambios..."
sleep 5

echo -e "\n${BOLD}--- DEVELOP ---${NC}"
"$PROJECT_ROOT/scripts/environments/develop/test-db.sh"

echo -e "\n${BOLD}--- PRODUCTION ---${NC}"
"$PROJECT_ROOT/scripts/environments/production/test-db.sh"

echo -e "\n${GREEN}${BOLD}✅ Setup de MongoDB Atlas completado.${NC}"
