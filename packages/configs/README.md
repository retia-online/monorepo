# @monorepo-vzla/configs

Shared configuration presets for Monorepo applications.

## Installation

```bash
npm install @monorepo-vzla/configs
```

## Usage

### Tailwind CSS Preset

```javascript
// tailwind.config.js
module.exports = {
  presets: [require('@monorepo-vzla/configs/tailwind.preset')],
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
  "extends": "@monorepo-vzla/configs/tsconfig.base.json",
  "compilerOptions": {
    // your additional options
  }
}
```

For React projects:

```json
// tsconfig.json
{
  "extends": "@monorepo-vzla/configs/tsconfig.react.json",
  "compilerOptions": {
    // your additional options
  }
}
```

### ESLint Configuration

```javascript
// eslint.config.js
const monorepoConfig = require('@monorepo-vzla/configs/eslint.config');

module.exports = [
  ...monorepoConfig,
  // your additional configurations
];
```

## Available Configurations

- `tailwind.preset.js` - Tailwind CSS preset with Monorepo theme
- `tsconfig.base.json` - Base TypeScript configuration
- `tsconfig.react.json` - React-specific TypeScript configuration
- `eslint.config.js` - ESLint configuration preset