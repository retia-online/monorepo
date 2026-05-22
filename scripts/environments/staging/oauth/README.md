# OAuth Configuration - Staging

## 📋 Descripción
Configuración de proveedores OAuth (Google) para el entorno de staging.

## 🔐 Google OAuth para Staging

### Requisitos
1. **Cuenta de Google** (Gmail, G Suite, etc.)
2. **Acceso a Google Cloud Console**: https://console.cloud.google.com
3. **Proyecto creado** en Google Cloud Console
4. **URL de staging** desplegada en Vercel

### URLs de Staging
- **Web App**: `https://[app-name]-[hash].vercel.app`
- **Callback URL**: `https://[app-name]-[hash].vercel.app/api/auth/callback/google`

## 🚀 Configuración Rápida

### Usar script automatizado:
```bash
./setup-google.sh
```

### Pasos manuales:
1. **Crear/Configurar proyecto** en Google Cloud Console
2. **Configurar OAuth consent screen**
3. **Crear credenciales OAuth**
4. **Configurar URLs autorizadas**
5. **Obtener Client ID y Client Secret**
6. **Configurar en variables de entorno**

## 🔧 Configuración en Google Cloud Console

### 1. OAuth Consent Screen:
- **User Type**: External
- **App name**: Retia Staging
- **User support email**: [tu-email@gmail.com]
- **Developer contact email**: [tu-email@gmail.com]
- **Scopes**: email, profile, openid
- **Test users**: Añade emails de prueba

### 2. Credenciales OAuth:
- **Application type**: Web application
- **Name**: Retia Staging
- **Authorized JavaScript origins**: 
  - `https://[app-name]-[hash].vercel.app`
- **Authorized redirect URIs**:
  - `https://[app-name]-[hash].vercel.app/api/auth/callback/google`

### 3. Obtener credenciales:
- **Client ID**: [copiar]
- **Client Secret**: [copiar]

## ⚙️ Variables de Entorno

### Web App (`apps/web/.env.staging`):
```env
GOOGLE_CLIENT_ID=[tu-client-id]
GOOGLE_CLIENT_SECRET=[tu-client-secret]
```

### Vercel Environment Variables:
- Añade `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`

### Mobile App (`apps/mobile/.env.staging`):
```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=[mismo-client-id]
# Solo Client ID, NO Client Secret
```

## 🧪 Pruebas de Integración

### Prueba de login:
1. **Visita URL de staging**
2. **Click en "Login with Google"**
3. **Autoriza la aplicación**
4. **Verifica redirección a la app**
5. **Verifica creación de usuario**

### Verificación en Google Cloud Console:
1. **Ve a "APIs & Services" → "Credentials"**
2. **Click en tu OAuth client ID**
3. **Ve a "OAuth 2.0 Playground" para testing**
4. **Monitorea uso en "Dashboard"**

## 🔄 Flujo OAuth 2.0

```
Usuario → App Staging → Google → Callback → App Staging → MongoDB
   ↓          ↓           ↓         ↓           ↓          ↓
 Click    Redirect   Auth Screen   Return   Create User   Save DB
"Login"     →         Request     Token      Session     Record
```

## 🛠️ Solución de Problemas

### Error: `redirect_uri_mismatch`
**Causa**: La URL de callback no está autorizada
**Solución**:
1. Verifica "Authorized redirect URIs" en Google Cloud Console
2. Debe ser exactamente: `https://[app-name]-[hash].vercel.app/api/auth/callback/google`
3. Sin trailing slash, exact match

### Error: `invalid_client`
**Causa**: Client ID o Client Secret incorrectos
**Solución**:
1. Verifica que las credenciales sean correctas
2. Verifica que sean para el proyecto correcto
3. Verifica que no haya espacios o caracteres especiales

### Error: `origin_mismatch`
**Causa**: Origen JavaScript no autorizado
**Solución**:
1. Verifica "Authorized JavaScript origins"
2. Debe incluir: `https://[app-name]-[hash].vercel.app`
3. Sin trailing slash

### Login funciona pero no crea usuario
**Causa**: Problema con la aplicación, no con OAuth
**Solución**:
1. Verifica conexión a MongoDB
2. Verifica logs de la aplicación
3. Verifica configuración de NextAuth
4. Verifica que el callback esté procesando correctamente

## 🔒 Consideraciones de Seguridad

### Buenas prácticas para staging:
1. **Credenciales separadas**: No usar credenciales de producción
2. **No versionar secrets**: Nunca commits Client Secret al repositorio
3. **Emails de prueba**: Usar emails de prueba, no reales
4. **Acceso limitado**: Limitar a usuarios de prueba específicos
5. **Monitoreo**: Monitorear uso en Google Cloud Console
6. **Rotación**: Rotar credenciales periódicamente

### Scopes mínimos necesarios:
- `email`: Para obtener email del usuario
- `profile`: Para obtener nombre y foto
- `openid`: Para OpenID Connect

## 📊 Monitoreo

### Google Cloud Console:
- **OAuth consent screen**: Usuarios y scopes
- **Credentials**: Uso de Client ID
- **APIs & Services**: Métricas de uso
- **Security**: Alertas de seguridad

### Alertas recomendadas:
1. **Uso anormal**: Picos de uso inesperados
2. **Errores de autorización**: Múltiples errores `invalid_client`
3. **Cambios de configuración**: Modificaciones no autorizadas

## 🔄 Mantenimiento

### Rotación de credenciales:
1. **Crear nuevas credenciales** en Google Cloud Console
2. **Actualizar variables** de entorno
3. **Probar** con la nueva configuración
4. **Eliminar** credenciales antiguas después de confirmación

### Actualización de URLs:
1. **Si cambia la URL de staging**, actualizar:
   - Authorized JavaScript origins
   - Authorized redirect URIs
2. **Propagar cambios** a todas las configuraciones

### Limpieza de usuarios de prueba:
1. **Eliminar usuarios** antiguos de la base de datos
2. **Revocar acceso** en Google Account del usuario
3. **Actualizar lista** de test users en OAuth consent screen

## 🔗 Recursos

- **Google Cloud Console**: https://console.cloud.google.com
- **NextAuth.js Google Provider**: https://next-auth.js.org/providers/google
- **OAuth 2.0 Documentation**: https://developers.google.com/identity/protocols/oauth2
- **OpenID Connect**: https://openid.net/connect/

## 📞 Soporte

- **Scripts**: `./setup-google.sh`
- **Documentación**: Este archivo
- **Logs**: Google Cloud Console → Logs
- **Métricas**: Google Cloud Console → Metrics

---

**Nota**: Staging es para pruebas. Usa credenciales separadas de producción y no uses datos reales de usuarios.
