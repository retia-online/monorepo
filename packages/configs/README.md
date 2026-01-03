# @megamercado/configs

Shared configuration presets for MegaMercado applications.

## Installation

```bash
npm install @megamercado/configs
```

## Usage

### Tailwind CSS Preset

```javascript
// tailwind.config.js
module.exports = {
  presets: [require('@megamercado/configs/tailwind.preset')],
  content: [
    // your content paths
  ],
  // additional customizations
};
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "extends": "@megamercado/configs/tsconfig.base.json",
  "compilerOptions": {
    // your additional options
  }
}
```

For React projects:

```json
// tsconfig.json
{
  "extends": "@megamercado/configs/tsconfig.react.json",
  "compilerOptions": {
    // your additional options
  }
}
```

### ESLint Configuration

```javascript
// eslint.config.js
const megamercadoConfig = require('@megamercado/configs/eslint.config');

module.exports = [
  ...megamercadoConfig,
  // your additional configurations
];
```

## Available Configurations

- `tailwind.preset.js` - Tailwind CSS preset with MegaMercado theme
- `tsconfig.base.json` - Base TypeScript configuration
- `tsconfig.react.json` - React-specific TypeScript configuration
- `eslint.config.js` - ESLint configuration preset