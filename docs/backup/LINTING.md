# Guía de Linting y Formateo

Este repositorio utiliza una configuración centralizada de **ESLint** y **Prettier** para mantener la consistencia del código en todo el monorepo.

## Arquitectura

La configuración base reside en la raíz del monorepo y es extendida por cada paquete individualmente.

### Archivos de Configuración Raíz
- `.eslintrc.js`: Configuración base de ESLint (TypeScript, Prettier integration).
- `.prettierrc.js`: Reglas de formateo de Prettier.
- `.prettierignore`: Archivos ignorados por el formateador.

### Configuración por Paquete
Cada paquete (`apps/web`, `packages/*`) tiene su propio `.eslintrc.js` que extiende la configuración raíz:

```javascript
// packages/paquete/.eslintrc.js
module.exports = {
  extends: ['../../.eslintrc.js'],
  // Reglas específicas del paquete si son necesarias
};
```

## Comandos Disponibles

Desde la raíz del monorepo puedes ejecutar:

### Linting (Análisis estático)
Busca errores de código y estilo.

```bash
# Verificar todo el proyecto
yarn lint

# Intentar arreglar errores automáticamente
yarn lint:fix
```

### Formatting (Estilo de código)
Reescribe el código para seguir las reglas de estilo.

```bash
# Verificar si el código cumple el formato (útil para CI)
yarn format:check

# Formatear todo el código
yarn format
```

## Integración con VS Code

Para la mejor experiencia de desarrollo, asegúrate de tener las extensiones de **ESLint** y **Prettier** instaladas. La configuración está diseñada para funcionar automáticamente.

Si deseas que el editor formatee al guardar, agrega esto a tu `settings.json` de usuario o workspace:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```
