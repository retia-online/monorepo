# Guía de Uso de Variables de Diseño

## 🎨 Configuración del Tema

Ambas aplicaciones (web y mobile) están configuradas para usar variables de entorno para personalizar el diseño.

### Paleta de Colores por Defecto

```
Primary:    #6366f1  (Indigo vibrante)
Secondary:  #ec4899  (Pink/Rosa)
Background: #f8fafc  (Slate muy claro)
Text:       #1e293b  (Slate oscuro)
Font:       Manrope  (Tipografía moderna)
```

---

## 📱 App Web (Next.js)

### Configuración

Las variables de diseño se definen en `.env.development`:

```bash
NEXT_PUBLIC_PRIMARY_COLOR=#6366f1
NEXT_PUBLIC_SECONDARY_COLOR=#ec4899
NEXT_PUBLIC_BACKGROUND_COLOR=#f8fafc
NEXT_PUBLIC_TEXT_COLOR=#1e293b
NEXT_PUBLIC_FONT_FAMILY=Manrope
```

### Cómo Usar

#### 1. En Componentes con Tailwind CSS

Los colores están disponibles como clases de Tailwind:

```tsx
<button className="bg-primary text-white hover:bg-primary/90">
  Click me
</button>

<div className="text-secondary bg-background">
  Contenido
</div>
```

#### 2. En Componentes con Hook

```tsx
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <div style={{ color: theme.colors.primary }}>
      Color primario dinámico
    </div>
  );
}
```

#### 3. En Estilos Inline

```tsx
import { getThemeStyles } from '@/hooks/useTheme';

function MyComponent() {
  const styles = getThemeStyles();
  
  return <div style={styles}>Contenido</div>;
}
```

#### 4. Variables CSS Globales

Las variables están disponibles globalmente:

```css
.my-element {
  color: var(--color-primary);
  background: var(--color-background);
  font-family: var(--font-family);
}
```

---

## 📱 App Mobile (React Native / Expo)

### Configuración

Las variables de diseño se definen en `.env.development`:

```bash
EXPO_PUBLIC_PRIMARY_COLOR=#6366f1
EXPO_PUBLIC_SECONDARY_COLOR=#ec4899
EXPO_PUBLIC_BACKGROUND_COLOR=#f8fafc
EXPO_PUBLIC_TEXT_COLOR=#1e293b
EXPO_PUBLIC_FONT_FAMILY=Manrope
```

### Cómo Usar

#### 1. Usando envConfig directamente

```tsx
import { envConfig } from '@/lib/env';
import { View, Text } from 'react-native';

function MyComponent() {
  return (
    <View style={{ backgroundColor: envConfig.backgroundColor }}>
      <Text style={{ color: envConfig.primaryColor }}>
        Texto con color primario
      </Text>
    </View>
  );
}
```

#### 2. Usando getThemeConfig()

```tsx
import { getThemeConfig } from '@/lib/env';
import { View, Text } from 'react-native';

function MyComponent() {
  const theme = getThemeConfig();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ 
        color: theme.colors.primary,
        fontFamily: theme.font.family 
      }}>
        Texto estilizado
      </Text>
    </View>
  );
}
```

#### 3. En StyleSheet

```tsx
import { StyleSheet } from 'react-native';
import { envConfig } from '@/lib/env';

const styles = StyleSheet.create({
  container: {
    backgroundColor: envConfig.backgroundColor,
    padding: 20,
  },
  title: {
    color: envConfig.primaryColor,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: envConfig.secondaryColor,
    fontSize: 16,
  },
});
```

---

## 🎨 Ejemplos de Paletas Alternativas

### Paleta Azul/Verde (Original)
```bash
NEXT_PUBLIC_PRIMARY_COLOR=#3b82f6
NEXT_PUBLIC_SECONDARY_COLOR=#10b981
NEXT_PUBLIC_BACKGROUND_COLOR=#ffffff
NEXT_PUBLIC_TEXT_COLOR=#1f2937
```

### Paleta Morado/Naranja
```bash
NEXT_PUBLIC_PRIMARY_COLOR=#8b5cf6
NEXT_PUBLIC_SECONDARY_COLOR=#f97316
NEXT_PUBLIC_BACKGROUND_COLOR=#faf5ff
NEXT_PUBLIC_TEXT_COLOR=#1e1b4b
```

### Paleta Oscura
```bash
NEXT_PUBLIC_PRIMARY_COLOR=#60a5fa
NEXT_PUBLIC_SECONDARY_COLOR=#34d399
NEXT_PUBLIC_BACKGROUND_COLOR=#1e293b
NEXT_PUBLIC_TEXT_COLOR=#f1f5f9
```

---

## 🔄 Aplicar Cambios

### App Web
```bash
# 1. Edita .env.development con los nuevos valores
# 2. Reinicia el servidor de desarrollo
cd apps/web
yarn dev
```

### App Mobile
```bash
# 1. Edita .env.development con los nuevos valores
# 2. Reinicia Expo
cd apps/mobile
npx expo start -c
```

---

## 📝 Notas Importantes

1. **Formato de colores**: Usar formato hexadecimal (#RRGGBB)
2. **Fuentes**: Cualquier fuente de Google Fonts funcionará
3. **Consistencia**: Mantén los mismos colores en ambas apps para una experiencia unificada
4. **Reinicio**: Siempre reinicia el servidor/app después de cambiar variables de entorno
5. **Variables públicas**: Todas las variables de diseño son públicas (visibles en el cliente)

---

## 🎯 Buenas Prácticas

1. ✅ Define todos los colores en `.env.development`
2. ✅ Usa las clases de Tailwind (web) o envConfig (mobile) en lugar de hardcodear colores
3. ✅ Mantén la paleta consistente entre web y mobile
4. ✅ Prueba la legibilidad del texto en los colores de fondo elegidos
5. ✅ Documenta los cambios de paleta en tu equipo
