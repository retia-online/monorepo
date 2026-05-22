#!/bin/bash

# Script de configuración para MongoDB local
# Uso: ./setup-mongodb.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🗄️  Configuración de MongoDB LOCAL${NC}"
echo "=========================================="

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

section "Requisitos previos"
echo "MongoDB local es necesario para desarrollo. Opciones:"
echo "1. ✅ MongoDB Community Edition (recomendado)"
echo "2. 🐳 MongoDB con Docker"
echo "3. ☁️  MongoDB Atlas (remoto, no recomendado para desarrollo)"
echo ""

section "Opciones de instalación"
echo "Selecciona tu sistema operativo:"
echo "1. 🍎 macOS (con Homebrew)"
echo "2. 🐧 Linux (Ubuntu/Debian)"
echo "3. 🪟 Windows"
echo "4. 🐳 Docker (cualquier sistema)"
echo "5. 🚪 Salir"

read -p "Opción [1]: " OPTION
OPTION=${OPTION:-1}

case $OPTION in
    "1")
        # macOS con Homebrew
        section "Instalación en macOS (Homebrew)"
        
        if ! command -v brew &> /dev/null; then
            echo -e "${RED}❌ Homebrew no está instalado${NC}"
            echo "Instala Homebrew primero:"
            echo "/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
        
        echo "📦 Instalando MongoDB Community Edition..."
        echo ""
        
        # Tap de MongoDB
        brew tap mongodb/brew
        
        # Instalar MongoDB
        brew install mongodb-community
        
        echo ""
        echo "✅ MongoDB instalado"
        echo ""
        
        # Iniciar servicio
        if confirm "¿Iniciar servicio MongoDB ahora?"; then
            brew services start mongodb-community
            echo -e "  ✅ MongoDB iniciado"
        fi
        
        # Verificar instalación
        section "Verificación de instalación"
        if brew services list | grep -q "mongodb-community.*started"; then
            echo -e "  ✅ MongoDB servicio corriendo"
        else
            echo -e "${YELLOW}⚠️  MongoDB servicio no iniciado${NC}"
        fi
        
        # Probar conexión
        sleep 2
        if mongosh --eval "db.version()" --quiet &> /dev/null; then
            echo -e "  ✅ MongoDB conectado correctamente"
        else
            echo -e "${YELLOW}⚠️  MongoDB no responde, pero puede necesitar más tiempo${NC}"
        fi
        ;;
    
    "2")
        # Linux (Ubuntu/Debian)
        section "Instalación en Linux (Ubuntu/Debian)"
        
        echo "📦 Instalando MongoDB Community Edition..."
        echo ""
        
        # Importar clave pública
        wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
        
        # Crear lista de fuentes
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
        
        # Actualizar e instalar
        sudo apt-get update
        sudo apt-get install -y mongodb-org
        
        echo ""
        echo "✅ MongoDB instalado"
        echo ""
        
        # Iniciar servicio
        if confirm "¿Iniciar servicio MongoDB ahora?"; then
            sudo systemctl start mongod
            sudo systemctl enable mongod
            echo -e "  ✅ MongoDB iniciado y habilitado al inicio"
        fi
        
        # Verificar instalación
        section "Verificación de instalación"
        if sudo systemctl is-active --quiet mongod; then
            echo -e "  ✅ MongoDB servicio corriendo"
        else
            echo -e "${YELLOW}⚠️  MongoDB servicio no iniciado${NC}"
        fi
        
        # Probar conexión
        sleep 2
        if mongosh --eval "db.version()" --quiet &> /dev/null; then
            echo -e "  ✅ MongoDB conectado correctamente"
        else
            echo -e "${YELLOW}⚠️  MongoDB no responde, pero puede necesitar más tiempo${NC}"
        fi
        ;;
    
    "3")
        # Windows
        section "Instalación en Windows"
        
        echo "📦 MongoDB en Windows:"
        echo ""
        echo "1. Descarga el instalador MSI desde:"
        echo "   https://www.mongodb.com/try/download/community"
        echo ""
        echo "2. Ejecuta el instalador"
        echo "3. Sigue las instrucciones del instalador"
        echo "4. MongoDB se instalará como servicio de Windows"
        echo ""
        echo "💡 Recomendado: Instalar MongoDB Compass también"
        echo "   (GUI para MongoDB)"
        echo ""
        
        if confirm "¿Continuar con configuración después de instalar?"; then
            # Asumir instalación estándar
            echo ""
            echo "🔧 Configuración estándar:"
            echo "- Puerto: 27017"
            echo "- Data path: C:\\data\\db"
            echo "- Log path: C:\\Program Files\\MongoDB\\Server\\7.0\\log"
            echo ""
            echo "💡 Para verificar instalación:"
            echo "1. Abrir Command Prompt como Administrador"
            echo "2. Ejecutar: net start MongoDB"
            echo "3. Ejecutar: mongosh"
        fi
        ;;
    
    "4")
        # Docker
        section "Instalación con Docker"
        
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}❌ Docker no está instalado${NC}"
            echo "Instala Docker primero: https://docs.docker.com/get-docker/"
            exit 1
        fi
        
        echo "🐳 Iniciando MongoDB con Docker..."
        echo ""
        
        # Crear volumen para persistencia
        docker volume create mongodb_data
        
        # Iniciar contenedor
        docker run -d \
            --name mongodb-local \
            -p 27017:27017 \
            -v mongodb_data:/data/db \
            -e MONGO_INITDB_ROOT_USERNAME=admin \
            -e MONGO_INITDB_ROOT_PASSWORD=secret \
            mongo:latest
        
        echo ""
        echo "✅ MongoDB con Docker iniciado"
        echo ""
        
        # Connection string
        CONNECTION_STRING="mongodb://admin:secret@localhost:27017"
        
        section "Connection String"
        echo "🔗 Usa esta cadena de conexión:"
        echo ""
        echo "$CONNECTION_STRING"
        echo ""
        echo "💡 Para desarrollo local, puedes usar:"
        echo "mongodb://localhost:27017/retia-local"
        echo ""
        
        # Probar conexión
        echo "⏳ Esperando que MongoDB esté listo..."
        sleep 5
        
        if docker exec mongodb-local mongosh --eval "db.version()" --quiet &> /dev/null; then
            echo -e "  ✅ MongoDB conectado correctamente"
        else
            echo -e "${YELLOW}⚠️  MongoDB no responde aún, espera unos segundos más${NC}"
        fi
        
        # Comandos útiles
        section "Comandos Docker útiles"
        echo "🐳 Comandos para gestionar MongoDB con Docker:"
        echo ""
        echo "Ver logs:"
        echo "  docker logs mongodb-local"
        echo ""
        echo "Detener contenedor:"
        echo "  docker stop mongodb-local"
        echo ""
        echo "Iniciar contenedor:"
        echo "  docker start mongodb-local"
        echo ""
        echo "Eliminar contenedor:"
        echo "  docker rm -f mongodb-local"
        echo ""
        echo "Acceder a shell:"
        echo "  docker exec -it mongodb-local mongosh"
        ;;
    
    "5")
        echo "Saliendo..."
        exit 0
        ;;
    
    *)
        echo -e "${RED}❌ Opción no válida${NC}"
        exit 1
        ;;
esac

section "Configuración para desarrollo"
echo "📝 Para desarrollo local, configura:"
echo ""
echo "1. 🌐 Web App (apps/web/.env.local):"
echo "   MONGODB_URI=mongodb://localhost:27017/retia-local"
echo ""
echo "2. 🧪 Testing (apps/web/.env.test):"
echo "   MONGODB_URI=mongodb://localhost:27017/retia-test"
echo ""
echo "💡 Bases de datos recomendadas:"
echo "- retia-local: Desarrollo principal"
echo "- retia-test: Testing (se limpia frecuentemente)"
echo "- retia-staging: Staging local (opcional)"

section "MongoDB Shell (mongosh)"
echo "🔧 Comandos útiles de MongoDB Shell:"
echo ""
echo "Conectar:"
echo "  mongosh"
echo "  mongosh mongodb://localhost:27017/retia-local"
echo ""
echo "Comandos básicos:"
echo "  show dbs                    # Ver bases de datos"
echo "  use retia-local             # Cambiar a base de datos"
echo "  show collections            # Ver colecciones"
echo "  db.users.find().limit(5)    # Ver primeros 5 usuarios"
echo "  db.dropDatabase()           # Eliminar base de datos (cuidado!)"
echo ""
echo "Crear usuario para app:"
echo "  use retia-local"
echo "  db.createUser({"
echo "    user: 'appuser',"
echo "    pwd: 'password123',"
echo "    roles: [{ role: 'readWrite', db: 'retia-local' }]"
echo "  })"

section "MongoDB Compass (GUI)"
echo "🖥️  MongoDB Compass - GUI recomendada:"
echo ""
echo "Descargar desde:"
echo "https://www.mongodb.com/products/compass"
echo ""
echo "Configuración:"
echo "1. Abrir MongoDB Compass"
echo "2. Connection String: mongodb://localhost:27017"
echo "3. Connect"
echo "4. Navegar bases de datos y colecciones"
echo ""
echo "Ventajas:"
echo "- Interfaz visual"
echo "- Query builder"
echo "- Aggregation pipeline builder"
echo "- Performance analytics"

section "Solución de problemas"
echo "🔧 Problemas comunes:"
echo ""
echo "❌ 'mongod: command not found'"
echo "   - MongoDB no instalado o no en PATH"
echo "   - Verificar instalación"
echo ""
echo "❌ 'Connection refused'"
echo "   - MongoDB no está corriendo"
echo "   - Iniciar servicio: brew services start mongodb-community"
echo ""
echo "❌ 'Permission denied' en /data/db"
echo "   - Problemas de permisos en directorio de datos"
echo "   - macOS: sudo chown -R `whoami` /data/db"
echo "   - Linux: sudo chown -R mongodb:mongodb /var/lib/mongodb"
echo ""
echo "❌ Puerto 27017 en uso"
echo "   - Otro proceso usando el puerto"
echo "   - Liberar: lsof -ti:27017 | xargs kill -9"
echo "   - O cambiar puerto en configuración"
echo ""
echo "🔗 Recursos:"
echo "- MongoDB Documentation: https://docs.mongodb.com"
echo "- MongoDB University: https://university.mongodb.com"
echo "- MongoDB Shell: https://www.mongodb.com/try/download/shell"

section "Mantenimiento"
echo "🛠️  Mantenimiento de MongoDB local:"
echo ""
echo "Backup de datos:"
echo "  mongodump --uri=\"mongodb://localhost:27017/retia-local\" --out=./backup"
echo ""
echo "Restore de datos:"
echo "  mongorestore --uri=\"mongodb://localhost:27017/retia-local\" ./backup/retia-local"
echo ""
echo "Limpiar base de datos de testing:"
echo "  mongosh mongodb://localhost:27017/retia-test --eval \"db.dropDatabase()\""
echo ""
echo "Ver tamaño de bases de datos:"
echo "  mongosh --eval \"db.adminCommand({listDatabases: 1})\""

echo ""
echo -e "${GREEN}✅ Configuración de MongoDB local completada${NC}"
echo "Ahora puedes usar MongoDB para desarrollo local."
