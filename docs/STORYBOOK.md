# Storybook - Documentación de Componentes UI

## ¿Qué es Storybook?

Storybook es una herramienta para desarrollar, documentar y testear componentes UI de forma aislada. Permite:

- **Desarrollo aislado**: Trabaja en componentes sin necesidad de la aplicación completa
- **Documentación visual**: Genera documentación automática de componentes
- **Testing visual**: Prueba diferentes estados y variantes
- **Colaboración**: Comparte componentes con diseñadores y stakeholders

## Iniciar Storybook

### Desarrollo

```bash
# Desde la raíz del monorepo
yarn workspace @retia/ui storybook

# O desde packages/ui
cd packages/ui
yarn storybook
```

Esto abrirá Storybook en `http://localhost:6006`

### Build para Producción

```bash
yarn workspace @retia/ui build-storybook
```

Esto genera una versión estática en `packages/ui/storybook-static/` que puede desplegarse.

## Estructura de Stories

Cada componente tiene un archivo `.stories.tsx` asociado:

```
packages/ui/src/
├── Button.tsx
├── Button.stories.tsx      # Stories del Button
├── Input.tsx
├── Input.stories.tsx        # Stories del Input
├── Card.tsx
├── Card.stories.tsx         # Stories del Card
└── PasswordStrength.tsx
    └── PasswordStrength.stories.tsx
```

## Componentes Documentados

### Button

**Ubicación**: `Components/Button`

**Variantes**:
- `primary` - Botón principal (azul)
- `secondary` - Botón secundario (gris)
- `outline` - Botón con borde
- `ghost` - Botón transparente
- `danger` - Botón de peligro (rojo)

**Tamaños**:
- `sm` - Pequeño
- `md` - Mediano (default)
- `lg` - Grande

**Estados**:
- Normal
- Loading (con spinner)
- Disabled
- Full width

**Ejemplo de uso**:
```tsx
<Button variant="primary" size="md" loading={false}>
    Click Me
</Button>
```

### Input

**Ubicación**: `Components/Input`

**Props principales**:
- `label` - Etiqueta del input
- `error` - Mensaje de error
- `helperText` - Texto de ayuda
- `fullWidth` - Ancho completo
- `type` - Tipo de input (text, email, password, etc.)

**Estados**:
- Normal
- Con valor
- Con error
- Con helper text
- Disabled
- Required

**Ejemplo de uso**:
```tsx
<Input
    label="Email"
    type="email"
    placeholder="you@example.com"
    helperText="We'll never share your email"
    error={errors.email}
/>
```

### Card

**Ubicación**: `Components/Card`

**Uso**: Contenedor con padding y sombra para agrupar contenido.

**Ejemplo de uso**:
```tsx
<Card>
    <h2>Card Title</h2>
    <p>Card content goes here</p>
</Card>
```

### PasswordStrength

**Ubicación**: `Components/PasswordStrength`

**Props**:
- `password` - Contraseña actual
- `requirements` - Array de requisitos con estado

**Ejemplo de uso**:
```tsx
<PasswordStrength
    password={password}
    requirements={[
        { text: 'Mínimo 8 caracteres', met: password.length >= 8 },
        { text: 'Al menos una mayúscula', met: /[A-Z]/.test(password) },
        // ...
    ]}
/>
```

## Crear una Nueva Story

### 1. Crear el archivo

```tsx
// src/MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
    title: 'Components/MyComponent',
    component: MyComponent,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        // Define controles para props
        variant: {
            control: 'select',
            options: ['primary', 'secondary'],
        },
    },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// Story básica
export const Default: Story = {
    args: {
        variant: 'primary',
        children: 'My Component',
    },
};
```

### 2. Agregar variantes

```tsx
export const Primary: Story = {
    args: {
        variant: 'primary',
        children: 'Primary',
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Secondary',
    },
};
```

### 3. Stories interactivas

```tsx
import { useState } from 'react';

export const Interactive: Story = {
    render: () => {
        const [value, setValue] = useState('');
        return (
            <MyComponent
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        );
    },
};
```

## Mejores Prácticas

### 1. Nombra Stories Descriptivamente

```tsx
// ✅ Bueno
export const WithErrorMessage: Story = { ... };
export const DisabledState: Story = { ... };
export const LoadingState: Story = { ... };

// ❌ Malo
export const Story1: Story = { ... };
export const Test: Story = { ... };
```

### 2. Documenta Props con ArgTypes

```tsx
argTypes: {
    variant: {
        control: 'select',
        options: ['primary', 'secondary'],
        description: 'Visual style variant',
        table: {
            defaultValue: { summary: 'primary' },
        },
    },
}
```

### 3. Agrupa Stories Relacionadas

```tsx
// Todas las variantes juntas
export const AllVariants: Story = {
    render: () => (
        <div className="space-x-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
        </div>
    ),
};
```

### 4. Usa Layouts Apropiados

```tsx
parameters: {
    layout: 'centered',  // Para componentes pequeños
    // o
    layout: 'padded',    // Para componentes que necesitan espacio
    // o
    layout: 'fullscreen', // Para layouts completos
}
```

## Addons Disponibles

### Controls

Permite modificar props en tiempo real desde la UI de Storybook.

### Actions

Registra eventos (clicks, cambios, etc.) en el panel de acciones.

```tsx
argTypes: {
    onClick: { action: 'clicked' },
    onChange: { action: 'changed' },
}
```

### Docs

Genera documentación automática basada en TypeScript types y JSDoc.

## Desplegar Storybook

### Opción 1: Chromatic (Recomendado)

```bash
# Instalar Chromatic
yarn add -D chromatic

# Publicar
npx chromatic --project-token=<your-token>
```

### Opción 2: Vercel/Netlify

```bash
# Build
yarn build-storybook

# Deploy la carpeta storybook-static/
```

### Opción 3: GitHub Pages

```bash
# Build
yarn build-storybook

# Copiar a docs/ o usar gh-pages
```

## Testing con Storybook

### Test Runner

```bash
# Instalar
yarn add -D @storybook/test-runner

# Ejecutar tests
yarn test-storybook
```

### Visual Regression Testing

Usa Chromatic para detectar cambios visuales automáticamente.

## Troubleshooting

### Error: "Cannot find module '@storybook/react'"

**Solución**: Los tipos se resuelven en runtime. El error de TypeScript es esperado y no afecta la funcionalidad.

### Estilos no se aplican

**Solución**: Verifica que `styles.css` esté importado en `.storybook/preview.ts`

### Componente no aparece

**Solución**: Verifica que el archivo termine en `.stories.tsx` y esté en `src/`

## Recursos

- [Documentación de Storybook](https://storybook.js.org/docs/react/get-started/introduction)
- [Storybook Tutorials](https://storybook.js.org/tutorials/)
- [Addon Catalog](https://storybook.js.org/addons)
- [Best Practices](https://storybook.js.org/docs/react/writing-stories/introduction#best-practices)

## Próximos Pasos

1. **Agregar más componentes**: Crea stories para nuevos componentes
2. **Interaction testing**: Usa `@storybook/addon-interactions` para tests
3. **Accessibility**: Agrega `@storybook/addon-a11y` para checks de accesibilidad
4. **Themes**: Implementa soporte para temas claro/oscuro
5. **Deploy**: Publica Storybook para compartir con el equipo
