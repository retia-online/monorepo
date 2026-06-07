#!/bin/bash

# ==============================================================================
# Script de Despliegue Automatizado para Develop/Staging (Vercel)
# Ubicación: /scripts/environments/develop/deploy.sh
#
# Qué hace este script:
#   1. Verifica que la sesión de Vercel CLI sea la correcta (retia-online)
#   2. Vincula el proyecto si no está vinculado
#   3. Sube TODAS las variables de .env.develop al scope preview/develop de Vercel
#   4. Actualiza CHANGELOG.md con commits recientes (firmado como info@retia.online)
#   5. Hace git push usando el GITHUB_TOKEN de .env.develop (usuario retia-online)
#      → Vercel detecta el push vía webhook y lanza el deployment automáticamente
#   6. Verifica que la URL de staging responda correctamente
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando Despliegue Automatizado a Staging/Develop (Vercel Preview)${NC}"
echo "=========================================================================="

# ==============================================================================
# 1. VERIFICAR HERRAMIENTAS REQUERIDAS
# ==============================================================================
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI no está instalado.${NC}"
    echo "Instálalo ejecutando: npm install -g vercel"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git no está instalado.${NC}"
    exit 1
fi

# ==============================================================================
# 2. LEER CONFIGURACIÓN DESDE .env.develop
# ==============================================================================
ENV_FILE="$PROJECT_ROOT/apps/web/.env.develop"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ No se encontró el archivo de variables: $ENV_FILE${NC}"
    exit 1
fi

# Leer cuenta de Vercel con fallbacks seguros
VERCEL_EMAIL=$(grep -E "^VERCEL_EMAIL=" "$ENV_FILE" | cut -d'=' -f2- | xargs 2>/dev/null || echo "info@retia.online")
VERCEL_USERNAME=$(grep -E "^VERCEL_USERNAME=" "$ENV_FILE" | cut -d'=' -f2- | xargs 2>/dev/null || echo "retia-online")
[ -z "$VERCEL_EMAIL" ]    && VERCEL_EMAIL="info@retia.online"
[ -z "$VERCEL_USERNAME" ] && VERCEL_USERNAME="retia-online"

# Leer credenciales de GitHub para push con usuario correcto
GITHUB_USERNAME=$(grep -E "^GITHUB_USERNAME=" "$ENV_FILE" | cut -d'=' -f2- | xargs 2>/dev/null || echo "")
GITHUB_EMAIL=$(grep -E "^GITHUB_EMAIL=" "$ENV_FILE" | cut -d'=' -f2- | xargs 2>/dev/null || echo "")
GITHUB_TOKEN=$(grep -E "^GITHUB_TOKEN=" "$ENV_FILE" | cut -d'=' -f2- | xargs 2>/dev/null || echo "")

echo -e "📧 Cuenta Vercel objetivo: ${GREEN}$VERCEL_EMAIL${NC} (usuario: ${GREEN}$VERCEL_USERNAME${NC})"
[ -n "$GITHUB_USERNAME" ] && echo -e "🐙 Cuenta GitHub objetivo: ${GREEN}$GITHUB_USERNAME${NC} (${GREEN}$GITHUB_EMAIL${NC})"
echo -e "📄 Usando variables de: ${CYAN}$ENV_FILE${NC}"

# ==============================================================================
# 3. VERIFICAR SESIÓN DE VERCEL
# ==============================================================================
echo -e "\n🔑 Verificando sesión de Vercel CLI..."
CURRENT_USER=$(vercel whoami 2>&1 | sed 's/> Logged in as //g' | head -n1 | xargs 2>/dev/null || true)

if [ "$CURRENT_USER" = "$VERCEL_USERNAME" ] || [ "$CURRENT_USER" = "$VERCEL_EMAIL" ]; then
    echo -e "✅ Sesión correcta: ${GREEN}$CURRENT_USER${NC}"
elif [[ "$CURRENT_USER" == *"Error"* ]] || [ -z "$CURRENT_USER" ]; then
    echo -e "${YELLOW}⚠️  Sin sesión activa. Iniciando sesión con: ${GREEN}$VERCEL_EMAIL${NC}"
    echo "💡 Completa el login en el navegador..."
    vercel login "$VERCEL_EMAIL"
else
    # Sesión de otra cuenta — cerrar y re-autenticar automáticamente
    echo -e "${YELLOW}⚠️  Sesión activa de otra cuenta: ${RED}$CURRENT_USER${NC}"
    echo -e "🔄 Cambiando a la cuenta correcta: ${GREEN}$VERCEL_EMAIL${NC}"
    vercel logout || true
    vercel login "$VERCEL_EMAIL"
fi

# Validación final
if ! vercel whoami &>/dev/null; then
    echo -e "${RED}❌ No se pudo verificar la sesión. Asegúrate de haber completado el login.${NC}"
    exit 1
fi
echo -e "👤 Conectado como: ${GREEN}$(vercel whoami | head -n1)${NC}"

# ==============================================================================
# 4. VINCULAR PROYECTO SI ES NECESARIO
# ==============================================================================
WEB_APP_DIR="$PROJECT_ROOT/apps/web"
cd "$WEB_APP_DIR"

if [ ! -f ".vercel/project.json" ] && [ ! -f "$PROJECT_ROOT/.vercel/repo.json" ]; then
    echo -e "\n🔗 Vinculando proyecto a Vercel..."
    # Respaldar .env.local para que vercel link no lo sobrescriba
    [ -f ".env.local" ] && cp ".env.local" ".env.local.bak"
    vercel link --yes || true
    [ -f ".env.local.bak" ] && mv ".env.local.bak" ".env.local"

    if [ ! -f ".vercel/project.json" ] && [ ! -f "$PROJECT_ROOT/.vercel/repo.json" ]; then
        echo -e "${RED}❌ No se pudo vincular el proyecto. Ejecuta 'vercel link' manualmente en apps/web.${NC}"
        exit 1
    fi
fi

# Extraer nombre e ID del proyecto vinculado
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

echo -e "\n${GREEN}✅ Proyecto vinculado:${NC} $PROJECT_NAME (ID: $PROJECT_ID)"
echo "----------------------------------------------------------------------"

# ==============================================================================
# 5. SINCRONIZAR TODAS LAS VARIABLES DE .env.develop → VERCEL PREVIEW/develop
#
# Estrategia: Siempre sube TODAS las variables al scope "preview" de la rama
# "develop". Usa --force para sobrescribir sin necesidad de borrar primero.
# Omite VERCEL_EMAIL y VERCEL_USERNAME (son meta-variables del script).
# ==============================================================================
CURRENT_BRANCH=$(git -C "$PROJECT_ROOT" branch --show-current 2>/dev/null || echo "develop")
echo -e "\n📤 Sincronizando variables de ${CYAN}.env.develop${NC} → Vercel (preview/${CURRENT_BRANCH})..."

SKIP_KEYS=("VERCEL_EMAIL" "VERCEL_USERNAME" "GITHUB_USERNAME" "GITHUB_EMAIL" "GITHUB_TOKEN" "ATLAS_PUBLIC_KEY" "ATLAS_PRIVATE_KEY" "ATLAS_PROJECT_ID")
SYNC_OK=0
SYNC_FAIL=0

while IFS= read -r line || [ -n "$line" ]; do
    # Saltar comentarios y líneas vacías
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue

    # Solo procesar líneas con formato KEY=VALUE
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
        KEY="${BASH_REMATCH[1]}"
        VAL="${BASH_REMATCH[2]}"

        # Omitir variables meta del script
        skip=0
        for sk in "${SKIP_KEYS[@]}"; do
            [ "$KEY" = "$sk" ] && skip=1 && break
        done
        [ $skip -eq 1 ] && continue

        # Limpiar comillas del valor
        VAL="${VAL#\"}" ; VAL="${VAL%\"}"
        VAL="${VAL#\'}" ; VAL="${VAL%\'}"

        # Subir al scope preview de la rama develop con --force (sobrescribe si existe)
        # < /dev/null evita que vercel consuma el stdin del while-loop
        if vercel env add "$KEY" preview "$CURRENT_BRANCH" --value "$VAL" --yes --force < /dev/null &>/dev/null; then
            echo -e "  ${GREEN}✓${NC} $KEY"
            ((SYNC_OK++))
        else
            echo -e "  ${RED}✗${NC} $KEY (falló — verificar manualmente)"
            ((SYNC_FAIL++))
        fi
    fi
done < "$ENV_FILE"

echo -e "\n${GREEN}✅ Sync completado:${NC} $SYNC_OK variables subidas, $SYNC_FAIL errores."
if [ $SYNC_FAIL -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Algunas variables fallaron. Verifica en el dashboard de Vercel.${NC}"
fi

# ==============================================================================
# 6. ACTUALIZAR CHANGELOG.md Y GIT COMMIT (firmado como info@retia.online)
# ==============================================================================
cd "$PROJECT_ROOT"
echo -e "\n📝 Verificando CHANGELOG.md..."
CHANGELOG_FILE="$PROJECT_ROOT/CHANGELOG.md"

[ ! -f "$CHANGELOG_FILE" ] && printf "# Changelog\n\n" > "$CHANGELOG_FILE"

# Obtener commits recientes con fecha en formato YYYY-MM-DD
RECENT_COMMITS=$(git log --oneline -n 20 --no-merges --pretty=format:"%h %ad %s" --date=short 2>/dev/null || true)
NEW_ENTRIES=""
HAS_NEW_COMMITS=0

while IFS= read -r commit_line; do
    [ -z "$commit_line" ] && continue
    COMMIT_HASH=$(echo "$commit_line" | awk '{print $1}')
    COMMIT_DATE=$(echo "$commit_line" | awk '{print $2}')
    COMMIT_MSG=$(echo "$commit_line" | cut -d' ' -f3-)

    # Buscar el hash entre corchetes en el CHANGELOG
    if ! grep -q "\[$COMMIT_HASH\]" "$CHANGELOG_FILE" 2>/dev/null; then
        echo -e "  ➕ Nuevo commit: ${CYAN}$COMMIT_HASH${NC} — $COMMIT_MSG (${COMMIT_DATE})"
        NEW_ENTRIES="${NEW_ENTRIES}\n- [$COMMIT_HASH] $COMMIT_MSG ($COMMIT_DATE)"
        HAS_NEW_COMMITS=1
    fi
done <<< "$RECENT_COMMITS"

if [ $HAS_NEW_COMMITS -eq 1 ]; then
    # Crear nuevo CHANGELOG con las nuevas entradas primero
    TEMP_CHANGELOG=$(mktemp)
    echo "# Changelog" > "$TEMP_CHANGELOG"
    echo -e "$NEW_ENTRIES" >> "$TEMP_CHANGELOG"
    
    # Agregar las entradas existentes (omitiendo la línea del título)
    if [ -f "$CHANGELOG_FILE" ] && [ -s "$CHANGELOG_FILE" ]; then
        # Omitir la primera línea (# Changelog) y agregar el resto
        tail -n +2 "$CHANGELOG_FILE" >> "$TEMP_CHANGELOG"
    fi
    
    mv "$TEMP_CHANGELOG" "$CHANGELOG_FILE"

    git add "$CHANGELOG_FILE"
    git -c user.name="Retia Develop" -c user.email="$VERCEL_EMAIL" \
        commit -m "chore: update CHANGELOG.md with recent commits [skip ci]"
    echo -e "${GREEN}✅ CHANGELOG.md actualizado (commit firmado como $VERCEL_EMAIL)${NC}"
else
    echo -e "${GREEN}✅ CHANGELOG.md ya está al día.${NC}"
fi

# ==============================================================================
# 7. GIT PUSH CON USUARIO CORRECTO (via HTTPS token si está configurado)
# ==============================================================================
cd "$PROJECT_ROOT"
echo -e "\n📤 Publicando commits en GitHub..."

REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

if [ -n "$GITHUB_TOKEN" ] && [ -n "$GITHUB_USERNAME" ]; then
    # Extraer owner/repo desde la URL del remote (SSH o HTTPS)
    # SSH:   git@github.com:owner/repo.git   → owner/repo
    # HTTPS: https://github.com/owner/repo.git → owner/repo
    REPO_PATH=$(echo "$REMOTE_URL" | sed -E 's|git@github\.com:||; s|https://github\.com/||; s|\.git$||')
    HTTPS_REMOTE="https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${REPO_PATH}.git"

    echo -e "🐙 Push como: ${GREEN}$GITHUB_USERNAME${NC} → github.com/${REPO_PATH}"

    if git push "$HTTPS_REMOTE" "$CURRENT_BRANCH" 2>&1 | sed "s|${GITHUB_TOKEN}|***|g"; then
        echo -e "${GREEN}✅ Push exitoso como $GITHUB_USERNAME${NC}"
    else
        echo -e "${YELLOW}⚠️  Push con token falló. Intentando con remote original...${NC}"
        git push origin "$CURRENT_BRANCH" || echo -e "${RED}❌ Push falló. Continúa sin push.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  GITHUB_TOKEN no configurado en .env.develop — usando credenciales por defecto.${NC}"
    echo -e "   Para forzar el usuario correcto en GitHub/Vercel, agrega:"
    echo -e "   ${CYAN}GITHUB_USERNAME=retia-online${NC}"
    echo -e "   ${CYAN}GITHUB_EMAIL=info@retia.online${NC}"
    echo -e "   ${CYAN}GITHUB_TOKEN=<tu-token>${NC}"
    echo -e "   en ${CYAN}apps/web/.env.develop${NC}"
    git push origin "$CURRENT_BRANCH" || echo -e "${RED}❌ Push falló.${NC}"
fi

# ==============================================================================
# 8. ESPERAR QUE VERCEL CONSTRUYA (triggerado por el git push vía webhook)
# ==============================================================================
# El git push a GitHub ya disparó el deployment automático en Vercel.
# Solo esperamos y verificamos la URL canónica de staging.
STAGING_URL="https://develop-monorepo.vercel.app/"
echo -e "\n${BLUE}🚀 Deployment triggerado por git push — esperando que Vercel construya...${NC}"
echo -e "🔗 URL canónica: ${CYAN}$STAGING_URL${NC}"
echo -e "📋 Puedes seguir el progreso en: ${CYAN}https://vercel.com/retias-projects/monorepo${NC}"

echo "⏳ Esperando 15 segundos para que Vercel reciba el webhook y empiece el build..."
sleep 15

# ==============================================================================
# 9. VERIFICAR URL DE STAGING
# ==============================================================================
echo -e "\n🔍 Verificando URL de staging..."

HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$STAGING_URL" || echo "000")

echo -e "\n${GREEN}======================================================================${NC}"
if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 301 ] || [ "$HTTP_STATUS" -eq 302 ]; then
    echo -e "${GREEN}🎉 ¡STAGING RESPONDIENDO! (HTTP $HTTP_STATUS)${NC}"
elif [ "$HTTP_STATUS" -eq 401 ]; then
    echo -e "${GREEN}🎉 ¡STAGING ACTIVO! (HTTP 401 — protegido por Vercel Deployment Protection)${NC}"
    echo -e "${YELLOW}   Para acceder necesitas una sesión SSO de Vercel.${NC}"
else
    echo -e "${YELLOW}⚠️  La URL respondió HTTP $HTTP_STATUS — el build puede estar aún en curso.${NC}"
    echo -e "${YELLOW}   Verifica el progreso en el dashboard de Vercel.${NC}"
fi
echo -e "🔗 URL Staging:  ${CYAN}$STAGING_URL${NC}"
echo -e "📋 Dashboard:    ${CYAN}https://vercel.com/retias-projects/monorepo${NC}"
echo -e "${GREEN}======================================================================${NC}"
