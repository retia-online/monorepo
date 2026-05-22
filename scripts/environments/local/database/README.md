# Database Configuration - Local Development

## 📋 Descripción
Configuración de MongoDB para desarrollo local.

## 🗄️ MongoDB Local para Desarrollo

### Opciones de instalación:
1. **MongoDB Community Edition** (recomendado)
2. **MongoDB con Docker** (alternativa)
3. **MongoDB Atlas** (remoto, no recomendado para desarrollo local)

### Configuración estándar:
- **Puerto**: 27017
- **Host**: localhost
- **Connection string**: `mongodb://localhost:27017`

## 🚀 Configuración Rápida

### Usar script automatizado:
```bash
./setup-mongodb.sh
```

### Pasos manuales (macOS con Homebrew):
```bash
# 1. Instalar MongoDB
brew tap mongodb/brew
brew install mongodb-community

# 2. Iniciar servicio
brew services start mongodb-community

# 3. Verificar
brew services list | grep mongodb
mongosh --eval "db.version()"
```

## 🔧 Configuración para Desarrollo

### Bases de datos recomendadas:
- **`retia-local`**: Desarrollo principal
- **`retia-test`**: Testing (se limpia frecuentemente)
- **`retia-staging-local`**: Staging local (opcional)

### Variables de entorno:

#### Web App (`apps/web/.env.local`):
```env
MONGODB_URI=mongodb://localhost:27017/retia-local
```

#### Testing (`apps/web/.env.test`):
```env
MONGODB_URI=mongodb://localhost:27017/retia-test
```

## 🛠️ MongoDB Shell (mongosh)

### Conectar:
```bash
# Conectar a MongoDB
mongosh

# Conectar a base de datos específica
mongosh mongodb://localhost:27017/retia-local
```

### Comandos básicos:
```javascript
// Ver bases de datos
show dbs

// Usar base de datos
use retia-local

// Ver colecciones
show collections

// Ver documentos en colección
db.users.find().limit(5)

// Contar documentos
db.users.countDocuments()

// Crear índice
db.users.createIndex({ email: 1 }, { unique: true })

// Eliminar base de datos (cuidado!)
db.dropDatabase()
```

### Comandos para desarrollo:
```javascript
// Crear usuario para aplicación
use retia-local
db.createUser({
  user: "appuser",
  pwd: "password123",
  roles: [{ role: "readWrite", db: "retia-local" }]
})

// Insertar datos de prueba
db.users.insertOne({
  name: "Test User",
  email: "test@example.com",
  role: "ADMIN",
  createdAt: new Date()
})

// Buscar usuarios
db.users.find({ role: "ADMIN" })

// Actualizar documento
db.users.updateOne(
  { email: "test@example.com" },
  { $set: { updatedAt: new Date() } }
)
```

## 🐳 MongoDB con Docker

### Iniciar MongoDB con Docker:
```bash
# Crear volumen para persistencia
docker volume create mongodb_data

# Iniciar contenedor
docker run -d \
  --name mongodb-local \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

### Comandos Docker útiles:
```bash
# Ver logs
docker logs mongodb-local

# Detener contenedor
docker stop mongodb-local

# Iniciar contenedor
docker start mongodb-local

# Eliminar contenedor
docker rm -f mongodb-local

# Acceder a shell
docker exec -it mongodb-local mongosh
```

### Docker con autenticación:
```bash
docker run -d \
  --name mongodb-local-auth \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=secret \
  mongo:latest
```

Connection string: `mongodb://admin:secret@localhost:27017`

## 🖥️ MongoDB Compass (GUI)

### Instalación:
- **Descargar**: https://www.mongodb.com/products/compass
- **Gratuito** y oficial de MongoDB

### Configuración:
1. **Abrir MongoDB Compass**
2. **Connection String**: `mongodb://localhost:27017`
3. **Connect**
4. **Navegar** bases de datos y colecciones

### Características:
- **Interfaz visual** intuitiva
- **Query builder** gráfico
- **Aggregation pipeline** builder
- **Performance analytics**
- **Schema analysis**
- **Index management**

## 🧪 Testing con MongoDB

### Base de datos de testing:
```bash
# Usar base de datos separada para testing
MONGODB_URI=mongodb://localhost:27017/retia-test
```

### Limpiar datos de testing:
```javascript
// En MongoDB Shell
use retia-test
db.dropDatabase()

// O eliminar colecciones específicas
db.users.deleteMany({})
db.sessions.deleteMany({})
```

### Fixtures de testing:
```javascript
// Crear datos de prueba
use retia-test

// Usuarios de prueba
db.users.insertMany([
  {
    name: "Admin User",
    email: "admin@test.com",
    role: "ADMIN",
    createdAt: new Date()
  },
  {
    name: "Regular User",
    email: "user@test.com",
    role: "USER",
    createdAt: new Date()
  }
])
```

## 📊 Monitoreo y Mantenimiento

### Ver estado de MongoDB:
```bash
# Ver logs (macOS)
tail -f /usr/local/var/log/mongodb/mongo.log

# Ver uso de memoria
mongosh --eval "db.serverStatus().mem"

# Ver conexiones activas
mongosh --eval "db.serverStatus().connections"
```

### Backup de datos:
```bash
# Backup de base de datos específica
mongodump --uri="mongodb://localhost:27017/retia-local" --out=./backup

# Backup de todas las bases de datos
mongodump --uri="mongodb://localhost:27017" --out=./backup-all
```

### Restore de datos:
```bash
# Restore de base de datos
mongorestore --uri="mongodb://localhost:27017/retia-local" ./backup/retia-local

# Restore de todas las bases de datos
mongorestore --uri="mongodb://localhost:27017" ./backup-all
```

### Limpieza de datos:
```javascript
// Eliminar documentos antiguos (> 30 días)
use retia-local
db.users.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
})

// Eliminar sesiones expiradas
db.sessions.deleteMany({
  expires: { $lt: new Date() }
})
```

## ⚠️ Consideraciones de Desarrollo

### Datos efímeros:
- **MongoDB local** almacena datos en disco
- **Datos persisten** entre reinicios del servicio
- **Datos NO persisten** si se desinstala MongoDB

### Performance:
- **Adecuado** para desarrollo local
- **Limitado** por recursos de la máquina
- **Considerar** índices para colecciones grandes

### Seguridad:
- **Por defecto** sin autenticación en local
- **Aceptable** para desarrollo
- **NO usar** para datos sensibles reales

## 🛠️ Solución de Problemas

### "mongod: command not found":
```bash
# Verificar instalación
which mongod

# Si usa Homebrew
brew list | grep mongodb

# Reinstalar
brew reinstall mongodb-community
```

### "Connection refused":
```bash
# Verificar que MongoDB esté corriendo
brew services list | grep mongodb

# Iniciar servicio
brew services start mongodb-community

# Verificar puerto
lsof -i :27017
```

### "Permission denied" en /data/db:
```bash
# macOS
sudo mkdir -p /data/db
sudo chown -R `whoami` /data/db

# Linux
sudo mkdir -p /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/lib/mongodb
```

### Puerto 27017 en uso:
```bash
# Ver qué proceso usa el puerto
lsof -i :27017

# Liberar puerto
lsof -ti:27017 | xargs kill -9

# O cambiar puerto de MongoDB
# Editar /usr/local/etc/mongod.conf
# Cambiar port: 27018
```

### "Too many open files":
```bash
# Aumentar límites (macOS)
sudo launchctl limit maxfiles 65536 200000
ulimit -n 65536

# Reiniciar MongoDB
brew services restart mongodb-community
```

## 🔗 Recursos

- **MongoDB Documentation**: https://docs.mongodb.com
- **MongoDB University**: https://university.mongodb.com
- **MongoDB Shell**: https://www.mongodb.com/try/download/shell
- **MongoDB Compass**: https://www.mongodb.com/products/compass
- **MongoDB Drivers**: https://docs.mongodb.com/drivers/

## 📞 Soporte

- **Scripts**: `./setup-mongodb.sh`
- **Documentación**: Este archivo
- **Logs**: `/usr/local/var/log/mongodb/mongo.log` (macOS)
- **Configuración**: `/usr/local/etc/mongod.conf` (macOS)

---

**Nota**: MongoDB local es para desarrollo. Los datos son efímeros y no deben contener información sensible real.
