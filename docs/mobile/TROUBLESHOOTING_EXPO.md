# Troubleshooting Expo - Common Issues

Soluciones para problemas comunes con Expo SDK 52.

## ✅ Actualización a Expo SDK 54

### Cambios Realizados
- **Expo SDK**: 51 → 54 (versión más reciente)
- **React Native**: 0.74 → 0.81.5 (última versión estable)
- **React**: 18.3.1 → 19.1.0 (React 19 con nuevas características)
- **Dependencias**: Todas actualizadas a versiones SDK 54
- **Android**: Target SDK 34, permisos mejorados

### Versiones Actualizadas
- `expo-auth-session`: 6.0.2 → 7.0.10
- `expo-constants`: 17.0.3 → 18.0.11
- `expo-secure-store`: 14.0.0 → 15.0.8
- `expo-splash-screen`: 0.29.13 → 31.0.12
- `expo-status-bar`: 2.0.0 → 3.0.9
- `expo-web-browser`: 14.0.1 → 15.0.10
- `react-native-reanimated`: 3.16.1 → 4.1.1
- `react-native-worklets`: Agregado 0.5.2

### Beneficios
- ✅ **Mejor compatibilidad con Android moderno**
- ✅ **React 19** con nuevas características y mejor rendimiento
- ✅ **Reanimated 4** con nueva arquitectura más eficiente
- ✅ **Corrección de bugs** conocidos en versiones anteriores
- ✅ **Mejor rendimiento** y estabilidad general
- ✅ **Soporte completo** para las últimas características

### ✅ Solución del Error de Worklets

**Error**: `Cannot find module 'react-native-worklets/plugin'`

**Causa**: Reanimated 4.x requiere `react-native-worklets` pero no estaba instalado.

**Solución aplicada**:
1. ✅ Agregado `react-native-worklets@0.5.2`
2. ✅ Removido plugin de babel (ya no necesario en Reanimated 4)
3. ✅ Actualizado babel.config.js para SDK 54
- `react-native-reanimated`: 3.16.1 → 4.1.1
- `react-native-screens`: 4.4.0 → 4.16.0

### Beneficios
- ✅ Mejor compatibilidad con Android moderno
- ✅ React 19 con nuevas características y mejor rendimiento
- ✅ Corrección de bugs conocidos en versiones anteriores
- ✅ Mejor rendimiento y estabilidad general
- ✅ Soporte para las últimas características de React Native
- ✅ Mejor soporte para dispositivos Android más nuevos

## Error: "File 'expo/tsconfig' not found"

### Causa
El archivo `tsconfig.json` estaba intentando extender una configuración de Expo que no existe.

### Solución ✅

Ya está resuelta. El `tsconfig.json` ha sido actualizado con una configuración estándar de TypeScript.

### Si el error persiste:

```bash
# 1. Limpiar caché de Expo
yarn start --clear

# 2. Reinstalar dependencias
rm -rf node_modules
yarn install

# 3. Limpiar caché de Metro
rm -rf ~/.expo

# 4. Intentar de nuevo
yarn start
```

## Error: "Metro bundler error"

### Solución

```bash
# Limpiar todo y reiniciar
yarn start --clear

# O más agresivo:
rm -rf node_modules .expo
yarn install
yarn start
```

## Error: "Cannot find module '@megamercado/types'"

### Causa
Las dependencias del monorepo no están instaladas.

### Solución

```bash
# Desde la raíz del monorepo
yarn install

# Luego en mobile
cd apps/mobile
yarn start
```

## Error: "Port 19000 already in use"

### Solución

```bash
# Cambiar puerto
yarn start --port 19001

# O matar el proceso
lsof -i :19000
kill -9 <PID>
```

## Error: "Simulator not responding"

### Solución iOS

```bash
# Reiniciar simulador
xcrun simctl erase all

# O desde Xcode
# Xcode → Device → Erase All Content and Settings
```

### Solución Android

```bash
# Reiniciar emulador
emulator -avd <name> -wipe-data
```

## Error: "Cannot connect to backend"

### Verificar

```bash
# 1. Backend está corriendo
curl http://localhost:3000

# 2. .env.local tiene URL correcta
cat .env.local | grep EXPO_PUBLIC_API_URL

# 3. En dispositivo físico, usar IP local
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

## Error: "Babel configuration error"

### Solución

```bash
# Crear babel.config.js si no existe
cat > babel.config.js << 'EOF'
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
EOF

# Luego reiniciar
yarn start --clear
```

## Error: "TypeScript compilation error"

### Solución

```bash
# Verificar tsconfig.json
cat tsconfig.json

# Limpiar y reinstalar
rm -rf node_modules
yarn install

# Type check
yarn type-check
```

## Checklist de Solución General

Si nada funciona, intenta esto en orden:

1. **Limpiar caché**
   ```bash
   yarn start --clear
   ```

2. **Reinstalar dependencias**
   ```bash
   rm -rf node_modules
   yarn install
   ```

3. **Limpiar Expo**
   ```bash
   rm -rf ~/.expo
   ```

4. **Verificar Node/Yarn**
   ```bash
   node --version  # Debe ser 18+
   yarn --version  # Debe ser 1.22+
   ```

5. **Reiniciar simulador**
   ```bash
   # iOS
   xcrun simctl erase all
   
   # Android
   emulator -avd <name> -wipe-data
   ```

6. **Intentar de nuevo**
   ```bash
   yarn start
   ```

## Logs Útiles

### Ver logs detallados

```bash
# Iniciar con logs verbosos
yarn start --verbose

# O en otra terminal
expo logs
```

### Debuggear en simulador

```bash
# iOS
# Presiona 'i' en la terminal de Expo
# Luego presiona 'j' para abrir debugger

# Android
# Presiona 'a' en la terminal de Expo
# Luego presiona 'j' para abrir debugger
```

## Recursos

- [Expo Documentation](https://docs.expo.dev)
- [Expo Troubleshooting](https://docs.expo.dev/troubleshooting/troubleshooting/)
- [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting)

---

**Última actualización**: Diciembre 11, 2024
