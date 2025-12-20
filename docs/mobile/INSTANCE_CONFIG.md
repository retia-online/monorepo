# Instance Configuration

## Overview
La aplicación ahora soporta configuración dinámica del nombre de la instancia a través de variables de entorno.

## Variables de Entorno

### Root Monorepo (`.env.local`)
```bash
# Name of the application instance
INSTANCE=monorepo
```

### Mobile App (`apps/mobile/.env.local`)
```bash
# Application instance name (e.g., monorepo, production, staging)
EXPO_PUBLIC_INSTANCE=monorepo
```

## Uso

### En la App Móvil
El nombre de la instancia se usa automáticamente en:
- **LoginScreen**: El título de la pantalla de login muestra el nombre de la instancia
- **Configuración de la app**: Disponible a través de `envConfig.appName`

### Ejemplo de Código
```typescript
import { envConfig } from '@/lib/env';

// Usar el nombre de la instancia
console.log(envConfig.appName); // "monorepo"

// En componentes React Native
<Text>{envConfig.appName}</Text>
```

## Cambios Realizados

1. **`.env.template`** (root): Agregada variable `INSTANCE`
2. **`apps/mobile/.env.template`**: Reemplazada `EXPO_PUBLIC_APP_NAME` por `EXPO_PUBLIC_INSTANCE`
3. **`apps/mobile/src/lib/env.ts`**: Actualizado para usar `EXPO_PUBLIC_INSTANCE`
4. **`apps/mobile/src/screens/LoginScreen.tsx`**: Usa `envConfig.appName` en lugar de texto hardcodeado

## Notas

- El archivo `app.json` aún contiene referencias a "Retia Auth" ya que es una configuración de build de Expo
- Para cambiar el nombre de la app en diferentes entornos, simplemente actualiza la variable `EXPO_PUBLIC_INSTANCE` en tu archivo `.env.local`
- Los valores por defecto son "monorepo" si no se especifica la variable
