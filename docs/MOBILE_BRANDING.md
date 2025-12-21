# 🎨 Guía de Branding - App Mobile

## Cambios Realizados

Se ha actualizado la app mobile para que tenga el mismo branding y estilo visual que la app web.

### ✅ Componentes Creados

#### 1. **Logo Component** (`src/components/Logo.tsx`)
- Logo SVG reutilizable con gradiente dinámico
- Soporta dos variantes:
  - `square`: Logo cuadrado (100x100 por defecto)
  - `rectangular`: Logo rectangular (300x120 por defecto)
- Usa colores del tema (`envConfig.primaryColor` y `envConfig.secondaryColor`)

```tsx
import { Logo } from '@/components/Logo';

// Uso
<Logo size={100} variant="square" />
<Logo size={120} variant="rectangular" />
```

#### 2. **Avatar Component** (`src/components/Avatar.tsx`)
- Avatar SVG con gradiente matching al logo
- Tamaño personalizable
- Ideal para perfiles de usuario

```tsx
import { Avatar } from '@/components/Avatar';

// Uso
<Avatar size={100} />
```

### 📱 Pantallas Actualizadas

#### **LoginScreen**
- ✅ Logo agregado en el header
- ✅ Colores dinámicos del tema
- ✅ Background usa `envConfig.backgroundColor`
- ✅ Título usa `envConfig.textColor`
- ✅ Botón principal usa `envConfig.primaryColor`
- ✅ Links usan `envConfig.primaryColor`

#### **RegisterScreen**
- ✅ Logo agregado en el header
- ✅ Mismos colores dinámicos que LoginScreen
- ✅ Consistencia visual total

### 🎨 Paleta de Colores

Los colores se toman dinámicamente del archivo `.env.local`:

```bash
EXPO_PUBLIC_PRIMARY_COLOR=#6366f1    # Indigo vibrante
EXPO_PUBLIC_SECONDARY_COLOR=#ec4899  # Pink
EXPO_PUBLIC_BACKGROUND_COLOR=#f8fafc # Slate claro
EXPO_PUBLIC_TEXT_COLOR=#1e293b       # Slate oscuro
```

### 📦 Dependencias Instaladas

- ✅ **react-native-svg@15.12.1** - Para renderizar logos SVG

### 🗂️ Assets Copiados

Los siguientes archivos fueron copiados de `apps/web/public/assets/images/branding/` a `apps/mobile/assets/images/branding/`:

- `logo-square.svg`
- `logo-rectangular.svg`
- `avatar.svg`
- `favicon-32x32.png`
- `favicon.svg`

> **Nota**: Los SVGs se usan a través de componentes React Native, no directamente como archivos.

### 🎯 Cómo Usar el Branding

#### En Pantallas Nuevas

```tsx
import { Logo, Avatar } from '@/components';
import { envConfig } from '@/lib/env';

function MyScreen() {
    return (
        <View style={{ backgroundColor: envConfig.backgroundColor }}>
            <Logo size={80} variant="square" />
            <Text style={{ color: envConfig.textColor }}>
                Bienvenido a {envConfig.appName}
            </Text>
            <TouchableOpacity 
                style={{ backgroundColor: envConfig.primaryColor }}
            >
                <Text style={{ color: '#fff' }}>Acción Principal</Text>
            </TouchableOpacity>
        </View>
    );
}
```

#### Colores Recomendados

| Elemento | Color Variable | Uso |
|----------|---------------|-----|
| Backgrounds principales | `envConfig.backgroundColor` | Fondos de pantallas |
| Textos principales | `envConfig.textColor` | Títulos, textos importantes |
| Botones primarios | `envConfig.primaryColor` | CTAs, acciones principales |
| Acentos / Links | `envConfig.primaryColor` | Enlaces, highlights |
| Elementos secundarios | `envConfig.secondaryColor` | Badges, iconos especiales |

### 🔄 Consistencia Web ↔ Mobile

| Característica | Web | Mobile |
|----------------|-----|--------|
| Logo | ✅ SVG con gradiente | ✅ SVG con gradiente |
| Colores primarios | ✅ `#6366f1` | ✅ `#6366f1` |
| Colores secundarios | ✅ `#ec4899` | ✅ `#ec4899` |
| Fuente | ✅ Manrope (Google Fonts) | ✅ Manrope (configurable) |
| Background | ✅ `#f8fafc` | ✅ `#f8fafc` |
| Texto | ✅ `#1e293b` | ✅ `#1e293b` |

### 📝 Próximos Pasos

1. **Reinicia la app mobile**:
   ```bash
   cd apps/mobile
   npx expo start -c
   ```

2. **Verifica que se vean los logos** en las pantallas de Login y Registro

3. **Personaliza más pantallas** usando los componentes Logo y Avatar

### 🎨 Personalización Futura

Para cambiar el branding:

1. **Colores**: Edita `.env.local` en la app mobile
2. **Logo**: Edita `src/components/Logo.tsx` para cambiar el diseño del SVG
3. **Tipografía**: Configura `EXPO_PUBLIC_FONT_FAMILY` en `.env.local`

### 🐛 Troubleshooting

#### Error: "Cannot find module 'react-native-svg'"
```bash
cd apps/mobile
npx expo install react-native-svg
```

#### Los colores no se ven
Verifica que tu `.env.local` tenga todas las variables:
```bash
EXPO_PUBLIC_PRIMARY_COLOR=#6366f1
EXPO_PUBLIC_SECONDARY_COLOR=#ec4899
EXPO_PUBLIC_BACKGROUND_COLOR=#f8fafc
EXPO_PUBLIC_TEXT_COLOR=#1e293b
```

#### El logo no aparece
- Asegúrate de reiniciar Expo después de instalar react-native-svg
- Verifica que el import sea correcto: `import { Logo } from '@/components/Logo';`

---

## 🎉 Resultado

La app mobile ahora tiene la misma identidad visual que la app web:
- ✅ Logos con gradiente Indigo → Pink
- ✅ Paleta de colores consistente
- ✅ Experiencia visual unificada
- ✅ Componentes reutilizables
- ✅ Configuración centralizada en `.env`
