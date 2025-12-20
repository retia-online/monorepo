# Assets Compartidos

Esta carpeta contiene todos los recursos visuales compartidos entre las aplicaciones web y móvil del monorepo.

## Estructura de Carpetas

```
assets/
├── images/
│   └── branding/
│       ├── logo-square.svg      # Logo cuadrado (200x200px)
│       ├── logo-rectangular.svg # Logo rectangular (300x120px)
│       ├── avatar.svg          # Avatar por defecto (100x100px)
│       └── favicon.svg         # Favicon (32x32px)
└── README.md
```

## Assets de Branding

### Logo Cuadrado (`logo-square.svg`)
- **Dimensiones**: 200x200px
- **Uso**: Avatares, iconos de perfil, favicon
- **Aplicaciones**: Web y móvil
- **Ubicaciones**: Pantallas de bienvenida, headers compactos

### Logo Rectangular (`logo-rectangular.svg`)
- **Dimensiones**: 300x120px  
- **Uso**: Headers, pantallas de login, splash screens
- **Aplicaciones**: Web y móvil
- **Ubicaciones**: Pantallas principales, headers extendidos

### Avatar (`avatar.svg`)
- **Dimensiones**: 100x100px
- **Uso**: Avatar por defecto para usuarios sin foto
- **Aplicaciones**: Web y móvil
- **Ubicaciones**: Perfiles de usuario, comentarios

### Favicon (`favicon.svg`)
- **Dimensiones**: 32x32px
- **Uso**: Icono del navegador, pestañas
- **Aplicaciones**: Solo web
- **Ubicaciones**: Pestaña del navegador, bookmarks

## Personalización

Para personalizar los assets según el cliente:

1. **Reemplaza los archivos SVG** manteniendo las mismas dimensiones
2. **Actualiza los colores** en las variables de entorno:
   - `NEXT_PUBLIC_PRIMARY_COLOR`
   - `NEXT_PUBLIC_SECONDARY_COLOR`
3. **Los cambios se aplicarán automáticamente** en ambas aplicaciones

## Formatos Soportados

- **SVG**: Recomendado para logos (escalable, pequeño tamaño)
- **PNG**: Para imágenes con transparencia
- **JPG**: Para fotografías o imágenes complejas

## Acceso desde las Aplicaciones

### Web (Next.js)
```tsx
import Image from 'next/image';
// Los assets se copian automáticamente a public/
<Image src="/assets/images/branding/logo-rectangular.svg" alt="Logo" width={300} height={120} />
<Image src="/assets/images/branding/avatar.svg" alt="Avatar" width={100} height={100} />
```

### Móvil (React Native/Expo)
```tsx
import { Image } from 'react-native';
// Los assets se referencian directamente
<Image source={require('../../../assets/images/branding/logo-square.svg')} />
```