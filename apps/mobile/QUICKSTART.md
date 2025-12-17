# Quick Start - Retia Mobile App

Guía rápida para empezar a desarrollar la app móvil en 5 minutos.

## ⚡ 5 Minutos para Empezar

### 1. Instalar Dependencias (1 min)

```bash
cd apps/mobile
yarn install
```

### 2. Configurar Entorno (1 min)

```bash
# Copiar archivo de configuración
cp .env.example .env.local

# Editar con tu editor favorito
# (Asegúrate de que EXPO_PUBLIC_API_URL apunte a tu backend)
```

**Configuración mínima:**
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 3. Iniciar Servidor (1 min)

```bash
yarn start
```

Verás algo como:
```
Expo Go
  Android: exp://192.168.1.100:19000
  iOS: exp://192.168.1.100:19000
```

### 4. Abrir en Simulador (1 min)

**iOS:**
```bash
# Presiona 'i' en la terminal
# O ejecuta:
yarn ios
```

**Android:**
```bash
# Presiona 'a' en la terminal
# O ejecuta:
yarn android
```

**Dispositivo Físico:**
1. Instala Expo Go desde App Store o Google Play
2. Escanea el código QR que aparece en la terminal

### 5. Probar Autenticación (1 min)

1. **Registro**: Toca "Regístrate aquí" y crea una cuenta
2. **Login**: Usa las credenciales que acabas de crear
3. **Perfil**: Verás tu información de usuario

¡Listo! 🎉

---

## 🔧 Configuración Detallada

### Backend

Asegúrate de que el backend esté corriendo en **otra terminal**:

```bash
# Terminal 1: Backend
cd apps/web
yarn dev

# Backend estará en http://localhost:3000
```

**Importante**: Web y Mobile usan puertos diferentes:
- **Web**: Puerto 3000 (http://localhost:3000)
- **Mobile**: Puerto 19000 (exp://localhost:19000)

Esto permite que ambas corran simultáneamente sin conflictos.

### Variables de Entorno

**Requeridas:**
- `EXPO_PUBLIC_API_URL` - URL del backend

**Opcionales:**
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` - Para OAuth con Google
- `EXPO_PUBLIC_FACEBOOK_APP_ID` - Para OAuth con Facebook

Ver [.env.example](./.env.example) para todas las opciones.

### Dispositivo Físico

Si usas un dispositivo físico en la misma red:

```bash
# Obtén tu IP local
ifconfig | grep "inet " | grep -v 127.0.0.1

# Actualiza .env.local
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

---

## 📱 Comandos Útiles

### Desarrollo

```bash
# Iniciar servidor
yarn start

# iOS
yarn ios

# Android
yarn android

# Web
yarn web

# Linting
yarn lint

# Type checking
yarn type-check
```

### Limpiar

```bash
# Limpiar caché de Expo
yarn start --clear

# Reinstalar dependencias
rm -rf node_modules && yarn install
```

---

## 🧪 Flujos de Prueba

### 1. Registro

1. Abre la app
2. Toca "Regístrate aquí"
3. Ingresa:
   - Nombre: `John Doe`
   - Email: `john@example.com`
   - Contraseña: `password123`
4. Toca "Registrarse"
5. Deberías ver tu perfil

### 2. Login

1. Abre la app
2. Ingresa:
   - Email: `john@example.com`
   - Contraseña: `password123`
3. Toca "Iniciar Sesión"
4. Deberías ver tu perfil

### 3. Logout

1. En la pantalla de perfil
2. Toca "Cerrar Sesión"
3. Deberías volver a la pantalla de login

### 4. Restauración de Sesión

1. Cierra la app completamente
2. Reabre la app
3. Deberías ver tu perfil (sin necesidad de login)

### 5. Token Expirado

1. Espera a que el token expire (24 horas)
2. O simula un token expirado en el backend
3. La app debería redirigirte a login automáticamente

---

## 🐛 Problemas Comunes

### "Cannot connect to API"

**Solución:**
```bash
# Verifica que el backend esté corriendo
curl http://localhost:3000

# Verifica .env.local
cat .env.local | grep EXPO_PUBLIC_API_URL

# En dispositivo físico, usa tu IP local
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

### "Module not found"

**Solución:**
```bash
# Reinstala dependencias
rm -rf node_modules
yarn install

# Limpia caché
yarn start --clear
```

### "Simulador no inicia"

**Solución:**
```bash
# iOS
xcrun simctl erase all

# Android
emulator -avd <name> -wipe-data
```

### "OAuth no funciona"

**Solución:**
1. Verifica que `EXPO_PUBLIC_GOOGLE_CLIENT_ID` esté en `.env.local`
2. Verifica que el backend tenga `/api/auth/oauth/callback`
3. Revisa los logs en la consola

---

## 📚 Documentación

- [README.md](./README.md) - Documentación completa
- [OAUTH_SETUP.md](./OAUTH_SETUP.md) - Configuración de OAuth
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del sistema
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - Endpoints de API

---

## 🚀 Próximos Pasos

### Después de Empezar

1. **Explorar el Código**
   - Abre `src/screens/LoginScreen.tsx`
   - Abre `src/context/AuthContext.tsx`
   - Abre `src/lib/api.ts`

2. **Hacer Cambios**
   - Modifica un componente
   - Guarda el archivo
   - La app se recargará automáticamente

3. **Debuggear**
   - Abre React DevTools
   - Usa `console.log()` para debugging
   - Revisa los logs en la terminal

### Características Avanzadas

- [OAuth Setup](./OAUTH_SETUP.md) - Configurar Google y Facebook
- [Architecture](./ARCHITECTURE.md) - Entender la arquitectura
- [API Endpoints](./API_ENDPOINTS.md) - Documentación de API

---

## 💡 Tips

1. **Hot Reload**: Los cambios se aplican automáticamente
2. **Expo Go**: Usa para testing rápido sin compilar
3. **Dispositivo Real**: Mejor para probar OAuth y performance
4. **Logs**: Revisa la terminal para debugging

---

## ✅ Checklist

- [ ] Backend corriendo en `http://localhost:3000`
- [ ] `.env.local` configurado
- [ ] Dependencias instaladas (`yarn install`)
- [ ] Servidor iniciado (`yarn start`)
- [ ] App abierta en simulador o dispositivo
- [ ] Registro completado
- [ ] Login funcionando
- [ ] Perfil visible

---

## 🎉 ¡Listo!

Ya estás desarrollando la app móvil. 

**Próximos pasos:**
1. Explora el código en `src/`
2. Lee [ARCHITECTURE.md](./ARCHITECTURE.md) para entender el diseño
3. Haz cambios y ve cómo se actualizan en tiempo real

¿Preguntas? Revisa la [documentación completa](./README.md).

---

**Última actualización**: Diciembre 11, 2024
