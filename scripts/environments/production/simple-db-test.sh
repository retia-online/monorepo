#!/bin/bash

# Script muy simple para probar conexión a MongoDB
# No requiere dependencias específicas - usa mongosh si está disponible

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
ENV_FILE="$PROJECT_ROOT/apps/web/.env.production"

echo "🔍 Probando conexión a MongoDB..."

# Verificar archivo
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ No se encontró $ENV_FILE"
    exit 1
fi

# Extraer MONGODB_URI
MONGODB_URI=$(grep -E "^MONGODB_URI=" "$ENV_FILE" | cut -d'=' -f2- | xargs)
MONGODB_URI="${MONGODB_URI#\"}"
MONGODB_URI="${MONGODB_URI%\"}"

echo "📍 URI: ${MONGODB_URI:0:60}..."

# Verificar si mongosh está disponible
if command -v mongosh &> /dev/null; then
    echo "🧪 Probando con mongosh..."
    # Usar timeout si está disponible, sino ejecutar directamente
    if command -v timeout &> /dev/null; then
        timeout 10 mongosh "$MONGODB_URI" --eval "db.adminCommand({ping:1})" --quiet
    else
        mongosh "$MONGODB_URI" --eval "db.adminCommand({ping:1})" --quiet
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ ¡Conexión exitosa con mongosh!"
        exit 0
    fi
fi

# Verificar si mongo (versión antigua) está disponible
if command -v mongo &> /dev/null; then
    echo "🧪 Probando con mongo..."
    if command -v timeout &> /dev/null; then
        timeout 10 mongo "$MONGODB_URI" --eval "db.adminCommand({ping:1})" --quiet
    else
        mongo "$MONGODB_URI" --eval "db.adminCommand({ping:1})" --quiet
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ ¡Conexión exitosa con mongo!"
        exit 0
    fi
fi

echo "⚠️  mongosh/mongo no están instalados o la conexión falló."
echo "💡 Instala MongoDB Shell:"
echo "   - macOS: brew install mongosh"
echo "   - Linux: https://docs.mongodb.com/mongodb-shell/install/"
echo "   - Windows: https://www.mongodb.com/try/download/shell"

# Obtener IP actual para whitelist
echo "🌍 Tu IP actual (para whitelist):"
curl -s ifconfig.me || curl -s icanhazip.com || echo "No se pudo obtener"

echo "🔧 Para solucionar problemas de conexión:"
echo "   1. Agrega tu IP a MongoDB Atlas whitelist"
echo "   2. Verifica las credenciales en MONGODB_URI"
echo "   3. Asegúrate de que el cluster esté activo"

exit 1