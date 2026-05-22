#!/bin/bash

# Script de configuración para web app en desarrollo local
# Uso: ./setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
WEB_DIR="$PROJECT_ROOT/apps/web"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌐 Configuración de WEB APP para desarrollo LOCAL${NC}"
echo "======================================================"

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

section "Verificación de directorio"
if [ ! -d "$WEB_DIR" ]; then
    echo -e "${RED}❌ No se encontró directorio de web app: $WEB_DIR${NC}"
    exit 1
fi

echo "Directorio web: $WEB_DIR"

# Obtener IP local para desarrollo móvil
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost"
    else
        echo "localhost"
    fi
}

LOCAL_IP=$(get_local_ip)

section "Opciones de configuración"
echo "Selecciona qué configurar:"
echo "1. ✅ Variables de entorno completas"
echo "2. 🔧 Solo variables básicas (recomendado)"
echo "3. 📁 Solo plantillas"
echo "4. 🧪 Configurar para testing"
echo "5. 🚪 Salir"

read -p "Opción [2]: " OPTION
OPTION=${OPTION:-2}

case $OPTION in
    "1"|"2")
        # Variables de entorno
        section "Configurando variables de entorno"
        
        ENV_DEST="$WEB_DIR/.env.local"
        
        # Crear variables básicas
        cat > "$ENV_DEST" << EOF
# ============================================
# WEB APP - LOCAL DEVELOPMENT ENVIRONMENT
# ============================================

INSTANCE=Retia-Local
NEXT_PUBLIC_INSTANCE=Retia-Local

# Database - MongoDB local
MONGODB_URI=mongodb://localhost:27017/retia-local

# NextAuth
NEXTAUTH_URL=http://localhost:9001
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Authentication
AUTH_MODE=required
AUTH_PROVIDERS=email

# Environment
NODE_ENV=development
LOG_LEVEL=debug

# Theme
NEXT_PUBLIC_PRIMARY_COLOR=3b82f6
NEXT_PUBLIC_SECONDARY_COLOR=10b981
NEXT_PUBLIC_BACKGROUND_COLOR=ffffff
NEXT_PUBLIC_TEXT_COLOR=1f2937
NEXT_PUBLIC_FONT_FAMILY=Manrope

# Development
NEXT_PUBLIC_DEV_MODE=true
EOF
        
        echo -e "  ✅ Variables creadas en: $ENV_DEST"
        
        # Si es opción 1 (completa), añadir más configuraciones
        if [ "$OPTION" = "1" ]; then
            section "Configuración adicional"
            
            # Preguntar por Google OAuth
            if confirm "¿Configurar Google OAuth para desarrollo?"; then
                read -p "Google Client ID (dejar vacío para omitir): " GOOGLE_CLIENT_ID
                read -p "Google Client Secret (dejar vacío para omitir): " GOOGLE_CLIENT_SECRET
                
                if [ -n "$GOOGLE_CLIENT_ID" ] && [ -n "$GOOGLE_CLIENT_SECRET" ]; then
                    # Añadir al archivo .env.local
                    cat >> "$ENV_DEST" << EOF

# Google OAuth (desarrollo)
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
EOF
                    echo -e "  ✅ Google OAuth configurado"
                    
                    # Actualizar AUTH_PROVIDERS
                    sed -i.bak 's/AUTH_PROVIDERS=email/AUTH_PROVIDERS=email,google/' "$ENV_DEST"
                    rm -f "$ENV_DEST.bak"
                fi
            fi
            
            # Preguntar por SMTP
            if confirm "¿Configurar SMTP para emails de desarrollo?"; then
                read -p "SMTP User (email): " SMTP_USER
                read -p "SMTP Password (app password): " -s SMTP_PASSWORD
                echo
                
                if [ -n "$SMTP_USER" ] && [ -n "$SMTP_PASSWORD" ]; then
                    cat >> "$ENV_DEST" << EOF

# Email (desarrollo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=$SMTP_USER
SMTP_PASSWORD=$SMTP_PASSWORD
SMTP_FROM=noreply@retia-local.com
EOF
                    echo -e "  ✅ SMTP configurado"
                fi
            fi
        fi
        
        # Mostrar NEXTAUTH_SECRET generada
        NEXTAUTH_SECRET=$(grep "NEXTAUTH_SECRET" "$ENV_DEST" | cut -d '=' -f2)
        echo ""
        echo "🔐 NEXTAUTH_SECRET generada:"
        echo "$NEXTAUTH_SECRET"
        echo ""
        echo "💡 Guarda esta clave en un lugar seguro!"
        ;;
    
    "3")
        # Solo plantillas
        section "Copiando plantillas"
        
        TEMPLATES_DIR="$SCRIPT_DIR/../templates"
        mkdir -p "$TEMPLATES_DIR"
        
        # Crear plantilla .env.web.local
        cat > "$TEMPLATES_DIR/.env.web.local" << 'EOF'
# ============================================
# WEB APP - LOCAL DEVELOPMENT ENVIRONMENT
# ============================================
# Plantilla para desarrollo local

INSTANCE=Retia-Local
NEXT_PUBLIC_INSTANCE=Retia-Local

# ============================================
# Database Configuration
# ============================================
MONGODB_URI=mongodb://localhost:27017/retia-local

# ============================================
# NextAuth Configuration
# ============================================
NEXTAUTH_URL=http://localhost:9001
NEXTAUTH_SECRET=[GENERAR_CON_openssl_rand_-base64_32]

# ============================================
# Authentication
# ============================================
AUTH_MODE=required
AUTH_PROVIDERS=email

# ============================================
# OAuth Configuration (Optional)
# ============================================
# GOOGLE_CLIENT_ID=[GOOGLE_CLIENT_ID_DEV]
# GOOGLE_CLIENT_SECRET=[GOOGLE_CLIENT_SECRET_DEV]

# ============================================
# Email Configuration (Optional)
# ============================================
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=[EMAIL_DEV@gmail.com]
# SMTP_PASSWORD=[APP_PASSWORD]
# SMTP_FROM=noreply@retia-dev.com

# ============================================
# Environment Configuration
# ============================================
NODE_ENV=development
LOG_LEVEL=debug

# ============================================
# Theme Configuration
# ============================================
NEXT_PUBLIC_PRIMARY_COLOR=3b82f6
NEXT_PUBLIC_SECONDARY_COLOR=10b981
NEXT_PUBLIC_BACKGROUND_COLOR=ffffff
NEXT_PUBLIC_TEXT_COLOR=1f2937
NEXT_PUBLIC_FONT_FAMILY=Manrope

# ============================================
# Development Flags
# ============================================
NEXT_PUBLIC_DEV_MODE=true
EOF
        
        echo -e "  ✅ Plantilla creada en: $TEMPLATES_DIR/.env.web.local"
        ;;
    
    "4")
        # Configurar para testing
        section "Configurando para testing"
        
        ENV_DEST="$WEB_DIR/.env.test"
        
        cat > "$ENV_DEST" << EOF
# ============================================
# WEB APP - TESTING ENVIRONMENT
# ============================================

INSTANCE=Retia-Test
NEXT_PUBLIC_INSTANCE=Retia-Test

# Database - MongoDB local para testing
MONGODB_URI=mongodb://localhost:27017/retia-test

# NextAuth
NEXTAUTH_URL=http://localhost:9001
NEXTAUTH_SECRET=test-secret-1234567890abcdef

# Authentication
AUTH_MODE=required
AUTH_PROVIDERS=email

# Environment
NODE_ENV=test
LOG_LEVEL=error

# Testing flags
NEXT_PUBLIC_TEST_MODE=true
NEXT_PUBLIC_E2E_TESTING=true
EOF
        
        echo -e "  ✅ Variables de testing creadas en: $ENV_DEST"
        echo ""
        echo "🧪 Para testing:"
        echo "1. Usa NODE_ENV=test"
        echo "2. Base de datos separada: retia-test"
        echo "3. Log level reducido a error"
        echo "4. Secret fija para testing consistente"
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

section "Configuración para desarrollo móvil"
echo "📱 Para desarrollo móvil que se conecte a esta instancia local:"
echo ""
echo "1. Tu IP local es: $LOCAL_IP"
echo "2. Configura en mobile app (.env.local):"
echo "   EXPO_PUBLIC_API_URL=http://$LOCAL_IP:9001"
echo ""
echo "💡 Si 'localhost' no funciona en móvil, usa la IP mostrada arriba"

section "Verificación de configuración"
echo "Archivos en $WEB_DIR:"
ls -la "$WEB_DIR" | grep -E "\.env|next|package" || true

section "Próximos pasos"
echo -e "${GREEN}✅ Configuración de web app completada${NC}"
echo ""
echo "📋 Para continuar:"
echo "1. 🗄️  Asegura que MongoDB esté corriendo: brew services start mongodb-community"
echo "2. 🚀 Iniciar web app: cd apps/web && yarn dev"
echo "3. 🌐 Acceder a: http://localhost:9001"
echo "4. 👤 Registrar primer usuario (obtendrá rol ADMIN)"
echo ""
echo "🔧 Comandos útiles:"
echo "- Build: yarn build"
echo "- Lint: yarn lint"
echo "- Test: yarn test"
echo "- Type check: yarn type-check"
echo ""
echo "🔗 Recursos:"
echo "- Documentación: $SCRIPT_DIR/../README.md"
echo "- Next.js Docs: https://nextjs.org/docs"
echo "- MongoDB local: mongodb://localhost:27017"
