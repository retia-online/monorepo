# Database Configuration - Staging

## 📋 Descripción
Configuración de MongoDB Atlas para el entorno de staging.

## 🗄️ MongoDB Atlas para Staging

### Requisitos
1. **Cuenta MongoDB Atlas**: https://cloud.mongodb.com
2. **Proyecto creado** en MongoDB Atlas
3. **Acceso de administrador** al proyecto

### Configuración Recomendada

#### Cluster Configuration:
- **Tier**: M0 Free (512MB, suficiente para staging)
- **Region**: Más cercana a tu ubicación
- **Name**: `retia-staging-cluster`
- **Provider**: AWS, GCP, o Azure

#### Database Access:
- **Username**: `staging-user`
- **Password**: [contraseña segura]
- **Permissions**: `readWrite` en base de datos `retia-staging`

#### Network Access:
- **IP Whitelist**: `0.0.0.0/0` (permite desde cualquier IP)
- **Temporal**: Para staging, esto es aceptable

### Connection String
```
mongodb+srv://staging-user:[password]@retia-staging-cluster.xxxxx.mongodb.net/retia-staging?retryWrites=true&w=majority
```

## 🚀 Configuración Rápida

### Usar script automatizado:
```bash
./setup-mongodb.sh
```

### Pasos manuales:
1. **Crear cluster** en MongoDB Atlas
2. **Configurar usuario** con permisos readWrite
3. **Permitir acceso** desde cualquier IP
4. **Obtener connection string**
5. **Configurar en variables de entorno**

## 🔧 Variables de Entorno

### Web App (`apps/web/.env.staging`):
```env
MONGODB_URI=mongodb+srv://staging-user:[password]@retia-staging-cluster.xxxxx.mongodb.net/retia-staging?retryWrites=true&w=majority
```

### Vercel Environment Variables:
- Añade `MONGODB_URI` con el valor anterior

## 🧪 Pruebas de Conexión

### Con MongoDB Shell:
```bash
# Instalar mongosh
brew install mongosh  # macOS

# Conectar
mongosh "mongodb+srv://staging-user:[password]@retia-staging-cluster.xxxxx.mongodb.net/retia-staging?retryWrites=true&w=majority"

# Verificar
show dbs
use retia-staging
show collections
```

### Con aplicación:
1. Desplegar app con variables configuradas
2. Intentar registro de usuario
3. Verificar que se crea en la base de datos

## 📊 Monitoreo

### MongoDB Atlas Dashboard:
- **Storage**: Límite 512MB en M0 Free
- **Operations**: Monitorea operaciones por segundo
- **Connections**: Conexiones activas
- **Metrics**: CPU, memoria, disco

### Alertas recomendadas:
1. **Storage > 400MB**: Advertencia de límite
2. **Connections > 50**: Posible problema
3. **Operations > 1000/s**: Alto tráfico

## 🔄 Mantenimiento

### Limpieza periódica:
```javascript
// En MongoDB Shell
use retia-staging

// Eliminar usuarios antiguos (ej: > 30 días)
db.users.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
})

// Eliminar sesiones expiradas
db.sessions.deleteMany({
  expires: { $lt: new Date() }
})
```

### Backup (manual en M0 Free):
```bash
# Exportar datos
mongodump --uri="mongodb+srv://staging-user:[password]@retia-staging-cluster.xxxxx.mongodb.net/retia-staging" --out=./backup-staging

# Importar datos
mongorestore --uri="mongodb+srv://staging-user:[password]@retia-staging-cluster.xxxxx.mongodb.net/retia-staging" ./backup-staging
```

## ⚠️ Consideraciones M0 Free

### Límites:
- **512MB** de almacenamiento
- **Compartido** con otros usuarios
- **Sin backups** automáticos
- **Sin alertas** avanzadas

### Recomendaciones:
1. **Monitorea uso** regularmente
2. **Limpia datos** de prueba antiguos
3. **Considera upgrade** a M10 si el proyecto crece
4. **Realiza backups** manuales periódicos

## 🛠️ Solución de Problemas

### No se puede conectar:
1. **Verifica Network Access** (0.0.0.0/0)
2. **Verifica usuario y contraseña**
3. **Verifica que el cluster esté activo**
4. **Prueba desde MongoDB Shell**

### Permisos insuficientes:
1. **Verifica Database Access**
2. **Asegura permisos readWrite**
3. **Verifica base de datos específica**

### Límite de almacenamiento:
1. **Elimina datos antiguos**
2. **Considera upgrade de tier**
3. **Optimiza índices**

### Alto uso de CPU/memoria:
1. **Revisa queries lentas**
2. **Crea índices apropiados**
3. **Optimiza esquema**

## 🔗 Recursos

- **MongoDB Atlas**: https://cloud.mongodb.com
- **Documentación**: https://docs.mongodb.com
- **MongoDB Shell**: https://www.mongodb.com/try/download/shell
- **Soporte**: https://www.mongodb.com/support

## 📞 Soporte

- **Scripts**: `./setup-mongodb.sh`
- **Documentación**: Este archivo
- **Logs**: MongoDB Atlas → Monitoring → Logs
- **Métricas**: MongoDB Atlas → Monitoring → Metrics

---

**Nota**: El entorno de staging usa MongoDB Atlas M0 Free que tiene límites. Considera upgrade si el proyecto crece o necesitas más recursos.
