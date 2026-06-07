#!/bin/bash

# Script rápido para probar conexión a MongoDB
# Ubicación: /scripts/environments/develop/quick-db-test.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
ENV_FILE="$PROJECT_ROOT/apps/web/.env.production"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔍 Prueba rápida de conexión a MongoDB..."

# Verificar archivo .env
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ No se encontró $ENV_FILE${NC}"
    exit 1
fi

# Extraer MONGODB_URI
MONGODB_URI=$(grep -E "^MONGODB_URI=" "$ENV_FILE" | cut -d'=' -f2- | xargs 2>/dev/null || echo "")

if [ -z "$MONGODB_URI" ]; then
    echo -e "${RED}❌ No se encontró MONGODB_URI${NC}"
    exit 1
fi

# Limpiar comillas
MONGODB_URI="${MONGODB_URI#\"}"
MONGODB_URI="${MONGODB_URI%\"}"

echo "📍 URI encontrada: ${MONGODB_URI:0:50}..."

# Crear script Node.js simple que use TypeScript/ESM
cat > /tmp/mongo_test.mjs << 'EOF'
import('mongoose').then(async ({ default: mongoose }) => {
    try {
        console.log('Conectando...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 10000,
        });
        
        console.log('✅ ¡Conectado!');
        console.log('Host:', mongoose.connection.host);
        console.log('DB:', mongoose.connection.name);
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        
        if (err.name === 'MongooseServerSelectionError') {
            console.log('\n💡 Posible problema de whitelist de IP.');
            console.log('   Agrega esta IP a MongoDB Atlas:');
            const { exec } = await import('child_process');
            exec('curl -s ifconfig.me || curl -s icanhazip.com', (e, ip) => {
                if (!e) console.log('   IP actual:', ip.trim());
                process.exit(1);
            });
        } else {
            process.exit(1);
        }
    }
}).catch(err => {
    console.error('❌ No se pudo importar mongoose:', err.message);
    console.log('💡 Ejecuta desde la raíz del proyecto o instala mongoose globalmente');
    process.exit(1);
});
EOF

# Ejecutar prueba desde la raíz del proyecto
export MONGODB_URI="$MONGODB_URI"

echo "🧪 Probando conexión desde $PROJECT_ROOT..."
cd "$PROJECT_ROOT"
if node /tmp/mongo_test.mjs; then
    echo -e "\n${GREEN}🎉 ¡Conexión exitosa!${NC}"
else
    echo -e "\n${RED}❌ ¡Conexión fallida!${NC}"
fi

# Limpiar
rm -f /tmp/mongo_test.mjs