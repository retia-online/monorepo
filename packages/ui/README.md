# @retia/ui

Biblioteca de componentes UI reutilizables para el proyecto Retia.

## Componentes Disponibles

### Button
Botón con múltiples variantes, tamaños y estados.

```tsx
import { Button } from '@retia/ui';

<Button variant="primary" size="md" loading={false}>
    Click Me
</Button>
```

### Input
Campo de entrada con label, error y helper text.

```tsx
import { Input } from '@retia/ui';

<Input
    label="Email"
    type="email"
    error={errors.email}
    helperText="We'll never share your email"
/>
```

### Card
Contenedor con padding y sombra.

```tsx
import { Card } from '@retia/ui';

<Card>
    <h2>Title</h2>
    <p>Content</p>
</Card>
```

### PasswordStrength
Indicador visual de fuerza de contraseña.

```tsx
import { PasswordStrength } from '@retia/ui';

<PasswordStrength
    password={password}
    requirements={requirements}
/>
```

## Desarrollo

### Ver Componentes en Storybook

```bash
yarn storybook
```

Abre `http://localhost:6006` para ver todos los componentes documentados.

### Agregar un Nuevo Componente

1. Crea el componente en `src/MyComponent.tsx`
2. Exporta desde `src/index.tsx`
3. Crea stories en `src/MyComponent.stories.tsx`
4. Documenta en Storybook

## Documentación

Ver [STORYBOOK.md](../../docs/STORYBOOK.md) para documentación completa.
