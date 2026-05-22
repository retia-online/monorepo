# Mobile App Configuration - Staging

## 📋 Descripción
Configuración de la aplicación móvil para el entorno de staging.

## 📱 Staging en Mobile

### Opciones de despliegue:
1. **APK para Android** (testing en dispositivo físico)
2. **Expo Go** (desarrollo con conexión a staging)
3. **EAS Build** (builds gestionados por Expo)

### Características:
- **React Native** con Expo
- **Autenticación** con backend de staging
- **Google OAuth** para login social
- **Diseño responsive** para móviles
- **Offline support** básico

## 🚀 Configuración Rápida

### Usar script automatizado:
```bash
./setup.sh
```

### Opciones disponibles:
1. **Variables de entorno** para staging
2. **Configuración EAS** (Expo Application Services)
3. **Generar APK** para testing
4. **Configurar para desarrollo** con Expo Go

## 🔧 Variables de Entorno

### Archivo: `apps/mobile/.env.staging`
```env
# ============================================
# MOBILE APP - STAGING ENVIRONMENT VARIABLES
# ============================================

INSTANCE=Retia-Staging

# Backend API
EXPO_PUBLIC_API_URL=https://retia-app-staging.vercel.app

# Authentication
EXPO_PUBLIC_AUTH_MODE=required
EXPO_PUBLIC_AUTH_METHODS=email,google

# OAuth Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID=[GOOGLE_CLIENT_ID_STAGING]
EXPO_PUBLIC_FACEBOOK_APP_ID=[FACEBOOK_APP_ID_STAGING]
EXPO_PUBLIC_ODOO_URL=https://labs.retia.vzla.online/

# App Configuration
EXPO_PUBLIC_INSTANCE=Retia-Staging
EXPO_PUBLIC_MAIN_SCREEN_MESSAGE=¡Bienvenido a Retia Staging!

# Design Configuration
EXPO_PUBLIC_PRIMARY_COLOR=6366f1
EXPO_PUBLIC_SECONDARY_COLOR=ec4899
EXPO_PUBLIC_BACKGROUND_COLOR=f8fafc
EXPO_PUBLIC_TEXT_COLOR=1e293b
EXPO_PUBLIC_FONT_FAMILY=Manrope

# Internationalization
EXPO_PUBLIC_DEFAULT_LOCALE=es
EXPO_PUBLIC_LOCALES=es,en,pt
```

### Variable CRÍTICA:
- **`EXPO_PUBLIC_API_URL`**: Debe apuntar al backend de staging en Vercel

## 🏗️ Build y Deploy

### 1. APK para Android (testing):
```bash
./build-apk.sh
```

### 2. Desarrollo con Expo Go:
```bash
cd apps/mobile
expo start
```

### 3. EAS Build (managed):
```bash
cd apps/mobile
eas build --platform android --profile preview
```

## 🔐 Autenticación Móvil

### Proveedores soportados:
1. **Email**: Con backend de staging
2. **Google**: OAuth 2.0 (requiere Client ID)

### Flujo de autenticación:
```
App Móvil → Backend Staging → Proveedor OAuth → Callback → App Móvil
   ↓           ↓               ↓               ↓           ↓
 Login      API Call      Auth Screen      Token      Session
Request    Redirect      (Google)        Response    Storage
```

### Consideraciones móviles:
- **Deep linking** para callbacks OAuth
- **Secure storage** para tokens
- **Session management** en dispositivo
- **Offline handling** para conexiones intermitentes

## 📦 Generación de APK

### Requisitos:
1. **Backend de staging** desplegado
2. **Variables de entorno** configuradas
3. **Cuenta Expo** configurada
4. **EAS CLI** instalado

### Proceso:
1. **Configurar variables** en `.env.staging`
2. **Ejecutar script** `./build-apk.sh`
3. **Descargar APK** desde Expo Dashboard
4. **Instalar en dispositivo** Android

### Instalación en Android:
1. **Descargar APK** desde Expo
2. **Permitir "Fuentes desconocidas"** en Android
3. **Instalar APK**
4. **Abrir app** y probar conexión a staging

## 🎯 Desarrollo con Expo Go

### Para testing rápido:
1. **Configurar `.env.local`** con variables de staging
2. **Ejecutar** `expo start`
3. **Escanear QR** con Expo Go app
4. **Probar** conectado a backend de staging

### Ventajas:
- **Rápido desarrollo**
- **Hot reload**
- **Testing en dispositivo real**
- **Sin necesidad de build**

### Limitaciones:
- **Requiere conexión** a internet
- **Algunas features nativas** limitadas
- **Performance** puede diferir de build final

## ⚙️ Configuración EAS

### Archivo: `apps/mobile/eas.json`
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "https://retia-app-staging.vercel.app",
        "EXPO_PUBLIC_AUTH_MODE": "required",
        "EXPO_PUBLIC_AUTH_METHODS": "email,google",
        "EXPO_PUBLIC_INSTANCE": "Retia-Staging"
      }
    }
  }
}
```

### Perfiles de build:
- **development**: Para desarrollo con Expo Go
- **preview**: Para staging/testing (APK)
- **production**: Para producción (Play Store)

## 🧪 Pruebas

### Pruebas básicas:
1. **Conexión al backend** (API health check)
2. **Login con email**
3. **Login con Google OAuth**
4. **Navegación autenticada**
5. **Funcionalidades principales**

### Pruebas en dispositivo:
1. **Diferentes tamaños** de pantalla
2. **Orientaciones** portrait/landscape
3. **Conectividad** (WiFi, 4G, offline)
4. **Performance** en dispositivo real

### Pruebas específicas móvil:
1. **Deep linking** para OAuth callbacks
2. **Push notifications** (si configurado)
3. **Camera/Gallery** access (si necesario)
4. **Location services** (si necesario)

## 📊 Monitoreo

### Expo Dashboard:
- **Build logs**
- **Distribution analytics**
- **Error reporting**
- **Performance metrics**

### Métricas importantes:
1. **App launch time**: < 3 segundos
2. **API response time**: < 2 segundos
3. **Crash rate**: < 1%
4. **User engagement**: Sesiones por usuario

## 🔄 Flujo de Trabajo

### Desarrollo → Staging:
```bash
# 1. Configurar variables de staging
./scripts/environments/staging/mobile/setup.sh

# 2. Probar con Expo Go
cd apps/mobile
expo start

# 3. Si funciona, generar APK
./scripts/environments/staging/mobile/build-apk.sh

# 4. Distribuir APK a testers
# 5. Recibir feedback
```

### Hotfix en staging:
```bash
# 1. Aplicar fix en código
# 2. Generar nueva APK
./scripts/environments/staging/mobile/build-apk.sh

# 3. Distribuir a testers
# 4. Verificar fix
```

## 🛠️ Solución de Problemas

### APK no se instala:
1. **Verificar "Fuentes desconocidas"** en Android
2. **Verificar espacio** en dispositivo
3. **Descargar APK** nuevamente
4. **Probar en otro dispositivo**

### App no conecta al backend:
1. **Verificar EXPO_PUBLIC_API_URL**
2. **Verificar conexión a internet**
3. **Probar backend** desde navegador
4. **Revisar logs** de la app

### OAuth no funciona en móvil:
1. **Verificar Client ID** configurado
2. **Verificar deep linking** configurado
3. **Probar en dispositivo** con Chrome instalado
4. **Revisar logs** de OAuth flow

### Build falla en EAS:
1. **Verificar variables de entorno**
2. **Verificar eas.json** configuration
3. **Revisar build logs** en Expo Dashboard
4. **Probar build local** primero

### Performance issues:
1. **Optimizar imágenes**
2. **Reducir bundle size**
3. **Implementar lazy loading**
4. **Usar Hermes engine**

## 🔗 Recursos

- **Expo Documentation**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **React Native**: https://reactnative.dev
- **Expo Go**: https://expo.dev/client

## 📞 Soporte

- **Scripts**: `./setup.sh`, `./build-apk.sh`
- **Documentación**: Este archivo
- **Expo Dashboard**: https://expo.dev
- **Build Logs**: Expo Dashboard → Builds

---

**Nota**: La app móvil de staging se conecta al backend de staging. Usa para pruebas de integración móvil.
