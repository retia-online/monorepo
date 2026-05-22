#!/bin/bash

# Script de configuración para MongoDB Atlas en staging
# Uso: ./setup-mongodb.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🗄️  Configuración de MongoDB Atlas para STAGING${NC}"
echo "=================================================="

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
echo "Antes de continuar, necesitas:"
echo "1. ✅ Cuenta en MongoDB Atlas (https://cloud.mongodb.com)"
echo "2. ✅ Proyecto creado en MongoDB Atlas"
echo "3. ✅ Acceso de administrador al proyecto"
echo ""

if ! confirm "¿Tienes cuenta de MongoDB Atlas configurada?"; then
    echo -e "${YELLOW}⚠️  Crea una cuenta primero en: https://cloud.mongodb.com${NC}"
    exit 1
fi

section "Opciones de configuración"
echo "Selecciona qué configurar:"
echo "1. ✅ Crear cluster de staging desde cero"
echo "2. 🔧 Configurar cluster existente para staging"
echo "3. 📋 Solo generar connection string"
echo "4. 🚪 Salir"

read -p "Opción [1]: " OPTION
OPTION=${OPTION:-1}

case $OPTION in
    "1")
        # Crear cluster desde cero
        section "Creando cluster de staging desde cero"
        
        echo "📝 Información necesaria:"
        echo ""
        
        read -p "Nombre del cluster [retia-staging-cluster]: " CLUSTER_NAME
        CLUSTER_NAME=${CLUSTER_NAME:-retia-staging-cluster}
        
        read -p "Nombre de la base de datos [retia-staging]: " DATABASE_NAME
        DATABASE_NAME=${DATABASE_NAME:-retia-staging}
        
        read -p "Nombre de usuario [staging-user]: " USERNAME
        USERNAME=${USERNAME:-staging-user}
        
        read -p "Contraseña para el usuario: " -s PASSWORD
        echo
        
        if [ -z "$PASSWORD" ]; then
            echo -e "${RED}❌ La contraseña es requerida${NC}"
            exit 1
        fi
        
        echo ""
        echo "📋 Resumen de configuración:"
        echo "  Cluster: $CLUSTER_NAME"
        echo "  Base de datos: $DATABASE_NAME"
        echo "  Usuario: $USERNAME"
        echo ""
        
        if ! confirm "¿Continuar con esta configuración?"; then
            echo "Cancelando..."
            exit 0
        fi
        
        # Generar connection string
        CONNECTION_STRING="mongodb+srv://$USERNAME:$PASSWORD@$CLUSTER_NAME.xxxxx.mongodb.net/$DATABASE_NAME?retryWrites=true&w=majority"
        
        echo ""
        section "Connection String generada"
        echo "🔗 Copia esta cadena de conexión:"
        echo ""
        echo "$CONNECTION_STRING"
        echo ""
        echo "📝 Pasos manuales en MongoDB Atlas:"
        echo "1. Ve a https://cloud.mongodb.com"
        echo "2. Crea nuevo cluster:"
        echo "   - Tier: M0 Free (suficiente para staging)"
        echo "   - Region: Más cercana a tu ubicación"
        echo "   - Name: $CLUSTER_NAME"
        echo "3. Configura Database Access:"
        echo "   - Crea usuario: $USERNAME"
        echo "   - Contraseña: [la que ingresaste]"
        echo "   - Permisos: readWrite en $DATABASE_NAME"
        echo "4. Configura Network Access:"
        echo "   - Permite acceso desde cualquier IP (0.0.0.0/0)"
        echo "5. Conecta y crea la base de datos: $DATABASE_NAME"
        ;;
    
    "2")
        # Configurar cluster existente
        section "Configurar cluster existente para staging"
        
        echo "📝 Ingresa los datos de tu cluster existente:"
        echo ""
        
        read -p "Cluster name (sin .mongodb.net): " CLUSTER_NAME
        read -p "Database name: " DATABASE_NAME
        read -p "Username: " USERNAME
        read -p "Password: " -s PASSWORD
        echo
        
        if [ -z "$CLUSTER_NAME" ] || [ -z "$DATABASE_NAME" ] || [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
            echo -e "${RED}❌ Todos los campos son requeridos${NC}"
            exit 1
        fi
        
        # Generar connection string
        CONNECTION_STRING="mongodb+srv://$USERNAME:$PASSWORD@$CLUSTER_NAME.mongodb.net/$DATABASE_NAME?retryWrites=true&w=majority"
        
        echo ""
        section "Connection String"
        echo "🔗 Tu cadena de conexión es:"
        echo ""
        echo "$CONNECTION_STRING"
        echo ""
        echo "📋 Verificaciones necesarias:"
        echo "1. ✅ Usuario $USERNAME tiene permisos readWrite en $DATABASE_NAME"
        echo "2. ✅ Network Access permite 0.0.0.0/0"
        echo "3. ✅ Cluster está activo y accesible"
        ;;
    
    "3")
        # Solo generar connection string
        section "Generar connection string"
        
        echo "📝 Ingresa los datos para generar connection string:"
        echo ""
        
        read -p "Cluster name (ej: retia-staging-cluster): " CLUSTER_NAME
        read -p "Database name [retia-staging]: " DATABASE_NAME
        DATABASE_NAME=${DATABASE_NAME:-retia-staging}
        read -p "Username [staging-user]: " USERNAME
        USERNAME=${USERNAME:-staging-user}
        read -p "Password: " -s PASSWORD
        echo
        
        if [ -z "$CLUSTER_NAME" ] || [ -z "$PASSWORD" ]; then
            echo -e "${RED}❌ Cluster name y password son requeridos${NC}"
            exit 1
        fi
        
        # Generar connection string
        CONNECTION_STRING="mongodb+srv://$USERNAME:$PASSWORD@$CLUSTER_NAME.mongodb.net/$DATABASE_NAME?retryWrites=true&w=majority"
        
        echo ""
        section "Connection String generada"
        echo "🔗 Copia esta cadena de conexión:"
        echo ""
        echo "$CONNECTION_STRING"
        echo ""
        echo "💡 Usa esta cadena en:"
        echo "- apps/web/.env.staging como MONGODB_URI"
        echo "- Vercel Environment Variables"
        echo "- apps/mobile/.env.staging si aplica"
        ;;
    
    "4")
        echo "Saliendo..."
        exit 0
        ;;
    
    *)
        echo -e "${RED}❌ Opción no válida${NC}"
        exit 1
        ;;
esac

section "Configuración de variables de entorno"
echo "📝 Para usar esta configuración en el proyecto:"
echo ""
echo "1. 🌐 Web App (apps/web/.env.staging):"
echo "   MONGODB_URI=$CONNECTION_STRING"
echo ""
echo "2. 🚀 Vercel Environment Variables:"
echo "   Añade MONGODB_URI con el valor anterior"
echo ""
echo "3. 📱 Mobile App (si aplica):"
echo "   Añade en apps/mobile/.env.staging si necesitas acceso directo"

# Preguntar si quiere guardar en archivo
if confirm "¿Guardar connection string en archivo temporal?"; then
    TEMP_FILE="/tmp/mongodb-staging-connection.txt"
    echo "$CONNECTION_STRING" > "$TEMP_FILE"
    echo -e "  ✅ Guardado en: $TEMP_FILE"
fi

section "Pruebas de conexión"
echo "🔧 Para probar la conexión:"
echo ""
echo "1. Instala MongoDB Shell:"
echo "   brew install mongosh (macOS)"
echo "   o descarga desde https://www.mongodb.com/try/download/shell"
echo ""
echo "2. Conecta con:"
echo "   mongosh \"$CONNECTION_STRING\""
echo ""
echo "3. Verifica conexión:"
echo "   show dbs"
echo "   use $DATABASE_NAME"
echo "   show collections"

section "Monitoreo y mantenimiento"
echo "📊 MongoDB Atlas M0 Free tiene límites:"
echo "- 512MB de almacenamiento"
echo "- Compartido con otros usuarios"
echo "- Sin backups automáticos"
echo ""
echo "🔔 Recomendaciones:"
echo "1. Monitorea uso en MongoDB Atlas Dashboard"
echo "2. Configura alertas para uso alto"
echo "3. Considera upgrade a M10 si el proyecto crece"
echo "4. Realiza backups manuales periódicos"

section "Solución de problemas"
echo "🔧 Problemas comunes:"
echo ""
echo "❌ No se puede conectar:"
echo "   - Verifica Network Access (0.0.0.0/0)"
echo "   - Verifica usuario y contraseña"
echo "   - Verifica que el cluster esté activo"
echo ""
echo "❌ Permisos insuficientes:"
echo "   - Asegura que el usuario tenga readWrite en la DB"
echo "   - Verifica en Database Access"
echo ""
echo "❌ Límite de almacenamiento alcanzado:"
echo "   - Elimina datos de prueba antiguos"
echo "   - Considera upgrade a tier superior"
echo ""
echo "🔗 Recursos:"
echo "- MongoDB Atlas: https://cloud.mongodb.com"
echo "- Documentación: https://docs.mongodb.com"
echo "- Soporte: https://www.mongodb.com/support"

echo ""
echo -e "${GREEN}✅ Configuración de MongoDB completada${NC}"
echo "Recuerda configurar las variables de entorno en tu aplicación."
