# Development Setup - Retia Monorepo

Guía para configurar el entorno de desarrollo con ambas apps (web y mobile) corriendo simultáneamente.

## 🎯 Objetivo

Ejecutar **web y mobile en paralelo** sin conflictos de puertos.

## 📊 Configuración de Puertos

### Recomendado

| App | Tipo | Puerto | URL | Comando |
|-----|------|--------|-----|---------|
| **Web** | Next.js | 3000 | http://localhost:3000 | `yarn dev` |
| **Mobile** | Expo | 19000 | exp://localhost:19000 | `yarn start` |
| **MongoDB** | Database | 27017 | mongodb://localhost:27017 | `brew services start mongodb-community` |

### Alternativa (si puerto 3000 está ocupado)

| App | Puerto | URL |
|-----|--------|-----|
| Web | 3001 | http://localhost:3001 |
| Mobile | 19000 | exp://localhost:19000 |

## 🚀 Setup Paso a Paso

### 1. Terminal 1 - Backend (Web)

```bash
# Navega a la app web
cd apps/web

# Inicia el servidor
yarn dev

# Verás:
# ▲ Next.js 16.0.8
# - Local:        http://localhost:3000
# - Environments: .env.local
```

**Verificar**: Abre http://localhost:3000 en el navegador

### 2. Terminal 2 - Mobile

```bash
# Navega a la app móvil
cd apps/mobile

# Asegúrate de que .env.local apunta al backend
cat .env.local | grep EXPO_PUBLIC_API_URL
# Debe ser: EXPO_PUBLIC_API_URL=http://localhost:3000

# Inicia Expo
yarn start

# Verás:
# Expo Go
# Android: exp://192.168.1.100:19000
# iOS: exp://192.168.1.100:19000
```

### 3. Terminal 3 - MongoDB (Opcional)

```bash
# Si usas MongoDB local
brew services start mongodb-community

# Verificar que está corriendo
brew services list | grep mongodb
```

## 🔧 Configuración de URLs

### Web App (.env.local)

```bash
# Backend URL (para NextAuth)
NEXTAUTH_URL=http://localhost:3000

# Base de datos
MONGODB_URI=mongodb://127.0.0.1:27017/?directConnection=true
```

### Mobile App (.env.local)

```bash
# Backend API URL (debe apuntar a la web)
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## 📱 Abrir Mobile en Simulador

### iOS

```bash
# Desde apps/mobile
yarn ios

# O presiona 'i' en la terminal de Expo
```

### Android

```bash
# Desde apps/mobile
yarn android

# O presiona 'a' en la terminal de Expo
```

### Dispositivo Físico

1. Instala **Expo Go** desde App Store o Google Play
2. En la terminal de Expo, escanea el código QR
3. La app se abrirá en Expo Go

## 🧪 Flujo de Prueba Completo

### 1. Verificar Backend

```bash
# En el navegador
curl http://localhost:3000

# Deberías ver la página de Next.js
```

### 2. Verificar Mobile

```bash
# En la terminal de Expo
# Presiona 'i' para iOS o 'a' para Android
```

### 3. Probar Autenticación

**En la app móvil:**
1. Toca "Regístrate aquí"
2. Ingresa: nombre, email, contraseña
3. Toca "Registrarse"
4. Deberías ver tu perfil

**En el navegador (web):**
1. Ve a http://localhost:3000
2. Toca "Regístrate"
3. Ingresa los mismos datos
4. Deberías ver tu perfil

**Resultado esperado:**
- Ambas apps muestran el mismo usuario
- Ambas apps usan la misma base de datos
- Ambas apps comparten la misma autenticación

## 🔄 Flujos de Desarrollo

### Cambiar Backend

Si cambias el backend (Next.js):

```bash
# Terminal 1 (Web)
cd apps/web
yarn dev

# La app se recargará automáticamente
# Los cambios se verán en http://localhost:3000
```

### Cambiar Mobile

Si cambias la app móvil (Expo):

```bash
# Terminal 2 (Mobile)
cd apps/mobile
yarn start

# Presiona 'r' para recargar
# Los cambios se verán en el simulador/dispositivo
```

## 🐛 Troubleshooting

### "Port 3000 already in use"

**Solución 1: Cambiar puerto de Next.js**

```bash
# En apps/web
yarn dev -p 3001

# Luego actualiza mobile .env.local
EXPO_PUBLIC_API_URL=http://localhost:3001
```

**Solución 2: Matar proceso en puerto 3000**

```bash
# Encontrar proceso
lsof -i :3000

# Matar proceso
kill -9 <PID>
```

### "Cannot connect to API from mobile"

**Verificar:**
1. Backend está corriendo: `curl http://localhost:3000`
2. `.env.local` en mobile tiene URL correcta
3. En dispositivo físico, usa IP local: `http://192.168.1.100:3000`

### "Expo port 19000 in use"

```bash
# Cambiar puerto de Expo
yarn start --port 19001
```

### "MongoDB connection refused"

```bash
# Verificar que MongoDB está corriendo
brew services list | grep mongodb

# Si no está, iniciar
brew services start mongodb-community
```

## 📊 Monitoreo

### Ver logs del backend

```bash
# Terminal 1 (Web)
# Los logs aparecen automáticamente
```

### Ver logs de mobile

```bash
# Terminal 2 (Mobile)
# Los logs aparecen automáticamente
# Presiona 'j' para abrir debugger
```

### Ver logs de MongoDB

```bash
# Terminal 3 (MongoDB)
# Los logs aparecen automáticamente
```

## 🎯 Checklist de Setup

- [ ] Backend corriendo en puerto 3000
- [ ] Mobile configurado para conectar a puerto 3000
- [ ] MongoDB corriendo en puerto 27017
- [ ] Simulador/emulador abierto
- [ ] Código QR de Expo escaneado
- [ ] App móvil visible en simulador
- [ ] Registro completado en ambas apps
- [ ] Mismo usuario visible en web y mobile

## 📚 Documentación Relacionada

- [apps/web/README.md](./apps/web/README.md) - Web app
- [apps/mobile/README.md](./apps/mobile/README.md) - Mobile app
- [apps/mobile/QUICKSTART.md](./apps/mobile/QUICKSTART.md) - Mobile quick start
- [MOBILE_GETTING_STARTED.md](./MOBILE_GETTING_STARTED.md) - Mobile setup

## 🚀 Comandos Rápidos

```bash
# Terminal 1: Backend
cd apps/web && yarn dev

# Terminal 2: Mobile
cd apps/mobile && yarn start

# Terminal 3: MongoDB (opcional)
brew services start mongodb-community

# Abrir mobile en iOS
# Presiona 'i' en terminal 2

# Abrir mobile en Android
# Presiona 'a' en terminal 2
```

## 💡 Tips

1. **Usa múltiples terminales** - Una para cada servicio
2. **Monitorea los logs** - Ayuda a debuggear problemas
3. **Recarga frecuente** - Presiona 'r' en Expo para recargar
4. **Usa React DevTools** - Para debuggear componentes
5. **Revisa Network tab** - Para ver requests/responses

---

**Última actualización**: Diciembre 11, 2024
