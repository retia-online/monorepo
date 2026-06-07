#!/bin/bash

# ==============================================================================
# Script de Despliegue Automatizado para Producción (Vercel)
# Ubicación: /scripts/environments/production/deploy.sh
#
# Qué hace este script:
#   1. Verifica credenciales de Vercel y GitHub
#   2. Sube las variables de .env.production al scope production de Vercel
#   3. Verifica que el último deployment de develop está Ready y sin errores 500
#      → Warning + confirmación si develop no está saludable
#   4. Hace merge de develop → main (como retia-online, sin commits extras)
#   5. Crea un tag de versión (auto-incrementa patch o usa --tag vX.Y.Z)
#   6. Vercel detecta el push a main vía webhook y lanza el deployment
#   7. Verifica que la URL de producción responda
#
# Uso:
#   ./deploy.sh              ← auto-incrementa el patch (v1.0.2 → v1.0.3)
#   ./deploy.sh --tag v1.1.0 ← usa el tag especificado
#
# Flujo correcto:
#   develop (probado) → merge a main + tag → Vercel production deployment
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m'

# ==============================================================================
# PARSEAR ARGUMENTOS — soporte para --tag v1.2.3
# ==============================================================================
EXPLICIT_TAG=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --tag)
            EXPLICIT_TAG="$2"
            shift 2
            ;;
        --tag=*)
            EXPLICIT_TAG="${1#--tag=}"
            shift
            ;;
        *)
            echo -e "${RED}❌ Argumento desconocido: $1${NC}"
            echo "Uso: $0 [--tag v1.2.3]"
            exit 1
            ;;
    esac
done

# Calcular el tag a usar
_next_patch_tag() {
    # Obtener el último tag semver (v1.2.3 o 1.2.3)
    local last
    last=$(git tag --sort=-v:refname | grep -E '^v?[0-9]+\.[0-9]+\.[0-9]+$' | head -n1 || echo "")

    if [ -z "$last" ]; then
        echo "v1.0.0"
        return
    fi

    # Normalizar a vX.Y.Z
    local version="${last#v}"
    local major minor patch
    IFS='.' read -r major minor patch <<< "$version"
    patch=$((patch + 1))
    echo "v${major}.${minor}.${patch}"
}

if [ -n "$EXPLICIT_TAG" ]; then
    # Validar formato
    if ! echo "$EXPLICIT_TAG" | grep -qE '^v[0-9]+\.[0-9]+\.[0-9]+$'; then
        echo -e "${RED}❌ Formato de tag inválido: '$EXPLICIT_TAG'. Usa: v1.2.3${NC}"
        exit 1
    fi
    RELEASE_TAG="$EXPLICIT_TAG"
    echo -e "${CYAN}🏷️  Tag especificado manualmente: ${GREEN}$RELEASE_TAG${NC}"
else
    RELEASE_TAG=$(_next_patch_tag)
    echo -e "${CYAN}🏷️  Tag auto-incrementado: ${GREEN}$RELEASE_TAG${NC} (patch del último tag)"
fi

echo -e "${GREEN}🚀 Iniciando Despliegue Automatizado a PRODUCCIÓN (Vercel)${NC}"
echo "=========================================================================="
echo -e "${RED}⚠️  ATENCIÓN: Este script despliega a PRODUCCIÓN (merge develop → main).${NC}"
echo -e "${RED}   Asegúrate de que develop está probado y estable.${NC}"
echo "=========================================================================="

# ==============================================================================
# 1. VERIFICAR HERRAMIENTAS REQUERIDAS
# ==============================================================================
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI no está instalado. Ejecuta: npm install -g vercel${NC}"
    exit 1
fi
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git no está instalado.${NC}"
    exit 1
fi

# ==============================================================================
# 2. LEER CONFIGURACIÓN DESDE .env.production
# ==============================================================================
ENV_FILE="$PROJECT_ROOT/apps/web/.env.production"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ No se encontró: $ENV_FILE${NC}"
    exit 1
fi

_read_env() { grep -E "^$1=" "$ENV_FILE" | cut -d'=' -f2- | xargs 2>/dev/null || echo ""; }

VERCEL_EMAIL=$(_read_env "VERCEL_EMAIL");   [ -z "$VERCEL_EMAIL" ]    && VERCEL_EMAIL="info@retia.online"
VERCEL_USERNAME=$(_read_env "VERCEL_USERNAME"); [ -z "$VERCEL_USERNAME" ] && VERCEL_USERNAME="retia-online"
GITHUB_USERNAME=$(_read_env "GITHUB_USERNAME")
GITHUB_EMAIL=$(_read_env "GITHUB_EMAIL")
GITHUB_TOKEN=$(_read_env "GITHUB_TOKEN")
MONGODB_URI=$(_read_env "MONGODB_URI")
NEXTAUTH_SECRET=$(_read_env "NEXTAUTH_SECRET")
NEXTAUTH_URL=$(_read_env "NEXTAUTH_URL")

echo -e "📧 Cuenta Vercel:  ${GREEN}$VERCEL_EMAIL${NC} (${GREEN}$VERCEL_USERNAME${NC})"
[ -n "$GITHUB_USERNAME" ] && echo -e "🐙 Cuenta GitHub:  ${GREEN}$GITHUB_USERNAME${NC} (${GREEN}$GITHUB_EMAIL${NC})"
echo -e "📄 Variables de:   ${CYAN}$ENV_FILE${NC}"

# ==============================================================================
# 2b. VERIFICAR VARIABLES CRÍTICAS
# ==============================================================================
MISSING=0
[ -z "$MONGODB_URI" ]     && echo -e "${RED}❌ Falta MONGODB_URI en .env.production${NC}"     && MISSING=1
[ -z "$NEXTAUTH_SECRET" ] && echo -e "${RED}❌ Falta NEXTAUTH_SECRET en .env.production${NC}" && MISSING=1
[ -z "$NEXTAUTH_URL" ]    && echo -e "${RED}❌ Falta NEXTAUTH_URL en .env.production${NC}"    && MISSING=1
[ -z "$GITHUB_TOKEN" ]    && echo -e "${RED}❌ Falta GITHUB_TOKEN en .env.production${NC}"    && MISSING=1
[ $MISSING -eq 1 ]        && echo -e "${RED}❌ Completa .env.production y vuelve a ejecutar.${NC}" && exit 1

echo -e "✅ Variables críticas verificadas."

# ==============================================================================
# 2d. VERIFICAR QUE develop FUE DESPLEGADO Y ESTÁ SALUDABLE EN VERCEL
# ==============================================================================
echo -e "\n${BLUE}🔍 Verificando estado del último deployment de develop en Vercel...${NC}"

DEVELOP_OK=0
DEVELOP_SKIP=0

# Obtener el deployment más reciente de la rama develop
DEV_DEPLOYMENT=$(timeout 20 vercel list 2>/dev/null | grep "Preview" | grep -i "retia-online" | head -n1 || echo "")

if [ -z "$DEV_DEPLOYMENT" ]; then
    echo -e "${YELLOW}⚠️  No se encontró ningún deployment previo de develop en Vercel.${NC}"
    DEVELOP_SKIP=1
else
    DEV_STATUS=$(echo "$DEV_DEPLOYMENT" | grep -oE '● (Ready|Error|Building|Queued|Canceled)' | head -n1)
    DEV_URL=$(echo "$DEV_DEPLOYMENT" | grep -oE 'https://[^ ]+' | head -n1)
    DEV_AGE=$(echo "$DEV_DEPLOYMENT" | awk '{print $2, $3}' | head -n1)

    echo -e "   Último deployment develop: ${CYAN}$DEV_URL${NC}"
    echo -e "   Estado: $DEV_STATUS | Edad: $DEV_AGE"

    if echo "$DEV_STATUS" | grep -q "Ready"; then
        # Verificar que responde correctamente
        if [ -n "$DEV_URL" ]; then
            DEV_HTTP=$(curl -o /dev/null -s -w "%{http_code}" "$DEV_URL" --max-time 10 || echo "000")
            if [ "$DEV_HTTP" = "200" ] || [ "$DEV_HTTP" = "307" ] || [ "$DEV_HTTP" = "301" ] || [ "$DEV_HTTP" = "401" ]; then
                echo -e "   HTTP: ${GREEN}$DEV_HTTP${NC} ✅"
                DEVELOP_OK=1
            else
                echo -e "   HTTP: ${RED}$DEV_HTTP${NC} — la URL de develop no responde correctamente."
            fi
        else
            # Ready sin URL verificable — aceptamos el status de Vercel
            DEVELOP_OK=1
        fi
    else
        echo -e "${RED}   El último deployment de develop NO está en estado Ready.${NC}"
    fi
fi

# Verificar también los logs del deployment de develop — buscar errores 500
if [ $DEVELOP_OK -eq 1 ] && [ -n "$DEV_URL" ]; then
    echo -e "   Revisando logs de develop..."
    DEV_ERRORS=$(timeout 15 vercel logs "$DEV_URL" --limit 20 2>/dev/null | grep -c "error.*500\|500.*error\|ReferenceError\|TypeError.*undefined" || echo "0")
    if [ "$DEV_ERRORS" -gt 0 ]; then
        echo -e "${RED}   ⚠️  Se encontraron $DEV_ERRORS errores en los logs de develop.${NC}"
        DEVELOP_OK=0
    else
        echo -e "   ${GREEN}✅ Sin errores críticos en los logs de develop.${NC}"
    fi
fi

# Decisión final
if [ $DEVELOP_OK -eq 1 ]; then
    echo -e "${GREEN}✅ develop está desplegado y saludable — se puede proceder a producción.${NC}"
elif [ $DEVELOP_SKIP -eq 1 ]; then
    echo -e "\n${YELLOW}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  ⚠️  WARNING: No se encontró deployment de develop en Vercel.     ║${NC}"
    echo -e "${YELLOW}║  Se recomienda ejecutar primero:                                  ║${NC}"
    echo -e "${YELLOW}║  ./scripts/environments/develop/deploy.sh                        ║${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════════╝${NC}"
    read -p "¿Continuar con el deployment de producción de todas formas? (s/N): " -n 1 -r; echo
    [[ ! $REPLY =~ ^[Ss]$ ]] && echo -e "${YELLOW}Abortado. Ejecuta primero el deploy de develop.${NC}" && exit 1
else
    echo -e "\n${RED}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ El último deployment de develop tiene problemas.              ║${NC}"
    echo -e "${RED}║  Despliega y verifica develop antes de ir a producción:           ║${NC}"
    echo -e "${RED}║  ./scripts/environments/develop/deploy.sh                        ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════════╝${NC}"
    read -p "¿Continuar con el deployment de producción de todas formas? (s/N): " -n 1 -r; echo
    [[ ! $REPLY =~ ^[Ss]$ ]] && echo -e "${RED}Abortado.${NC}" && exit 1
    echo -e "${YELLOW}⚠️  Continuando a pesar del estado de develop...${NC}"
fi
echo -e "\n${BLUE}🔍 Verificando estado de la rama develop...${NC}"
cd "$PROJECT_ROOT"

# Asegurarse de tener los refs remotos actualizados
git fetch origin develop main --quiet 2>/dev/null || true

DEV_LOCAL=$(git rev-parse develop 2>/dev/null || echo "")
DEV_REMOTE=$(git rev-parse origin/develop 2>/dev/null || echo "")

if [ -z "$DEV_LOCAL" ]; then
    echo -e "${RED}❌ La rama 'develop' no existe localmente.${NC}"
    exit 1
fi

if [ "$DEV_LOCAL" != "$DEV_REMOTE" ] && [ -n "$DEV_REMOTE" ]; then
    echo -e "${YELLOW}⚠️  La rama 'develop' local difiere del remoto.${NC}"
    echo -e "${YELLOW}   Local:  $DEV_LOCAL${NC}"
    echo -e "${YELLOW}   Remote: $DEV_REMOTE${NC}"
    echo -e "${YELLOW}   Ejecuta 'git pull origin develop' antes de continuar.${NC}"
    read -p "¿Continuar de todas formas? (s/N): " -n 1 -r; echo
    [[ ! $REPLY =~ ^[Ss]$ ]] && exit 1
fi

echo -e "✅ develop está listo para mergear."

# ==============================================================================
# 3. VERIFICAR SESIÓN DE VERCEL
# ==============================================================================
echo -e "\n🔑 Verificando sesión de Vercel CLI..."
CURRENT_USER=$(vercel whoami 2>&1 | sed 's/> Logged in as //g' | head -n1 | xargs 2>/dev/null || true)

if [ "$CURRENT_USER" = "$VERCEL_USERNAME" ] || [ "$CURRENT_USER" = "$VERCEL_EMAIL" ]; then
    echo -e "✅ Sesión correcta: ${GREEN}$CURRENT_USER${NC}"
elif [[ "$CURRENT_USER" == *"Error"* ]] || [ -z "$CURRENT_USER" ]; then
    echo -e "${YELLOW}⚠️  Sin sesión activa. Iniciando login...${NC}"
    vercel login "$VERCEL_EMAIL"
else
    echo -e "${YELLOW}⚠️  Sesión de otra cuenta: ${RED}$CURRENT_USER${NC}"
    vercel logout || true
    vercel login "$VERCEL_EMAIL"
fi

if ! vercel whoami &>/dev/null; then
    echo -e "${RED}❌ No se pudo verificar la sesión de Vercel.${NC}"; exit 1
fi
echo -e "👤 Conectado como: ${GREEN}$(vercel whoami | head -n1)${NC}"

# ==============================================================================
# 4. VINCULAR PROYECTO SI ES NECESARIO
# ==============================================================================
WEB_APP_DIR="$PROJECT_ROOT/apps/web"
cd "$WEB_APP_DIR"

if [ ! -f ".vercel/project.json" ] && [ ! -f "$PROJECT_ROOT/.vercel/repo.json" ]; then
    echo -e "\n🔗 Vinculando proyecto a Vercel..."
    [ -f ".env.local" ] && cp ".env.local" ".env.local.bak"
    vercel link --yes || true
    [ -f ".env.local.bak" ] && mv ".env.local.bak" ".env.local"
    if [ ! -f ".vercel/project.json" ] && [ ! -f "$PROJECT_ROOT/.vercel/repo.json" ]; then
        echo -e "${RED}❌ No se pudo vincular el proyecto.${NC}"; exit 1
    fi
fi

if [ -f "$PROJECT_ROOT/.vercel/repo.json" ]; then
    if command -v jq &>/dev/null; then
        PROJECT_NAME=$(jq -r '.projects[0].name' "$PROJECT_ROOT/.vercel/repo.json")
        PROJECT_ID=$(jq  -r '.projects[0].id'   "$PROJECT_ROOT/.vercel/repo.json")
    else
        PROJECT_NAME=$(grep -o '"name": "[^"]*' "$PROJECT_ROOT/.vercel/repo.json" | head -n1 | cut -d'"' -f4)
        PROJECT_ID=$(grep  -o '"id": "[^"]*'   "$PROJECT_ROOT/.vercel/repo.json" | head -n1 | cut -d'"' -f4)
    fi
elif [ -f ".vercel/project.json" ]; then
    if command -v jq &>/dev/null; then
        PROJECT_NAME=$(jq -r '.name'      .vercel/project.json)
        PROJECT_ID=$(jq  -r '.projectId' .vercel/project.json)
    else
        PROJECT_NAME=$(grep -o '"name": "[^"]*'      .vercel/project.json | head -n1 | cut -d'"' -f4)
        PROJECT_ID=$(grep  -o '"projectId": "[^"]*' .vercel/project.json | head -n1 | cut -d'"' -f4)
    fi
fi

echo -e "\n${GREEN}✅ Proyecto:${NC} $PROJECT_NAME (ID: $PROJECT_ID)"
echo "----------------------------------------------------------------------"

# ==============================================================================
# 5. SINCRONIZAR VARIABLES → VERCEL PRODUCTION SCOPE
# ==============================================================================
echo -e "\n📤 Sincronizando ${CYAN}.env.production${NC} → Vercel (production)..."

SKIP_KEYS=("VERCEL_EMAIL" "VERCEL_USERNAME" "GITHUB_USERNAME" "GITHUB_EMAIL" "GITHUB_TOKEN" "ATLAS_PUBLIC_KEY" "ATLAS_PRIVATE_KEY" "ATLAS_PROJECT_ID")
SYNC_OK=0; SYNC_FAIL=0

while IFS= read -r line || [ -n "$line" ]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
        KEY="${BASH_REMATCH[1]}"; VAL="${BASH_REMATCH[2]}"
        skip=0
        for sk in "${SKIP_KEYS[@]}"; do [ "$KEY" = "$sk" ] && skip=1 && break; done
        [ $skip -eq 1 ] && continue
        VAL="${VAL#\"}" ; VAL="${VAL%\"}" ; VAL="${VAL#\'}" ; VAL="${VAL%\'}"
        if vercel env add "$KEY" production --value "$VAL" --yes --force < /dev/null &>/dev/null; then
            echo -e "  ${GREEN}✓${NC} $KEY"; ((SYNC_OK++))
        else
            echo -e "  ${RED}✗${NC} $KEY"; ((SYNC_FAIL++))
        fi
    fi
done < "$ENV_FILE"

echo -e "\n${GREEN}✅ Sync:${NC} $SYNC_OK variables subidas, $SYNC_FAIL errores."
[ $SYNC_FAIL -gt 0 ] && echo -e "${YELLOW}⚠️  Verifica las variables fallidas en el dashboard de Vercel.${NC}"

# ==============================================================================
# 6. MERGE develop → main Y PUSH COMO retia-online
#    Sin commits propios — el merge ES el evento que dispara Vercel
# ==============================================================================
cd "$PROJECT_ROOT"
echo -e "\n${BLUE}🔀 Mergeando develop → main como ${GREEN}$GITHUB_USERNAME${NC}${BLUE}...${NC}"

REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
REPO_PATH=$(echo "$REMOTE_URL" | sed -E 's|git@github\.com:||; s|https://github\.com/||; s|\.git$||')
HTTPS_REMOTE="https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${REPO_PATH}.git"

# Asegurar que develop remoto tiene todos los commits locales antes del merge
echo -e "   Sincronizando develop → remoto..."
git checkout develop
if git push "$HTTPS_REMOTE" develop 2>&1 | sed "s|${GITHUB_TOKEN}|***|g"; then
    echo -e "   ${GREEN}✅ develop sincronizado con remoto.${NC}"
else
    echo -e "   ${YELLOW}⚠️  No se pudo sincronizar develop (puede que ya esté al día).${NC}"
fi
git checkout main
git fetch "$HTTPS_REMOTE" main:main --update-head-ok 2>&1 | sed "s|${GITHUB_TOKEN}|***|g" || true
git fetch "$HTTPS_REMOTE" develop:develop --update-head-ok 2>&1 | sed "s|${GITHUB_TOKEN}|***|g" || true

# Merge con identidad correcta — sin commit de CHANGELOG, sin commits extras
git -c user.name="Retia Production" -c user.email="$GITHUB_EMAIL" \
    merge develop \
    --no-ff \
    -m "chore: release to production — merge develop into main [skip ci]" \
    2>/dev/null || {
        # Si hay conflictos en CHANGELOG, tomamos la versión de develop
        if git status | grep -q "CHANGELOG.md"; then
            git checkout develop -- CHANGELOG.md
            git add CHANGELOG.md
            git -c user.name="Retia Production" -c user.email="$GITHUB_EMAIL" \
                commit --no-edit 2>/dev/null || true
        else
            echo -e "${RED}❌ Hay conflictos de merge que requieren resolución manual.${NC}"
            git merge --abort 2>/dev/null || true
            exit 1
        fi
    }

MERGE_COMMIT=$(git rev-parse --short HEAD)
echo -e "   ${GREEN}✅ Merge completado: $MERGE_COMMIT${NC}"

# Verificar que el tag no exista ya
if git tag | grep -q "^${RELEASE_TAG}$"; then
    echo -e "${RED}❌ El tag '$RELEASE_TAG' ya existe.${NC}"
    echo -e "${YELLOW}   Usa --tag v1.X.Y con un número mayor, o borra el tag existente.${NC}"
    git checkout develop 2>/dev/null || true
    exit 1
fi

# Crear tag anotado en el merge commit
git -c user.name="Retia Production" -c user.email="$GITHUB_EMAIL" \
    tag -a "$RELEASE_TAG" -m "Release $RELEASE_TAG — production deployment"
echo -e "   ${GREEN}🏷️  Tag creado: $RELEASE_TAG en $MERGE_COMMIT${NC}"

# Push a GitHub como retia-online
echo -e "\n🐙 Push como: ${GREEN}$GITHUB_USERNAME${NC} → github.com/${REPO_PATH} (main + $RELEASE_TAG)"

if git push "$HTTPS_REMOTE" main "$RELEASE_TAG" 2>&1 | sed "s|${GITHUB_TOKEN}|***|g"; then
    echo -e "${GREEN}✅ Push exitoso — Vercel detectará el push y lanzará el deployment.${NC}"
else
    echo -e "${RED}❌ Push falló. Verifica permisos del GITHUB_TOKEN.${NC}"
    exit 1
fi

# Sincronizar develop con el merge commit para evitar divergencias futuras
git checkout develop
git -c user.name="Retia Production" -c user.email="$GITHUB_EMAIL" \
    merge main --ff-only 2>/dev/null || true
git push "$HTTPS_REMOTE" develop 2>&1 | sed "s|${GITHUB_TOKEN}|***|g" || true
git checkout main

# ==============================================================================
# 7. ESPERAR Y VERIFICAR URL DE PRODUCCIÓN
# ==============================================================================
PROD_URL=$(echo "$NEXTAUTH_URL" | sed 's|/$||')
[ -z "$PROD_URL" ] && PROD_URL="https://retia.online"

echo -e "\n${BLUE}🚀 Deployment de producción triggerado por push a main...${NC}"
echo -e "🔗 URL: ${CYAN}$PROD_URL${NC}"
echo -e "📋 Dashboard: ${CYAN}https://vercel.com/retias-projects/monorepo${NC}"
echo "⏳ Esperando 15 segundos..."
sleep 15

echo -e "\n🔍 Verificando URL de producción..."
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$PROD_URL" || echo "000")

echo -e "\n${GREEN}======================================================================${NC}"
if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 301 ] || [ "$HTTP_STATUS" -eq 302 ]; then
    echo -e "${GREEN}🎉 ¡PRODUCCIÓN ACTIVA! (HTTP $HTTP_STATUS)${NC}"
elif [ "$HTTP_STATUS" -eq 401 ]; then
    echo -e "${GREEN}🎉 ¡PRODUCCIÓN ACTIVA! (HTTP 401 — Vercel Deployment Protection)${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP $HTTP_STATUS — el build puede estar aún en curso.${NC}"
    echo -e "   Verifica en el dashboard de Vercel."
fi
echo -e "🏷️  Versión:    ${CYAN}$RELEASE_TAG${NC}"
echo -e "🔗 URL:        ${CYAN}$PROD_URL${NC}"
echo -e "📋 Dashboard:  ${CYAN}https://vercel.com/retias-projects/monorepo${NC}"
echo -e "${GREEN}======================================================================${NC}"
