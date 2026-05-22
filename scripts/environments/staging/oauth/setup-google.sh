#!/bin/bash

# Script de configuración para Google OAuth en staging
# Uso: ./setup-google.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 Configuración de Google OAuth para STAGING${NC}"
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
echo "1. ✅ Cuenta de Google (Gmail, G Suite, etc.)"
echo "2. ✅ Acceso a Google Cloud Console (https://console.cloud.google.com)"
echo "3. ✅ Proyecto creado en Google Cloud Console"
echo "4. ✅ URL de staging desplegada en Vercel"
echo ""

if ! confirm "¿Tienes cuenta de Google Cloud Console configurada?"; then
    echo -e "${YELLOW}⚠️  Crea una cuenta primero en: https://console.cloud.google.com${NC}"
    exit 1
fi

section "URL de staging"
echo "🌐 Necesitamos la URL de tu app de staging en Vercel"
echo "Ejemplo: https://retia-app-staging.vercel.app"
echo ""

read -p "URL de staging (sin trailing slash): " STAGING_URL

if [ -z "$STAGING_URL" ]; then
    echo -e "${YELLOW}⚠️  Usando URL por defecto...${NC}"
    STAGING_URL="https://retia-app-staging.vercel.app"
fi

# Validar formato de URL
if [[ ! "$STAGING_URL" =~ ^https://.*\.vercel\.app$ ]]; then
    echo -e "${YELLOW}⚠️  La URL no parece ser de Vercel, pero continuando...${NC}"
fi

section "Opciones de configuración"
echo "Selecciona qué configurar:"
echo "1. ✅ Crear credenciales OAuth desde cero"
echo "2. 🔧 Configurar credenciales existentes para staging"
echo "3. 📋 Solo generar instrucciones"
echo "4. 🚪 Salir"

read -p "Opción [1]: " OPTION
OPTION=${OPTION:-1}

case $OPTION in
    "1"|"2")
        # Configuración de credenciales
        section "Configuración de Google OAuth"
        
        echo "📝 Información necesaria:"
        echo ""
        
        read -p "Nombre de la aplicación [Retia Staging]: " APP_NAME
        APP_NAME=${APP_NAME:-Retia Staging}
        
        read -p "Email de soporte [tu-email@gmail.com]: " SUPPORT_EMAIL
        SUPPORT_EMAIL=${SUPPORT_EMAIL:-tu-email@gmail.com}
        
        if [ "$OPTION" = "1" ]; then
            # Crear desde cero
            echo ""
            echo "🔧 Pasos para crear credenciales OAuth:"
            echo ""
            echo "1. Ve a https://console.cloud.google.com"
            echo "2. Selecciona o crea un proyecto"
            echo "3. Ve a 'APIs & Services' → 'Credentials'"
            echo "4. Haz click en 'Create Credentials' → 'OAuth client ID'"
            echo "5. Configura:"
            echo "   - Application type: Web application"
            echo "   - Name: $APP_NAME"
            echo "6. En 'Authorized JavaScript origins', añade:"
            echo "   - $STAGING_URL"
            echo "7. En 'Authorized redirect URIs', añade:"
            echo "   - $STAGING_URL/api/auth/callback/google"
            echo "8. Haz click en 'Create'"
            echo "9. Copia el 'Client ID' y 'Client Secret'"
        else
            # Configurar existentes
            echo ""
            echo "🔧 Pasos para configurar credenciales existentes:"
            echo ""
            echo "1. Ve a https://console.cloud.google.com"
            echo "2. Selecciona tu proyecto"
            echo "3. Ve a 'APIs & Services' → 'Credentials'"
            echo "4. Encuentra tu OAuth 2.0 Client ID"
            echo "5. Haz click en el nombre para editarlo"
            echo "6. En 'Authorized JavaScript origins', añade:"
            echo "   - $STAGING_URL"
            echo "7. En 'Authorized redirect URIs', añade:"
            echo "   - $STAGING_URL/api/auth/callback/google"
            echo "8. Guarda los cambios"
        fi
        
        echo ""
        read -p "Client ID: " CLIENT_ID
        read -p "Client Secret: " CLIENT_SECRET
        
        if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
            echo -e "${YELLOW}⚠️  No se ingresaron credenciales, continuando solo con instrucciones...${NC}"
        else
            echo ""
            section "Credenciales obtenidas"
            echo "✅ Client ID: $CLIENT_ID"
            echo "✅ Client Secret: [oculto]"
            
            # Preguntar si guardar en archivo
            if confirm "¿Guardar credenciales en archivo temporal (NO versionar)?"; then
                TEMP_FILE="/tmp/google-oauth-staging.txt"
                cat > "$TEMP_FILE" << EOF
# Google OAuth Credentials for Staging
# DO NOT COMMIT THIS FILE TO VERSION CONTROL

GOOGLE_CLIENT_ID=$CLIENT_ID
GOOGLE_CLIENT_SECRET=$CLIENT_SECRET
STAGING_URL=$STAGING_URL
EOF
                echo -e "  ✅ Guardado en: $TEMP_FILE"
                echo -e "  ⚠️  NO versiones este archivo!"
            fi
        fi
        ;;
    
    "3")
        # Solo instrucciones
        section "Instrucciones para Google OAuth"
        
        echo "🔧 Pasos completos para configurar Google OAuth:"
        echo ""
        echo "1. 🌐 Ve a Google Cloud Console:"
        echo "   https://console.cloud.google.com"
        echo ""
        echo "2. 🏗️  Crea o selecciona proyecto:"
        echo "   - Puedes usar proyecto existente o crear uno nuevo"
        echo "   - Recomendado: 'retia-staging'"
        echo ""
        echo "3. 🔐 Configura OAuth consent screen:"
        echo "   - Ve a 'APIs & Services' → 'OAuth consent screen'"
        echo "   - User Type: External"
        echo "   - App name: Retia Staging"
        echo "   - User support email: [tu-email]"
        echo "   - Developer contact email: [tu-email]"
        echo "   - Scopes: email, profile, openid"
        echo "   - Test users: Añade emails de prueba"
        echo ""
        echo "4. 🎫 Crea credenciales OAuth:"
        echo "   - Ve a 'APIs & Services' → 'Credentials'"
        echo "   - Click 'Create Credentials' → 'OAuth client ID'"
        echo "   - Application type: Web application"
        echo "   - Name: Retia Staging"
        echo ""
        echo "5. 🌍 Configura URLs autorizadas:"
        echo "   - Authorized JavaScript origins:"
        echo "     $STAGING_URL"
        echo "   - Authorized redirect URIs:"
        echo "     $STAGING_URL/api/auth/callback/google"
        echo ""
        echo "6. 📋 Copia credenciales:"
        echo "   - Client ID: [copiar]"
        echo "   - Client Secret: [copiar]"
        echo ""
        echo "7. ⚙️  Configura en tu aplicación:"
        echo "   - Web app (.env.staging):"
        echo "     GOOGLE_CLIENT_ID=[tu-client-id]"
        echo "     GOOGLE_CLIENT_SECRET=[tu-client-secret]"
        echo "   - Vercel Environment Variables:"
        echo "     Añade las mismas variables"
        echo ""
        echo "8. 🧪 Prueba la integración:"
        echo "   - Visita $STAGING_URL"
        echo "   - Intenta login con Google"
        echo "   - Verifica redirección y creación de usuario"
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

section "Configuración en variables de entorno"
echo "📝 Para usar Google OAuth en staging, configura:"
echo ""
echo "1. 🌐 Web App (apps/web/.env.staging):"
echo "   GOOGLE_CLIENT_ID=[tu-client-id]"
echo "   GOOGLE_CLIENT_SECRET=[tu-client-secret]"
echo ""
echo "2. 🚀 Vercel Environment Variables:"
echo "   Añade GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET"
echo ""
echo "3. 📱 Mobile App (si aplica):"
echo "   En apps/mobile/.env.staging:"
echo "   EXPO_PUBLIC_GOOGLE_CLIENT_ID=[mismo-client-id]"
echo "   (solo Client ID, no el secret)"

section "Pruebas de integración"
echo "🔧 Para probar Google OAuth en staging:"
echo ""
echo "1. 🌐 Asegura que la app esté desplegada en:"
echo "   $STAGING_URL"
echo ""
echo "2. 🔐 Verifica credenciales:"
echo "   - Client ID y Secret configurados correctamente"
echo "   - URLs autorizadas coinciden exactamente"
echo ""
echo "3. 🧪 Prueba de login:"
echo "   - Visita $STAGING_URL"
echo "   - Click en 'Login with Google'"
echo "   - Deberías ser redirigido a Google"
echo "   - Después de autorizar, volver a la app"
echo "   - Deberías estar logueado"
echo ""
echo "4. 🔍 Verifica en Google Cloud Console:"
echo "   - Ve a 'APIs & Services' → 'Credentials'"
echo "   - Click en tu OAuth client ID"
echo "   - Ve a 'OAuth 2.0 Playground' para testing"

section "Solución de problemas"
echo "🔧 Problemas comunes y soluciones:"
echo ""
echo "❌ Error: redirect_uri_mismatch"
echo "   - Verifica que la URL en 'Authorized redirect URIs'"
echo "   - Debe ser exactamente: $STAGING_URL/api/auth/callback/google"
echo ""
echo "❌ Error: invalid_client"
echo "   - Verifica Client ID y Client Secret"
echo "   - Asegura que las credenciales sean para el proyecto correcto"
echo ""
echo "❌ Error: origin_mismatch"
echo "   - Verifica 'Authorized JavaScript origins'"
echo "   - Debe incluir: $STAGING_URL"
echo ""
echo "❌ Login funciona pero no crea usuario"
echo "   - Verifica conexión a MongoDB"
echo "   - Verifica logs de la aplicación"
echo "   - Revisa configuración de NextAuth"
echo ""
echo "🔗 Recursos:"
echo "- Google Cloud Console: https://console.cloud.google.com"
echo "- NextAuth.js Google Provider: https://next-auth.js.org/providers/google"
echo "- OAuth 2.0 Documentation: https://developers.google.com/identity/protocols/oauth2"

section "Consideraciones de seguridad"
echo "🔒 Buenas prácticas para OAuth en staging:"
echo ""
echo "1. 🔐 Usa credenciales separadas de producción"
echo "2. 🚫 No versiones Client Secret en repositorio"
echo "3. 📧 Usa emails de prueba, no reales"
echo "4. 🔄 Rota credenciales periódicamente"
echo "5. 👁️  Monitorea uso en Google Cloud Console"
echo "6. 🛡️  Limita acceso a usuarios de prueba específicos"
echo ""
echo "⚠️  Recuerda: Staging es para pruebas, no para datos reales."

echo ""
echo -e "${GREEN}✅ Configuración de Google OAuth completada${NC}"
echo "Configura las variables de entorno y prueba el login."
