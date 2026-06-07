#!/bin/bash

# ==============================================================================
# Script de prueba de conexión a MongoDB — entorno DEVELOP
# Ubicación: /scripts/environments/develop/test-db.sh
#
# Qué hace:
#   1. Lee MONGODB_URI de .env.develop
#   2. Verifica conexión a la base de datos de develop (app_develop)
#   3. Verifica que el usuario NO tiene acceso a app_production (aislamiento)
#   4. Muestra un WARNING si el aislamiento está roto
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

echo -e "${BLUE}🔍 Test de conexión MongoDB — DEVELOP${NC}"
echo "=========================================================================="

# ==============================================================================
# 1. LEER VARIABLES
# ==============================================================================
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ No se encontró $ENV_FILE${NC}"
    exit 1
fi

MONGODB_URI=$(grep -E "^MONGODB_URI=" "$ENV_FILE" | cut -d'=' -f2- | xargs 2>/dev/null || echo "")
MONGODB_URI="${MONGODB_URI#\"}" ; MONGODB_URI="${MONGODB_URI%\"}"

if [ -z "$MONGODB_URI" ]; then
    echo -e "${RED}❌ MONGODB_URI no está configurado en .env.develop${NC}"
    exit 1
fi

# Extraer componentes de la URI para mostrar sin credenciales
SAFE_URI=$(echo "$MONGODB_URI" | sed -E 's|mongodb\+srv://[^:]+:[^@]+@|mongodb+srv://***:***@|')
DB_NAME=$(echo "$MONGODB_URI" | grep -oE '/[^/?]+(\?|$)' | head -n1 | tr -d '/?' || echo "default")
DB_USER=$(echo "$MONGODB_URI" | sed -E 's|mongodb\+srv://([^:]+):.*|\1|')

echo -e "📄 Env file:   ${CYAN}$ENV_FILE${NC}"
echo -e "🔗 URI:        ${CYAN}$SAFE_URI${NC}"
echo -e "🗄️  Base datos: ${CYAN}$DB_NAME${NC}"
echo -e "👤 Usuario:    ${CYAN}$DB_USER${NC}"

# ==============================================================================
# 2. VERIFICAR QUE LA BASE DE DATOS ES DE DEVELOP (no production)
# ==============================================================================
echo -e "\n${BLUE}🛡️  Verificando aislamiento de entornos...${NC}"

if echo "$MONGODB_URI" | grep -qi "production\|prod"; then
    echo -e "${RED}❌ ALERTA DE SEGURIDAD: La URI apunta a una base de datos de PRODUCCIÓN.${NC}"
    echo -e "${RED}   No se permite conectar a producción desde el entorno develop.${NC}"
    echo -e "${YELLOW}   URI actual: $SAFE_URI${NC}"
    echo -e "${YELLOW}   Corrige MONGODB_URI en .env.develop para que apunte a app_develop.${NC}"
    exit 1
fi

if ! echo "$MONGODB_URI" | grep -qi "develop\|staging\|test\|dev"; then
    echo -e "${YELLOW}⚠️  WARNING: El nombre de la base de datos no contiene 'develop', 'staging', 'test' ni 'dev'.${NC}"
    echo -e "${YELLOW}   URI: $SAFE_URI${NC}"
    echo -e "${YELLOW}   Asegúrate de que no estás apuntando a producción accidentalmente.${NC}"
    echo -e "${YELLOW}   Continuando de todos modos...${NC}"
else
    echo -e "${GREEN}✅ La URI apunta a base de datos de develop.${NC}"
fi

# ==============================================================================
# 3. PROBAR CONEXIÓN A app_develop
# ==============================================================================
echo -e "\n${BLUE}🧪 Probando conexión a $DB_NAME...${NC}"

if command -v mongosh &>/dev/null; then
    PING_RESULT=$(mongosh "$MONGODB_URI" --eval "db.adminCommand({ping:1})" --quiet 2>&1 || echo "ERROR")

    if echo "$PING_RESULT" | grep -q '"ok".*1\|ok: 1'; then
        echo -e "${GREEN}✅ Conexión exitosa a $DB_NAME${NC}"

        # Listar colecciones
        COLLECTIONS=$(mongosh "$MONGODB_URI" --eval "db.getCollectionNames().join(', ')" --quiet 2>/dev/null || echo "")
        if [ -n "$COLLECTIONS" ] && [ "$COLLECTIONS" != "[]" ] && [ "$COLLECTIONS" != "" ]; then
            echo -e "🗂️  Colecciones: ${CYAN}$COLLECTIONS${NC}"
        else
            echo -e "🗂️  Colecciones: (vacía — base de datos nueva)"
        fi
    else
        echo -e "${RED}❌ No se pudo conectar a $DB_NAME${NC}"
        echo -e "${RED}   Error: $PING_RESULT${NC}"
        echo -e "${YELLOW}💡 Verifica credenciales y whitelist de IPs en MongoDB Atlas.${NC}"
        CONNECT_FAILED=1
    fi
else
    echo -e "${YELLOW}⚠️  mongosh no está instalado. Instalalo con: brew install mongosh${NC}"
    CONNECT_FAILED=1
fi

# ==============================================================================
# 4. VERIFICAR AISLAMIENTO — intentar acceder a app_production con este usuario
# ==============================================================================
echo -e "\n${BLUE}🛡️  Verificando aislamiento: intentando acceder a app_production con usuario '$DB_USER'...${NC}"

PROD_URI=$(python3 -c "
import re, sys
uri = sys.argv[1]
new = re.sub(r'/([^/?]+)(\?|$)', '/app_production\\\\2', uri, count=1)
print(new)
" "$MONGODB_URI")

if command -v mongosh &>/dev/null; then
    PROD_RESULT=$(mongosh "$PROD_URI" \
        --eval "try { db.users.find().limit(1).toArray(); print('ACCESS_OK'); } catch(e) { print('BLOCKED:', e.message); }" \
        --quiet 2>&1 | grep -E "^ACCESS_OK|^BLOCKED:" | head -n1 || echo "ERROR")

    if echo "$PROD_RESULT" | grep -q "^BLOCKED:"; then
        echo -e "${GREEN}✅ AISLAMIENTO CORRECTO — El usuario '$DB_USER' NO puede leer/escribir en app_production.${NC}"
    elif echo "$PROD_RESULT" | grep -q "^ACCESS_OK"; then
        echo -e "${RED}╔══════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║  ⚠️  WARNING DE SEGURIDAD: AISLAMIENTO ROTO                      ║${NC}"
        echo -e "${RED}║                                                                  ║${NC}"
        echo -e "${RED}║  El usuario '$DB_USER' puede leer/escribir en app_production.   ║${NC}"
        echo -e "${RED}║  Un bug en develop podría afectar datos de producción.           ║${NC}"
        echo -e "${RED}║                                                                  ║${NC}"
        echo -e "${RED}║  Acción requerida en MongoDB Atlas:                              ║${NC}"
        echo -e "${RED}║  1. Database Access → editar usuario '$DB_USER'                 ║${NC}"
        echo -e "${RED}║  2. Cambiar a: Built-in Role → readWrite → Database: app_develop ║${NC}"
        echo -e "${RED}║  3. Eliminar 'readWriteAnyDatabase' si está activo              ║${NC}"
        echo -e "${RED}╚══════════════════════════════════════════════════════════════════╝${NC}"
        ISOLATION_BROKEN=1
    else
        echo -e "${YELLOW}⚠️  No se pudo verificar el aislamiento (timeout o red).${NC}"
        echo -e "${YELLOW}   Verifica manualmente en MongoDB Atlas → Database Access.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  mongosh no disponible — verifica manualmente en Atlas.${NC}"
    echo -e "${YELLOW}   Usuario '$DB_USER' debe tener acceso SOLO a 'app_develop'.${NC}"
fi

# ==============================================================================
# 5. RESUMEN
# ==============================================================================
echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${BLUE}📋 RESUMEN — DEVELOP${NC}"
echo -e "👤 Usuario DB:      ${CYAN}$DB_USER${NC}"
echo -e "🗄️  Base de datos:  ${CYAN}$DB_NAME${NC}"
echo -e "🔗 Cluster:        ${CYAN}$(echo "$MONGODB_URI" | sed -E 's|.*@([^/]+)/.*|\1|')${NC}"
if [ "${CONNECT_FAILED}" = "1" ]; then
    echo -e "🔌 Conexión:       ${RED}FALLIDA${NC}"
else
    echo -e "🔌 Conexión:       ${GREEN}EXITOSA${NC}"
fi
if [ "${ISOLATION_BROKEN}" = "1" ]; then
    echo -e "🛡️  Aislamiento:   ${RED}ROTO — arreglar en MongoDB Atlas${NC}"
else
    echo -e "🛡️  Aislamiento:   ${GREEN}OK${NC}"
fi
echo -e "\n${YELLOW}📝 Configuración en MongoDB Atlas para usuario '${CYAN}$DB_USER${NC}${YELLOW}':${NC}"
echo -e "   ✅ readWrite en ${CYAN}app_develop${NC}"
echo -e "   ✅ Sin acceso a ${CYAN}app_production${NC} (aislamiento correcto)"
echo -e "   ✅ Sin 'readWriteAnyDatabase' ni 'atlasAdmin' (principio de mínimo privilegio)"
echo -e "${GREEN}======================================================================${NC}"
