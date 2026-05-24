# 🚀 GUÍA DE RESTAURACIÓN después de limpieza HARD

## 📋 Qué se eliminó:
- TODAS las dependencias (node_modules)
- TODAS las configuraciones (.env files)  
- TODOS los datos locales (MongoDB, SQLite)
- TODOS los builds y caches
- TODOS los lock files
- TODOS los reports de testing

## 🔧 Pasos de restauración:

### 1. Instalar dependencias
```bash
cd /ruta/al/proyecto
yarn install
```

### 2. Configurar entorno local
```bash
# Web app
cp apps/web/.env.example apps/web/.env.local

# Mobile app  
cp apps/mobile/.env.example apps/mobile/.env.local

# Revisar y configurar variables según necesidad
```

### 3. Configurar base de datos
```bash
# macOS con Homebrew
brew services start mongodb-community

# Verificar conexión
mongosh
```

### 4. Configurar cada entorno
```bash
# Desarrollo local (emuladores)
./scripts/environments/local/setup.sh

# Staging (Vercel)
./scripts/environments/staging/setup.sh
```

### 5. Iniciar desarrollo
```bash
# Web app
cd apps/web && yarn dev

# Mobile app (emulador)
cd apps/mobile && expo start
```

## 📞 Recursos:
- Documentación local: `scripts/environments/local/README.md`
- Plantillas: `scripts/environments/local/templates/`
- Utilidades: `scripts/environments/common/`

## ⚠️ Notas importantes:
- Los datos de desarrollo se perdieron permanentemente
- Las configuraciones deben recrearse desde plantillas
- Puede tomar 10-30 minutos restaurar completamente

## 🔗 Enlaces útiles:
- Next.js Docs: https://nextjs.org/docs
- Expo Docs: https://docs.expo.dev
- MongoDB Docs: https://docs.mongodb.com
