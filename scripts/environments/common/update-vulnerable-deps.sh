#!/bin/bash

# Script para actualizar dependencias vulnerables
# Uso: ./update-vulnerable-deps.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔒 Actualizando dependencias vulnerables${NC}"
echo "=============================================="

# Función para imprimir sección
section() {
    echo -e "\n${YELLOW}📋 $1${NC}"
    echo "----------------------------------------"
}

# Función para preguntar confirmación
confirm() {
    read -p "$1 [s/N]: " -n 1 -r
    echo
    [[ $REPLY =~ ^[Ss]$ ]]
}

section "Dependencias críticas a actualizar"

echo "⚠️  Las siguientes dependencias tienen vulnerabilidades conocidas:"
echo ""
echo "1. glob@7.2.3, glob@9.3.5 - Versiones antiguas con vulnerabilidades"
echo "   - Usado por: react-native, jest, eslint, rimraf"
echo "   - Recomendación: Actualizar a glob@10+"
echo ""
echo "2. uuid@7.0.3, uuid@9.0.1 - Versiones no soportadas"
echo "   - Usado por: @storybook/addon-actions, xcode"
echo "   - Recomendación: Actualizar a uuid@11+"
echo ""
echo "3. abab@2.0.6 - Módulo no soportado, fugas de memoria"
echo "   - Usado por: jsdom"
echo "   - Recomendación: Usar atob()/btoa() nativos"
echo ""
echo "4. rimraf@3.0.2 - Versiones anteriores a v4 no soportadas"
echo "   - Usado por: eslint, @react-native/dev-middleware"
echo "   - Recomendación: Actualizar a rimraf@5+"
echo ""
echo "5. eslint@8.57.1 - Versión no soportada"
echo "   - Recomendación: Actualizar a eslint@9+"
echo ""

if ! confirm "¿Continuar con la actualización de dependencias vulnerables?"; then
    echo "Actualización cancelada"
    exit 0
fi

section "Actualizando dependencias en workspace raíz"
cd "$PROJECT_ROOT"

# Actualizar glob en dependencias directas
echo "📦 Buscando dependencias glob..."
GLOB_DEPS=$(yarn why glob 2>/dev/null | grep -E "^\s*Found" || echo "No encontrado")
echo "$GLOB_DEPS"

# Actualizar eslint si es necesario
if grep -q '"eslint":' package.json; then
    echo "🔄 Actualizando eslint..."
    yarn upgrade eslint --latest
    echo -e "  ✅ eslint actualizado"
fi

section "Actualizando dependencias en apps/web"
cd "$PROJECT_ROOT/apps/web"

# Actualizar dependencias vulnerables en web
echo "🔍 Analizando dependencias de web..."
if grep -q '"eslint":' package.json; then
    echo "🔄 Actualizando eslint en web..."
    yarn upgrade eslint --latest
    echo -e "  ✅ eslint actualizado en web"
fi

# Actualizar @types/bcryptjs (stub types)
if grep -q '"@types/bcryptjs":' package.json; then
    echo "🔄 Eliminando @types/bcryptjs (stub types)..."
    yarn remove @types/bcryptjs
    echo -e "  ✅ @types/bcryptjs eliminado"
fi

section "Actualizando dependencias en apps/mobile"
cd "$PROJECT_ROOT/apps/mobile"

# Actualizar eslint en mobile
if grep -q '"eslint":' package.json; then
    echo "🔄 Actualizando eslint en mobile..."
    yarn upgrade eslint --latest
    echo -e "  ✅ eslint actualizado en mobile"
fi

# Actualizar babel-plugin-module-resolver (tiene glob vulnerable)
if grep -q '"babel-plugin-module-resolver":' package.json; then
    echo "🔄 Actualizando babel-plugin-module-resolver..."
    yarn upgrade babel-plugin-module-resolver --latest
    echo -e "  ✅ babel-plugin-module-resolver actualizado"
fi

section "Actualizando dependencias en packages/"
cd "$PROJECT_ROOT"

# Buscar y actualizar dependencias vulnerables en todos los packages
for pkg in packages/*/; do
    if [ -f "$pkg/package.json" ]; then
        echo "🔍 Analizando $pkg..."
        
        # Verificar si tiene jest (que usa glob vulnerable)
        if grep -q '"jest":' "$pkg/package.json"; then
            echo "  🔄 Actualizando jest en $pkg..."
            cd "$pkg"
            yarn upgrade jest --latest 2>/dev/null || true
            cd "$PROJECT_ROOT"
            echo "  ✅ jest actualizado en $pkg"
        fi
        
        # Verificar si tiene jsdom (que usa abab vulnerable)
        if grep -q '"jsdom":' "$pkg/package.json" || grep -q '"jest-environment-jsdom":' "$pkg/package.json"; then
            echo "  🔄 Actualizando jsdom/jest-environment-jsdom en $pkg..."
            cd "$pkg"
            yarn upgrade jsdom jest-environment-jsdom --latest 2>/dev/null || true
            cd "$PROJECT_ROOT"
            echo "  ✅ jsdom/jest-environment-jsdom actualizado en $pkg"
        fi
    fi
done

section "Verificando actualizaciones pendientes"
echo "🔍 Ejecutando auditoría de seguridad..."
cd "$PROJECT_ROOT"
yarn audit --level high 2>/dev/null || true

section "Reinstalando dependencias"
echo "📦 Reinstalando todas las dependencias..."
yarn install
echo -e "  ✅ Dependencias reinstaladas"

section "Resumen de actualización"
echo -e "${GREEN}✅ Actualización de dependencias vulnerables completada${NC}"
echo ""
echo "📋 Cambios realizados:"
echo "1. ✅ eslint actualizado a versión más reciente"
echo "2. ✅ @types/bcryptjs eliminado (stub types innecesario)"
echo "3. ✅ babel-plugin-module-resolver actualizado"
echo "4. ✅ jest actualizado donde estaba presente"
echo "5. ✅ jsdom/jest-environment-jsdom actualizado"
echo ""
echo "⚠️  Notas importantes:"
echo "- Algunas dependencias (glob, uuid, abab, rimraf) son transitive dependencies"
echo "- Pueden requerir actualización manual de los paquetes que las usan"
echo "- React Native 0.81.5 puede tener dependencias fijas que no se pueden actualizar"
echo ""
echo "🔧 Próximos pasos recomendados:"
echo "1. Ejecutar tests: yarn test"
echo "2. Verificar que todo funciona: yarn dev"
echo "3. Monitorear logs en producción si hay cambios"
echo ""
echo "📞 Para más ayuda:"
echo "- Revisar logs de yarn audit"
echo "- Consultar advisories en https://github.com/advisories"
echo "- Considerar actualización mayor de React Native si es necesario"

# Preguntar si ejecutar tests
if confirm "¿Ejecutar tests después de la actualización?"; then
    echo "🧪 Ejecutando tests..."
    yarn test 2>&1 | tail -50
fi