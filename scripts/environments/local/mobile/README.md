# Mobile App Configuration - Local Development

## 📋 Descripción
Configuración de la aplicación móvil para desarrollo local.

## 📱 Desarrollo Local Móvil

### Opciones de desarrollo:
1. **Expo Go** en dispositivo físico (recomendado)
2. **Android Emulator** (Android Studio)
3. **iOS Simulator** (Xcode)

### Características:
- **React Native** con Expo
- **Hot reload** para desarrollo rápido
- **Conexión a backend local**
- **TypeScript** para type safety

## 🚀 Configuración Rápida

### Usar script automatizado:
```bash
./setup.sh
```

### Pasos manuales:
1. **Configurar variables** en `apps/mobile/.env.local`
2. **Instalar Expo Go** en dispositivo móvil
3. **Ejecutar** `expo start`
4. **Escanear QR code** con Expo Go

## 🔧 Variables de Entorno

### Archivo: `apps/mobile/.env.local`
```env
# ============================================
# MOBILE APP - LOCAL DEVELOPMENT
# ============================================

INSTANCE=Retia-Local

# Backend API - IMPORTANTE: Usar IP local, no localhost
EXPO_PUBLIC_API_URL=http://[TU_IP_LOCAL]:9001

# Authentication
EXPO_PUBLIC_AUTH_MODE=required
EXPO_PUBLIC_AUTH_METHODS=email

# App Configuration
EXPO_PUBLIC_INSTANCE=Retia-Local
EXPO_PUBLIC_MAIN_SCREEN_MESSAGE=¡Bienvenido a Retia Local!

# Design Configuration
EXPO_PUBLIC_PRIMARY_COLOR=3b82f6
EXPO_PUBLIC_SECONDARY_COLOR=10b981
EXPO_PUBLIC_BACKGROUND_COLOR=ffffff
EXPO_PUBLIC_TEXT_COLOR=1f2937
EXPO_PUBLIC_FONT_FAMILY=Manrope

# Internationalization
EXPO_PUBLIC_DEFAULT_LOCALE=es
EXPO_PUBLIC_LOCALES=es,en,pt

# Development
EXPO_PUBLIC_DEV_MODE=true
```

### Obtener tu IP local:
```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'

# Windows
ipconfig | findstr "IPv4"
```

## 🏗️ Desarrollo

### Iniciar servidor de desarrollo:
```bash
cd apps/mobile
expo start
```

### Opciones de Expo:
```bash
# Iniciar con limpieza de cache
expo start --clear

# Iniciar en LAN (para dispositivos en misma red)
expo start --lan

# Iniciar en tunnel (para dispositivos en redes diferentes)
expo start --tunnel

# Ver logs
expo logs
```

### Comandos de desarrollo:
```bash
# Type checking
yarn type-check

# Linting
yarn lint

# Testing
yarn test

# Build para Android
expo build:android

# Build para iOS
expo build:ios
```

## 🔐 Autenticación Móvil Local

### Proveedores configurados:
1. **Email**: Registro tradicional (conectado a backend local)

### Consideraciones para desarrollo:
- **Backend local** debe estar corriendo en `http://[IP]:9001`
- **Misma red WiFi** para dispositivo y computadora
- **Firewall** debe permitir conexiones

### Para emuladores:
- **Android Emulator**: `http://10.0.2.2:9001`
- **iOS Simulator**: `http://localhost:9001`

## 📱 Testing en Dispositivo Físico

### Requisitos:
1. **Dispositivo Android/iOS** con Expo Go instalado
2. **Misma red WiFi** que la computadora
3. **Backend local** corriendo
4. **IP correcta** en `EXPO_PUBLIC_API_URL`

### Pasos:
1. **Obtener IP local** de la computadora
2. **Configurar** `EXPO_PUBLIC_API_URL=http://[IP]:9001`
3. **Ejecutar** `expo start`
4. **Escanear QR code** con Expo Go
5. **Probar** conexión y funcionalidades

### Troubleshooting:
- **"Cannot connect to API"**: Verificar IP y firewall
- **"Network request failed"**: Verificar que backend esté corriendo
- **"Expo Go not loading"**: Reiniciar Expo y dispositivo

## 🤖 Desarrollo con Emulador

### Android Emulator:
1. **Instalar Android Studio**
2. **Crear AVD** (Android Virtual Device)
3. **Configurar** `EXPO_PUBLIC_API_URL=http://10.0.2.2:9001`
4. **Ejecutar** `expo start`
5. **Presionar 'a'** para abrir en Android Emulator

### iOS Simulator:
1. **Instalar Xcode**
2. **Abrir iOS Simulator**
3. **Configurar** `EXPO_PUBLIC_API_URL=http://localhost:9001`
4. **Ejecutar** `expo start`
5. **Presionar 'i'** para abrir en iOS Simulator

## 🎨 UI y Diseño

### Componentes principales:
- **Navigation**: React Navigation
- **State management**: React Context
- **Styling**: StyleSheet y componentes personalizados
- **Icons**: Expo Vector Icons

### Desarrollo de UI:
- **Hot reload** para cambios en tiempo real
- **Fast refresh** para preservar estado
- **Debug menu** (shake device)

### Herramientas de desarrollo:
- **React Developer Tools** (extensión Chrome)
- **React Native Debugger** (app standalone)
- **Flipper** (debugging avanzado)

## 🧪 Testing Local

### Pruebas durante desarrollo:
1. **Conexión al backend** (API health check)
2. **Login/registro** de usuarios
3. **Navegación** entre pantallas
4. **Renderizado** de componentes
5. **Manejo de estado**

### Testing tools:
```bash
# Unit tests
yarn test

# E2E tests (Detox)
yarn test:e2e

# Snapshot testing
yarn test --updateSnapshot
```

### Debugging:
```bash
# Con React Native Debugger
expo start --dev-client

# Con logs detallados
EXPO_DEBUG=true expo start

# Con profiling
expo start --profile
```

## 📊 Monitoreo y Debugging

### Logs de desarrollo:
```bash
# Ver logs de Expo
expo logs

# Ver logs específicos
EXPO_DEBUG=true expo start

# Ver logs de Metro bundler
expo start --verbose
```

### Herramientas de debugging:
- **React Native Debugger**: Debugging completo
- **Flipper**: Plugins para Redux, network, etc.
- **Chrome DevTools**: Debugging JavaScript
- **Android Studio Logcat**: Logs nativos Android
- **Xcode Console**: Logs nativos iOS

### Performance monitoring:
- **React DevTools Profiler**
- **Flipper Performance Plugin**
- **Android Profiler** (Android Studio)
- **Instruments** (Xcode)

## 🔄 Flujo de Trabajo

### Desarrollo normal:
```bash
# 1. Configurar variables
./setup.sh

# 2. Iniciar backend local (web app)
cd apps/web && yarn dev

# 3. Iniciar mobile app
cd apps/mobile && expo start

# 4. Escanear QR con Expo Go
# 5. Desarrollar con hot reload
```

### Testing específico:
```bash
# Testing con emulador
EXPO_PUBLIC_API_URL=http://10.0.2.2:9001 expo start

# Testing en LAN
expo start --lan

# Testing con tunnel
expo start --tunnel
```

### Build para testing:
```bash
# Development build
expo build:android --type apk --profile development

# Preview build
expo build:android --type apk --profile preview
```

## 🛠️ Solución de Problemas

### "Cannot connect to [IP]:9001":
```bash
# Verificar IP correcta
ipconfig getifaddr en0

# Verificar que backend esté corriendo
curl http://localhost:9001/api/health

# Verificar firewall
sudo pfctl -s rules
```

### "Expo Go not loading":
```bash
# Limpiar cache
expo start --clear

# Reiniciar Metro
rm -rf .expo
expo start

# Reiniciar dispositivo
```

### "Metro bundler error":
```bash
# Limpiar cache de Metro
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*

# Reinstalar dependencias
rm -rf node_modules
yarn install
```

### "TypeScript errors":
```bash
# Limpiar cache TypeScript
rm -rf .expo
rm -rf node_modules/.cache

# Reinstalar dependencias
yarn install --force
```

### "Build fails":
```bash
# Limpiar build cache
expo prebuild --clean

# Verificar dependencias nativas
expo doctor
```

## 🔗 Recursos

- **Expo Documentation**: https://docs.expo.dev
- **React Native**: https://reactnative.dev
- **React Navigation**: https://reactnavigation.org
- **Expo Vector Icons**: https://docs.expo.dev/guides/icons/

## 📞 Soporte

- **Scripts**: `./setup.sh`
- **Documentación**: Este archivo
- **Expo CLI**: `expo --help`
- **Logs**: `expo logs`

---

**Nota**: Desarrollo móvil local requiere que el backend esté corriendo y accesible desde la red local.
