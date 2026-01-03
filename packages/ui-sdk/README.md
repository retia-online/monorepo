# @megamercado/ui

UI components and layouts for MegaMercado applications.

## Installation

```bash
npm install @megamercado/ui
```

## Usage

```tsx
import { Button, Card, Input, PasswordStrength } from '@megamercado/ui';

function App() {
    return (
        <Card title="Login">
            <Input label="Email" type="email" />
            <Button variant="primary">Sign In</Button>
        </Card>
    );
}
```

## Components

### Base Components
- `Button` - Customizable button component with variants and sizes
- `Card` - Container component with optional title
- `Input` - Form input with label, error, and helper text support
- `PasswordStrength` - Password strength indicator

### Auth Components
- `LoginForm` - Complete login form component
- `ProfileCard` - User profile display component
- `Navbar` - Navigation bar with auth state

### Layout Components
- `BaseLayout` - Base application layout
- `AuthLayout` - Layout for authentication pages

## Development

```bash
# Install dependencies
npm install

# Start Storybook
npm run storybook

# Build package
npm run build

# Run tests
npm test
```

## Storybook

View component documentation and examples at [Storybook URL]

## License

MIT