# 🗄️ Scripts de Base de Datos

Scripts de utilidad para gestionar la base de datos MongoDB.

## 🗑️ Limpiar Base de Datos

### Uso Básico

```bash
# Ver estadísticas de la base de datos
yarn clean-db:stats

# Limpiar toda la base de datos (con confirmación)
yarn clean-db

# Limpiar sin confirmación
yarn clean-db:force
```

### Uso Avanzado

```bash
# Limpiar colecciones específicas
yarn clean-db --collections users,sessions

# Ver ayuda completa
yarn clean-db --help

# Ejecutar directamente con ts-node
npx ts-node scripts/database/clean-database.ts --stats
```

## 📊 Comandos Disponibles

### `yarn clean-db:stats`
Muestra estadísticas de la base de datos sin modificar nada:
- Nombre de la base de datos
- Lista de colecciones
- Número de documentos por colección

**Ejemplo de salida:**
```
📊 Estadísticas de la base de datos: monorepo
🔗 URI: mongodb://***:***@127.0.0.1:27017/monorepo

📋 Colecciones (3):
  📄 users: 5 documentos
  📄 sessions: 12 documentos
  📄 accounts: 3 documentos
```

### `yarn clean-db`
Limpia toda la base de datos con confirmación:
- Muestra las colecciones que se van a eliminar
- Requiere confirmación con `--force` o `--confirm`
- Elimina todas las colecciones

### `yarn clean-db:force`
Limpia toda la base de datos sin confirmación:
- ⚠️ **PELIGROSO**: Elimina todo inmediatamente
- Útil para scripts automatizados
- No pide confirmación

## 🔧 Opciones Disponibles

| Opción | Descripción |
|--------|-------------|
| `--stats`, `-s` | Mostrar estadísticas sin limpiar |
| `--force`, `-f` | Limpiar sin confirmación |
| `--confirm`, `-c` | Confirmar limpieza (alternativa a --force) |
| `--collections <lista>` | Limpiar solo colecciones específicas |
| `--help`, `-h` | Mostrar ayuda completa |

## 📋 Ejemplos de Uso

### Ver Estado de la Base de Datos
```bash
yarn clean-db:stats
```
**Salida:**
```
📊 Estadísticas de la base de datos: monorepo
🔗 URI: mongodb://***:***@127.0.0.1:27017/monorepo

📋 Colecciones (3):
  📄 users: 5 documentos
  📄 sessions: 12 documentos
  📄 accounts: 3 documentos
```

### Limpiar Todo (Seguro)
```bash
yarn clean-db
```
**Salida:**
```
📋 Colecciones encontradas (3):
  1. users
  2. sessions
  3. accounts

⚠️  ADVERTENCIA: Esta operación eliminará TODOS los datos
   Para confirmar, ejecuta:
   yarn clean-db --force
```

### Limpiar Todo (Forzado)
```bash
yarn clean-db:force
```
**Salida:**
```
🗑️  Eliminando colecciones...
  ✅ users eliminada
  ✅ sessions eliminada
  ✅ accounts eliminada

✅ Base de datos limpiada exitosamente
```

### Limpiar Colecciones Específicas
```bash
yarn clean-db --collections users,sessions --confirm
```
**Salida:**
```
🗑️  Eliminando colecciones...
  ✅ users eliminada
  ✅ sessions eliminada

✅ Base de datos limpiada exitosamente
```

## ⚠️ Advertencias Importantes

### 🚨 Pérdida de Datos
- **TODOS los datos** de las colecciones especificadas serán **eliminados permanentemente**
- **NO hay forma de recuperar** los datos una vez eliminados
- Asegúrate de tener **backups** si los datos son importantes

### 🔒 Seguridad
- El script usa las credenciales de `.env.development`
- Verifica que estés conectado a la base de datos correcta
- En producción, usa este script con **extrema precaución**

### 🏗️ Desarrollo
- Útil para **resetear el estado** durante desarrollo
- Perfecto para **limpiar datos de prueba**
- Ideal antes de **ejecutar migraciones** o **seeders**

## 🔧 Configuración

El script lee la configuración de `.env.development`:

```bash
# Requerido
MONGODB_URI=mongodb://127.0.0.1:27017/monorepo

# Opcional (para MongoDB Atlas)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/monorepo
```

## 🐛 Troubleshooting

### Error: "MONGODB_URI no está definido"
```bash
# Verificar que existe .env.development
ls -la .env.development

# Verificar contenido
grep MONGODB_URI .env.development
```

### Error: "No se pudo conectar"
```bash
# Verificar que MongoDB está corriendo
brew services list | grep mongodb

# Iniciar MongoDB si no está corriendo
brew services start mongodb-community

# Probar conexión manual
mongosh mongodb://127.0.0.1:27017/monorepo
```

### Error: "Colección no existe"
Es normal si la colección ya fue eliminada o nunca existió. El script continúa con las demás colecciones.

## 📚 Uso Programático

También puedes importar las funciones en otros scripts:

```typescript
import { cleanDatabase, showDatabaseStats } from './scripts/database/clean-database';

// Mostrar estadísticas
await showDatabaseStats();

// Limpiar con opciones
await cleanDatabase({ 
  force: true,
  collections: ['users', 'sessions']
});
```

---

## 🆘 Soporte

- 📖 **Documentación**: [../../README.md](../../README.md)
- 🐛 **Issues**: Abre un issue en el repositorio
- 💬 **Ayuda**: `yarn clean-db --help`