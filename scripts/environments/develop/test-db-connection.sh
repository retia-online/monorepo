#!/bin/bash

# ==============================================================================
# Script para probar la conexión a la base de datos MongoDB
# Ubicación: /scripts/environments/develop/test-db-connection.sh
#
# Qué hace este script:
#   1. Lee las variables de entorno desde .env.develop
#   2. Intenta conectar a MongoDB Atlas usando la URI proporcionada
#   3. Verifica que la conexión sea exitosa
#   4. Realiza una operación básica (listar bases de datos) para confirmar
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

echo -e "${BLUE}🔍 Iniciando prueba de conexión a base de datos MongoDB${NC}"
echo "=========================================================================="

# ==============================================================================
# 1. VERIFICAR HERRAMIENTAS REQUERIDAS
# ==============================================================================
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado.${NC}"
    echo "Instálalo ejecutando: https://nodejs.org/"
    exit 1
fi

if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB Shell (mongosh/mongo) no está instalado.${NC}"
    echo "Se usará Node.js para la prueba de conexión."
    USE_NODE=1
else
    USE_NODE=0
fi

# ==============================================================================
# 2. LEER CONFIGURACIÓN DESDE .env.develop
# ==============================================================================
ENV_FILE="$PROJECT_ROOT/apps/web/.env.develop"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ No se encontró el archivo de variables: $ENV_FILE${NC}"
    echo -e "${YELLOW}Intenta con: $PROJECT_ROOT/apps/web/.env.develop.local${NC}"
    ENV_FILE="$PROJECT_ROOT/apps/web/.env.develop.local"
    
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${RED}❌ No se encontró ningún archivo de variables.${NC}"
        exit 1
    fi
fi

echo -e "📄 Leyendo variables de: ${CYAN}$ENV_FILE${NC}"

# Extraer MONGODB_URI del archivo .env
MONGODB_URI=$(grep -E "^MONGODB_URI=" "$ENV_FILE" | cut -d'=' -f2- | xargs 2>/dev/null || echo "")

if [ -z "$MONGODB_URI" ]; then
    echo -e "${RED}❌ No se encontró MONGODB_URI en el archivo de variables.${NC}"
    exit 1
fi

# Limpiar comillas si las hay
MONGODB_URI="${MONGODB_URI#\"}"
MONGODB_URI="${MONGODB_URI%\"}"
MONGODB_URI="${MONGODB_URI#\'}"
MONGODB_URI="${MONGODB_URI%\'}"

echo -e "🔗 URI de MongoDB: ${CYAN}${MONGODB_URI:0:60}...${NC}"

# Extraer información de la URI para mostrar (sin credenciales)
URI_FOR_DISPLAY=$(echo "$MONGODB_URI" | sed -E 's|mongodb\+srv://[^:]+:[^@]+@|mongodb+srv://***:***@|')

echo -e "📊 URI (segura): ${CYAN}$URI_FOR_DISPLAY${NC}"

# ==============================================================================
# 3. PROBAR CONEXIÓN CON NODE.JS (más confiable para Atlas)
# ==============================================================================
echo -e "\n${BLUE}🧪 Probando conexión con Node.js...${NC}"

# Crear un script Node.js temporal para probar la conexión (ESM)
TEST_SCRIPT=$(cat << 'EOF'
import('mongoose').then(async ({ default: mongoose }) => {
    async function testConnection() {
        const uri = process.env.MONGODB_URI;
        
        if (!uri) {
            console.error('❌ MONGODB_URI no está definida');
            process.exit(1);
        }
        
        console.log('🔗 Conectando a MongoDB Atlas...');
        
        const options = {
            serverSelectionTimeoutMS: 10000, // 10 segundos
            socketTimeoutMS: 45000, // 45 segundos
            connectTimeoutMS: 10000, // 10 segundos
            maxPoolSize: 10,
        };
        
        try {
            // Intentar conexión
            await mongoose.connect(uri, options);
            
            // Obtener información de la conexión
            const conn = mongoose.connection;
            const host = conn.host;
            const port = conn.port;
            const name = conn.name;
            
            console.log('✅ Conexión exitosa!');
            console.log(`   Host: ${host}`);
            console.log(`   Port: ${port}`);
            console.log(`   Database: ${name}`);
            
            // Listar bases de datos disponibles
            const adminDb = conn.db.admin();
            const dbList = await adminDb.listDatabases();
            
            console.log(`\n📊 Bases de datos disponibles (${dbList.databases.length}):`);
            dbList.databases.forEach(db => {
                console.log(`   - ${db.name} (${db.sizeOnDisk} bytes)`);
            });
            
            // Intentar una operación simple
            const collections = await conn.db.listCollections().toArray();
            console.log(`\n🗂️  Colecciones en la base de datos actual (${collections.length}):`);
            collections.forEach(col => {
                console.log(`   - ${col.name}`);
            });
            
            // Cerrar conexión
            await mongoose.disconnect();
            console.log('\n🔒 Conexión cerrada correctamente.');
            
            process.exit(0);
            
        } catch (error) {
            console.error('❌ Error de conexión:', error.message);
            
            if (error.name === 'MongooseServerSelectionError') {
                console.error('\n📋 Posibles causas:');
                console.error('   1. La IP no está en la whitelist de MongoDB Atlas');
                console.error('   2. Credenciales incorrectas');
                console.error('   3. Problemas de red/firewall');
                console.error('   4. Cluster no disponible');
                
                console.error('\n🔧 Soluciones sugeridas:');
                console.error('   • Agrega la IP actual a la whitelist de MongoDB Atlas');
                console.error('   • Verifica las credenciales en MONGODB_URI');
                console.error('   • Revisa la configuración del firewall');
                console.error('   • Asegúrate de que el cluster esté activo en Atlas');
            }
            
            process.exit(1);
        }
    }

    // Manejar cierre limpio
    process.on('SIGINT', async () => {
        await mongoose.disconnect();
        process.exit(0);
    });

    await testConnection();
}).catch(err => {
    console.error('❌ No se pudo importar mongoose:', err.message);
    console.log('💡 Ejecuta desde la raíz del proyecto donde están las dependencias');
    process.exit(1);
});
EOF
)

# Guardar script temporal
TEMP_SCRIPT_FILE=$(mktemp).mjs
echo "$TEST_SCRIPT" > "$TEMP_SCRIPT_FILE"

# Ejecutar prueba
export MONGODB_URI="$MONGODB_URI"
cd "$PROJECT_ROOT"

if node "$TEMP_SCRIPT_FILE"; then
    echo -e "\n${GREEN}🎉 ¡Prueba de conexión exitosa!${NC}"
    echo -e "${GREEN}La base de datos MongoDB Atlas está accesible.${NC}"
else
    echo -e "\n${RED}❌ ¡Prueba de conexión fallida!${NC}"
    echo -e "${YELLOW}Revisa los errores anteriores para diagnosticar el problema.${NC}"
fi

# Limpiar
rm -f "$TEMP_SCRIPT_FILE"

# ==============================================================================
# 4. PROBAR CON MONGOSH (opcional, si está instalado)
# ==============================================================================
if [ $USE_NODE -eq 0 ]; then
    echo -e "\n${BLUE}🔍 Probando conexión con MongoDB Shell...${NC}"
    
    # Extraer solo el host de la URI para mostrar
    HOST=$(echo "$MONGODB_URI" | sed -n 's/.*@\([^/]*\).*/\1/p')
    
    if [ -n "$HOST" ]; then
        echo -e "🌐 Intentando conectar a: ${CYAN}$HOST${NC}"
        
        # Crear comando para mongosh/mongo
        if command -v mongosh &> /dev/null; then
            # mongosh (nueva versión)
            CMD="mongosh '$MONGODB_URI' --eval 'db.adminCommand({listDatabases:1})' --quiet --timeout 10000"
        else
            # mongo (versión antigua)
            CMD="mongo '$MONGODB_URI' --eval 'db.adminCommand({listDatabases:1})' --quiet --timeout 10000"
        fi
        
        echo -e "⚡ Ejecutando: ${CMD:0:80}..."
        
        if eval "$CMD" 2>/dev/null; then
            echo -e "${GREEN}✅ MongoDB Shell también puede conectarse.${NC}"
        else
            echo -e "${YELLOW}⚠️  MongoDB Shell no pudo conectarse (pero Node.js sí).${NC}"
        fi
    fi
fi

# ==============================================================================
# 5. VERIFICAR WHITELIST DE IPs
# ==============================================================================
echo -e "\n${BLUE}🌍 Verificación de IP y whitelist...${NC}"

# Obtener IP pública actual
echo -e "📡 Obteniendo IP pública actual..."
CURRENT_IP=$(curl -s -4 ifconfig.me 2>/dev/null || curl -s -4 icanhazip.com 2>/dev/null || echo "No se pudo obtener")

if [ "$CURRENT_IP" != "No se pudo obtener" ]; then
    echo -e "📍 Tu IP pública actual es: ${CYAN}$CURRENT_IP${NC}"
    echo -e "${YELLOW}💡 Esta IP debe estar en la whitelist de MongoDB Atlas.${NC}"
    echo -e "   Para Vercel deployments, necesitas:"
    echo -e "   1. Agregar ${CYAN}0.0.0.0/0${NC} (ALLOW ALL) temporalmente para pruebas"
    echo -e "   2. O agregar las IPs específicas de Vercel (recomendado para producción)"
else
    echo -e "${YELLOW}⚠️  No se pudo obtener la IP pública actual.${NC}"
fi

# ==============================================================================
# 6. RESUMEN Y RECOMENDACIONES
# ==============================================================================
echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN}📋 RESUMEN DE LA PRUEBA DE CONEXIÓN${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo -e "🔗 URI: ${URI_FOR_DISPLAY}"
echo -e "🏠 Entorno: Develop/Staging"
echo -e "📊 Estado: $([ $? -eq 0 ] && echo '✅ CONEXIÓN EXITOSA' || echo '❌ CONEXIÓN FALLIDA')"
echo -e "\n${YELLOW}📝 Pasos siguientes si la conexión falla:${NC}"
echo -e "   1. Revisar MONGODB_URI en ${CYAN}.env.develop${NC}"
echo -e "   2. Agregar IPs a whitelist en MongoDB Atlas Dashboard"
echo -e "   3. Verificar que el cluster esté activo"
echo -e "   4. Probar con ${CYAN}0.0.0.0/0${NC} temporalmente"
echo -e "\n${GREEN}======================================================================${NC}"