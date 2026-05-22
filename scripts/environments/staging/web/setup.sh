#!/bin/bash

# Script de configuración para web app en staging
# Uso: ./setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
WEB_DIR="$PROJECT_ROOT/apps/web"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌐 Configuración de WEB APP para STAGING${NC}"
echo "================================================"

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

section "Opciones de configuración"
echo "Selecciona qué configurar:"
echo "1. ✅ Variables de entorno completas"
echo "2. 🔧 Solo variables básicas"
echo "3. 📁 Solo plantillas"
echo "4. 🚪 Salir"

read -p "Opción [1]: " OPTION
OPTION=${OPTION:-1}

case $OPTION in
    "1"|"2")
        # Variables de entorno
        section "Configurando variables de entorno"
        
        # Plantilla de variables
        ENV_TEMPLATE="$SCRIPT_DIR/../templates/.env.web.staging"
        ENV_DEST="$WEB_DIR/.env.staging"
        
        if [ ! -f "$ENV_TEMPLATE" ]; then
            echo -e "${YELLOW}⚠️  No se encontró plantilla, creando básica...${NC}"
            
            # Crear plantilla básica
            cat > "$ENV_DEST" << 'EOF'
# ============================================
# WEB APP - STAGING ENVIRONMENT VARIABLES
# ============================================

INSTANCE=Retia-Staging
NEXT_PUBLIC_INSTANCE=Retia-Staging

# Database
MONGODB_URI=mongodb+srv://staging-user:[PASSWORD]@staging-cluster.xxxxx.mongodb.net/retia-staging?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=https://retia-app-staging.vercel.app
NEXTAUTH_SECRET=[GENERAR_CON: openssl rand -base64 32]

# Authentication
AUTH_MODE=required
AUTH_PROVIDERS=email,google

# Google OAuth
GOOGLE_CLIENT_ID=[GOOGLE_CLIENT_ID_STAGING]
GOOGLE_CLIENT_SECRET=[GOOGLE_CLIENT_SECRET_STAGING]

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[EMAIL_STAGING@gmail.com]
SMTP_PASSWORD=[APP_PASSWORD]
SMTP_FROM=noreply@retia-staging.com

# Environment
NODE_ENV=production
LOG_LEVEL=debug

# Theme
NEXT_PUBLIC_PRIMARY_COLOR=6366f1
NEXT_PUBLIC_SECONDARY_COLOR=ec4899
NEXT_PUBLIC_BACKGROUND_COLOR=f8fafc
NEXT_PUBLIC_TEXT_COLOR=1e293b
NEXT_PUBLIC_FONT_FAMILY=Manrope
EOF
        else
            # Copiar plantilla existente
            cp "$ENV_TEMPLATE" "$ENV_DEST"
        fi
        
        echo -e "  ✅ Variables creadas en: $ENV_DEST"
        
        # Si es opción 1 (completa), también crear .env.production
        if [ "$OPTION" = "1" ]; then
            PROD_ENV="$WEB_DIR/.env.production"
            if [ ! -f "$PROD_ENV" ]; then
                echo "Creando .env.production..."
                cp "$ENV_DEST" "$PROD_ENV"
                echo -e "  ✅ .env.production creado"
            fi
        fi
        
        # Generar NEXTAUTH_SECRET si se solicita
        if confirm "¿Generar NEXTAUTH_SECRET automáticamente?"; then
            NEXTAUTH_SECRET=$(openssl rand -base64 32)
            echo "NEXTAUTH_SECRET generada:"
            echo "$NEXTAUTH_SECRET"
            echo ""
            echo "Guarda esta clave en un lugar seguro!"
            
            if confirm "¿Actualizar archivo .env.staging con esta clave?"; then
                if [ -f "$ENV_DEST" ]; then
                    # Backup del archivo original
                    cp "$ENV_DEST" "$ENV_DEST.backup"
                    
                    # Actualizar NEXTAUTH_SECRET
                    sed -i.bak "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=$NEXTAUTH_SECRET/" "$ENV_DEST"
                    rm -f "$ENV_DEST.bak"
                    
                    echo -e "  ✅ NEXTAUTH_SECRET actualizada en .env.staging"
                fi
            fi
        fi
        ;;
    
    "3")
        # Solo plantillas
        section "Copiando plantillas"
        
        TEMPLATES_DIR="$SCRIPT_DIR/../templates"
        mkdir -p "$TEMPLATES_DIR"
        
        # Crear plantilla .env.web.staging
        cat > "$TEMPLATES_DIR/.env.web.staging" << 'EOF'
# ============================================
# WEB APP - STAGING ENVIRONMENT VARIABLES
# ============================================
# Plantilla para staging - Reemplazar [VALORES] con datos reales

INSTANCE=Retia-Staging
NEXT_PUBLIC_INSTANCE=Retia-Staging

# ============================================
# Database Configuration
# ============================================
MONGODB_URI=mongodb+srv://[USER]:[PASSWORD]@[CLUSTER].mongodb.net/[DATABASE]?retryWrites=true&w=majority

# ============================================
# NextAuth Configuration
# ============================================
NEXTAUTH_URL=https://[APP-NAME]-[HASH].vercel.app
NEXTAUTH_SECRET=[GENERAR_CON_openssl_rand_-base64_32]

# ============================================
# Authentication
# ============================================
AUTH_MODE=required
AUTH_PROVIDERS=email,google

# ============================================
# OAuth Configuration
# ============================================
GOOGLE_CLIENT_ID=[GOOGLE_CLIENT_ID_STAGING]
GOOGLE_CLIENT_SECRET=[GOOGLE_CLIENT_SECRET_STAGING]

FACEBOOK_CLIENT_ID=[FACEBOOK_APP_ID_STAGING]
FACEBOOK_CLIENT_SECRET=[FACEBOOK_APP_SECRET_STAGING]

# ============================================
# Odoo Configuration
# ============================================
ODOO_URL=https://labs.retia.vzla.online/
ODOO_DB=labs
ODOO_ADMIN_UID=2
ODOO_ADMIN_PASSWORD=3_antropoides

# ============================================
# Email Configuration
# ============================================
RESEND_API_KEY=[RESEND_API_KEY_STAGING]
RESEND_FROM_EMAIL=onboarding@resend.dev

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[EMAIL_STAGING@gmail.com]
SMTP_PASSWORD=[APP_PASSWORD]
SMTP_FROM=noreply@retia-staging.com

# ============================================
# Environment Configuration
# ============================================
NODE_ENV=production
LOG_LEVEL=debug

# ============================================
# Internationalization
# ============================================
NEXT_PUBLIC_DEFAULT_LOCALE=es
NEXT_PUBLIC_LOCALES=es,en
NEXT_PUBLIC_PRIMARY_COLOR=6366f1
NEXT_PUBLIC_SECONDARY_COLOR=ec4899
NEXT_PUBLIC_BACKGROUND_COLOR=f8fafc
NEXT_PUBLIC_TEXT_COLOR=1e293b
NEXT_PUBLIC_FONT_FAMILY=Manrope

# ============================================
# Analytics (Optional)
# ============================================
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
NEXT_PUBLIC_LINKEDIN_INSIGHT_TAG=
NEXT_PUBLIC_X_PIXEL_ID=
NEXT_PUBLIC_PINTEREST_TAG_ID=
NEXT_PUBLIC_GTM_ID=
EOF
        
        echo -e "  ✅ Plantilla creada en: $TEMPLATES_DIR/.env.web.staging"
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

section "Verificación de configuración"
echo "Archivos en $WEB_DIR:"
ls -la "$WEB_DIR" | grep -E "\.env|vercel|next" || true

section "Próximos pasos"
echo -e "${GREEN}✅ Configuración de web app completada${NC}"
echo ""
echo "📋 Para continuar:"
echo "1. 🔧 Editar variables en $WEB_DIR/.env.staging"
echo "2. 🚀 Desplegar: ./scripts/environments/staging/deploy.sh"
echo "3. 🧪 Probar: https://[app-name]-[hash].vercel.app"
echo ""
echo "🔗 Recursos:"
echo "- Documentación: $SCRIPT_DIR/../README.md"
echo "- Script de deploy: $SCRIPT_DIR/../deploy.sh"
echo "- Vercel Dashboard: https://vercel.com/dashboard"