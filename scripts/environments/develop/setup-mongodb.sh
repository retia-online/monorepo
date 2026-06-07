#!/bin/bash

# ==============================================================================
# Script de configuración de MongoDB Atlas para entorno DEVELOP
# Ubicación: /scripts/environments/develop/setup-mongodb.sh
#
# Qué hace:
#   1. Lee configuración de .env.develop
#   2. Usa la Atlas Admin API para:
#      a. Verificar que existe el usuario 'test' en Atlas
#      b. Crear/actualizar el usuario 'test' con permisos SOLO en app_develop
#      c. Agregar la IP pública actual al whitelist (Network Access)
#   3. Verifica el aislamiento ejecutando test-db.sh
#
# Prerequisitos:
#   - ATLAS_PUBLIC_KEY, ATLAS_PRIVATE_KEY, ATLAS_PROJECT_ID en .env.develop
#   - Obtener en: Atlas → Organization → Access Manager → API Keys
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
ENV_FILE="$PROJECT_ROOT/apps/web/.env.develop"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}⚙️  Setup MongoDB Atlas — DEVELOP${NC}"
echo "=========================================================================="

# ==============================================================================
# 1. LEER VARIABLES
# ==============================================================================
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ No se encontró $ENV_FILE${NC}"
    exit 1
fi

_read_env() { grep -E "^$1=" "$ENV_FILE" | cut -d'=' -f2- | xargs 2>/dev/null || echo ""; }

MONGODB_URI=$(_read_env "MONGODB_URI")
MONGODB_URI="${MONGODB_URI#\"}" ; MONGODB_URI="${MONGODB_URI%\"}"

ATLAS_PUBLIC_KEY=$(_read_env "ATLAS_PUBLIC_KEY")
ATLAS_PRIVATE_KEY=$(_read_env "ATLAS_PRIVATE_KEY")
ATLAS_PROJECT_ID=$(_read_env "ATLAS_PROJECT_ID")

# Extraer datos de la URI
DB_USER=$(echo "$MONGODB_URI" | sed -E 's|mongodb\+srv://([^:]+):.*|\1|')
DB_PASS=$(echo "$MONGODB_URI" | sed -E 's|mongodb\+srv://[^:]+:([^@]+)@.*|\1|')
CLUSTER_HOST=$(echo "$MONGODB_URI" | sed -E 's|.*@([^/]+)/.*|\1|')
DB_NAME=$(echo "$MONGODB_URI" | grep -oE '/[^/?]+' | tail -n1 | tr -d '/')

SAFE_URI=$(echo "$MONGODB_URI" | sed -E 's|mongodb\+srv://[^:]+:[^@]+@|mongodb+srv://***:***@|')

echo -e "📄 Env file:   ${CYAN}$ENV_FILE${NC}"
echo -e "🔗 URI:        ${CYAN}$SAFE_URI${NC}"
echo -e "👤 Usuario DB: ${CYAN}$DB_USER${NC}"
echo -e "🗄️  Base datos: ${CYAN}$DB_NAME${NC}"

# ==============================================================================
# 2. VERIFICAR CREDENCIALES DE ATLAS API
# ==============================================================================
echo -e "\n${BLUE}🔑 Verificando credenciales de Atlas API...${NC}"

if [ -z "$ATLAS_PUBLIC_KEY" ] || [ -z "$ATLAS_PRIVATE_KEY" ] || [ -z "$ATLAS_PROJECT_ID" ]; then
    echo -e "${RED}❌ Faltan credenciales de Atlas API en .env.develop:${NC}"
    [ -z "$ATLAS_PUBLIC_KEY" ]  && echo -e "   ${RED}✗ ATLAS_PUBLIC_KEY${NC}"
    [ -z "$ATLAS_PRIVATE_KEY" ] && echo -e "   ${RED}✗ ATLAS_PRIVATE_KEY${NC}"
    [ -z "$ATLAS_PROJECT_ID" ]  && echo -e "   ${RED}✗ ATLAS_PROJECT_ID${NC}"
    echo -e "\n${YELLOW}📝 Para obtenerlas:${NC}"
    echo -e "   1. Ir a ${CYAN}https://cloud.mongodb.com${NC}"
    echo -e "   2. Organization → Access Manager → API Keys → Create API Key"
    echo -e "   3. Permisos: ${CYAN}Organization Project Creator${NC} + ${CYAN}Project Owner${NC}"
    echo -e "   4. Copiar Public Key y Private Key al .env.develop:"
    echo -e "      ${CYAN}ATLAS_PUBLIC_KEY=xxxxxxxx${NC}"
    echo -e "      ${CYAN}ATLAS_PRIVATE_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx${NC}"
    echo -e "   5. ATLAS_PROJECT_ID lo encuentras en:"
    echo -e "      Atlas → tu proyecto → Settings → Project ID"
    echo -e "      ${CYAN}ATLAS_PROJECT_ID=xxxxxxxxxxxxxxxxxxxxxxxx${NC}"
    exit 1
fi

echo -e "✅ Credenciales encontradas."

# Helper para llamadas a la Atlas API con Digest Auth
atlas_api() {
    local METHOD="$1"
    local ENDPOINT="$2"
    local DATA="$3"
    local BASE="https://cloud.mongodb.com/api/atlas/v2"

    if [ -n "$DATA" ]; then
        curl -s --digest \
            -u "${ATLAS_PUBLIC_KEY}:${ATLAS_PRIVATE_KEY}" \
            -H "Content-Type: application/json" \
            -H "Accept: application/vnd.atlas.2023-01-01+json" \
            -X "$METHOD" \
            -d "$DATA" \
            "${BASE}${ENDPOINT}"
    else
        curl -s --digest \
            -u "${ATLAS_PUBLIC_KEY}:${ATLAS_PRIVATE_KEY}" \
            -H "Accept: application/vnd.atlas.2023-01-01+json" \
            -X "$METHOD" \
            "${BASE}${ENDPOINT}"
    fi
}

# Verificar que la API key funciona
echo -e "\n${BLUE}🔍 Verificando acceso a Atlas API...${NC}"
TEST_RESPONSE=$(atlas_api GET "/groups/${ATLAS_PROJECT_ID}" 2>/dev/null)

if echo "$TEST_RESPONSE" | grep -q '"id"'; then
    PROJECT_NAME=$(echo "$TEST_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('name','?'))" 2>/dev/null || echo "?")
    echo -e "✅ Acceso correcto al proyecto: ${GREEN}$PROJECT_NAME${NC}"
else
    echo -e "${RED}❌ No se pudo acceder al proyecto Atlas.${NC}"
    echo -e "${RED}   Respuesta: $TEST_RESPONSE${NC}"
    echo -e "${YELLOW}💡 Verifica que ATLAS_PROJECT_ID y las API keys son correctas.${NC}"
    exit 1
fi

# ==============================================================================
# 3. CREAR/ACTUALIZAR USUARIO DE BASE DE DATOS CON PERMISOS AISLADOS
# ==============================================================================
echo -e "\n${BLUE}👤 Configurando usuario '$DB_USER' con acceso SOLO a '$DB_NAME'...${NC}"

# Verificar si el usuario ya existe
EXISTING_USER=$(atlas_api GET "/groups/${ATLAS_PROJECT_ID}/databaseUsers/admin/${DB_USER}" 2>/dev/null)

USER_PAYLOAD=$(python3 -c "
import json
payload = {
    'databaseName': 'admin',
    'username': '${DB_USER}',
    'password': '${DB_PASS}',
    'roles': [
        {
            'roleName': 'readWrite',
            'databaseName': '${DB_NAME}'
        }
    ],
    'scopes': []
}
print(json.dumps(payload))
")

if echo "$EXISTING_USER" | grep -q '"username"'; then
    # Usuario existe → actualizar (PATCH)
    echo -e "   Usuario existente encontrado. Actualizando permisos..."
    RESPONSE=$(atlas_api PATCH "/groups/${ATLAS_PROJECT_ID}/databaseUsers/admin/${DB_USER}" "$USER_PAYLOAD")
else
    # Usuario no existe → crear (POST)
    echo -e "   Creando usuario nuevo..."
    RESPONSE=$(atlas_api POST "/groups/${ATLAS_PROJECT_ID}/databaseUsers" "$USER_PAYLOAD")
fi

if echo "$RESPONSE" | grep -q '"username"'; then
    ROLES=$(echo "$RESPONSE" | python3 -c "
import sys, json
d = json.load(sys.stdin)
roles = d.get('roles', [])
for r in roles:
    print(f\"  ✅ {r.get('roleName')} on {r.get('databaseName', 'admin')}\")
" 2>/dev/null || echo "  (no se pudieron leer los roles)")
    echo -e "${GREEN}✅ Usuario '$DB_USER' configurado correctamente.${NC}"
    echo -e "   Roles asignados:"
    echo -e "$ROLES"
else
    echo -e "${RED}❌ Error al configurar el usuario.${NC}"
    echo -e "${RED}   Respuesta: $RESPONSE${NC}"
    exit 1
fi

# ==============================================================================
# 4. AGREGAR IP ACTUAL AL WHITELIST (Network Access)
# ==============================================================================
echo -e "\n${BLUE}🌍 Agregando IP actual al whitelist de MongoDB Atlas...${NC}"

CURRENT_IP=$(curl -s -4 ifconfig.me 2>/dev/null || curl -s -4 icanhazip.com 2>/dev/null || echo "")

if [ -z "$CURRENT_IP" ]; then
    echo -e "${YELLOW}⚠️  No se pudo obtener la IP pública. Saltando whitelist.${NC}"
else
    echo -e "   IP detectada: ${CYAN}$CURRENT_IP${NC}"

    # Verificar si ya está en el whitelist
    EXISTING_IPS=$(atlas_api GET "/groups/${ATLAS_PROJECT_ID}/accessList" 2>/dev/null)

    if echo "$EXISTING_IPS" | grep -q "\"$CURRENT_IP\""; then
        echo -e "${GREEN}✅ IP $CURRENT_IP ya está en el whitelist.${NC}"
    else
        IP_PAYLOAD=$(python3 -c "
import json
payload = [{'ipAddress': '${CURRENT_IP}', 'comment': 'develop setup - auto added'}]
print(json.dumps(payload))
")
        IP_RESPONSE=$(atlas_api POST "/groups/${ATLAS_PROJECT_ID}/accessList" "$IP_PAYLOAD")

        if echo "$IP_RESPONSE" | grep -q '"ipAddress"\|"cidrBlock"'; then
            echo -e "${GREEN}✅ IP $CURRENT_IP agregada al whitelist.${NC}"
        else
            echo -e "${YELLOW}⚠️  No se pudo agregar la IP automáticamente.${NC}"
            echo -e "${YELLOW}   Agrégala manualmente en Atlas → Network Access.${NC}"
            echo -e "${YELLOW}   Respuesta: $IP_RESPONSE${NC}"
        fi
    fi
fi

# ==============================================================================
# 5. VERIFICAR AISLAMIENTO — test-db.sh
# ==============================================================================
echo -e "\n${BLUE}🧪 Ejecutando verificación de aislamiento...${NC}"
echo "--------------------------------------------------------------------------"

# Esperar unos segundos para que Atlas propague los cambios
echo -e "⏳ Esperando 5 segundos para que Atlas propague los cambios..."
sleep 5

"$SCRIPT_DIR/test-db.sh"
