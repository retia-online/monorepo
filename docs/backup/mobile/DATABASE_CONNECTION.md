# Database Connection Architecture

## ❓ ¿Por qué la app móvil no tiene conexión directa a la base de datos?

La app móvil **NO necesita** conexión directa a MongoDB. Aquí está por qué:

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP (Expo)                        │
│                   (React Native)                            │
│                                                              │
│  - No tiene acceso a credenciales de BD                     │
│  - No puede conectarse directamente a MongoDB              │
│  - Solo se conecta a través de HTTP/HTTPS                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP/HTTPS
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND API (Next.js)                      │
│                                                              │
│  - Recibe requests de la app móvil                          │
│  - Valida y procesa los datos                               │
│  - Maneja la lógica de negocio                              │
│  - Conecta a la base de datos                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                    TCP/IP
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB                                  │
│                                                              │
│  - Almacena todos los datos                                 │
│  - Solo accesible desde el backend                          │
│  - Credenciales seguras en el servidor                      │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Razones de Seguridad

### 1. Credenciales de Base de Datos
- Las credenciales de MongoDB **nunca** deben estar en la app móvil
- Si estuvieran en el código, cualquiera podría extraerlas
- El backend mantiene las credenciales seguras en el servidor

### 2. Control de Acceso
- El backend valida cada request
- Implementa autenticación y autorización
- Protege contra acceso no autorizado

### 3. Validación de Datos
- El backend valida todos los datos antes de guardarlos
- Previene inyección de SQL/NoSQL
- Asegura integridad de datos

## 📱 Flujo de Datos

### Ejemplo: Login

```
1. Usuario ingresa email y contraseña en la app
                    ↓
2. App valida localmente con Zod
                    ↓
3. App envía POST /api/auth/signin al backend
   {
     "email": "user@example.com",
     "password": "password123"
   }
                    ↓
4. Backend recibe la request
                    ↓
5. Backend valida con Zod
                    ↓
6. Backend conecta a MongoDB
                    ↓
7. Backend busca usuario en BD
                    ↓
8. Backend verifica contraseña con bcrypt
                    ↓
9. Backend genera JWT token
                    ↓
10. Backend retorna token a la app
    {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "user": { ... }
    }
                    ↓
11. App almacena token en Secure Store
                    ↓
12. App redirige a pantalla de perfil
```

## 🔄 Flujo de Registro

```
1. Usuario ingresa nombre, email, contraseña
                    ↓
2. App valida localmente
                    ↓
3. App envía POST /api/register al backend
                    ↓
4. Backend valida
                    ↓
5. Backend conecta a MongoDB
                    ↓
6. Backend verifica que email no exista
                    ↓
7. Backend hashea contraseña con bcrypt
                    ↓
8. Backend crea usuario en BD
                    ↓
9. Backend retorna usuario y token
                    ↓
10. App almacena token
                    ↓
11. App redirige a perfil
```

## 📡 Endpoints Utilizados

La app móvil solo se conecta a estos endpoints:

```
POST   /api/auth/signin              # Login
POST   /api/register                 # Registro
GET    /api/auth/session             # Obtener perfil
POST   /api/auth/signout             # Logout
POST   /api/auth/oauth/callback      # OAuth callback
```

Todos estos endpoints están en el backend (Next.js).

## 🛡️ Seguridad en Capas

### Capa 1: Mobile App
- Validación local con Zod
- Almacenamiento seguro de tokens
- HTTPS para todas las conexiones

### Capa 2: Backend API
- Validación de entrada
- Autenticación con JWT
- Autorización basada en roles
- Rate limiting
- Logging y auditoría

### Capa 3: Base de Datos
- Credenciales seguras
- Acceso restringido
- Backups regulares
- Encriptación en reposo

## 📊 Comparación: Conexión Directa vs API

### ❌ Conexión Directa (INSEGURO)

```
Mobile App <--TCP--> MongoDB
```

**Problemas:**
- Credenciales en la app (inseguro)
- Sin validación de datos
- Sin autenticación
- Sin autorización
- Sin logging
- Acceso directo a todos los datos

### ✅ A través de API (SEGURO)

```
Mobile App <--HTTP--> Backend API <--TCP--> MongoDB
```

**Ventajas:**
- Credenciales en el servidor
- Validación de datos
- Autenticación y autorización
- Logging y auditoría
- Control de acceso granular
- Escalabilidad

## 🔑 Variables de Entorno

### Mobile App (.env.development)

```bash
# Solo necesita la URL del backend
EXPO_PUBLIC_API_URL=http://localhost:3000

# NO necesita:
# - MONGODB_URI
# - Database credentials
# - API keys secretos
```

### Backend App (.env.development)

```bash
# El backend SÍ necesita credenciales
MONGODB_URI=mongodb://localhost:27017/auth-system
NEXTAUTH_SECRET=secret-key
GOOGLE_CLIENT_SECRET=secret
FACEBOOK_CLIENT_SECRET=secret
SMTP_PASSWORD=password
```

## 🚀 Flujo de Desarrollo

### 1. Desarrollo Local

```bash
# Terminal 1: Backend
cd apps/web
yarn dev
# Backend corriendo en http://localhost:3000

# Terminal 2: Mobile
cd apps/mobile
yarn start
# Mobile conecta a http://localhost:3000
```

### 2. Dispositivo Físico en Misma Red

```bash
# Obtén IP del backend
ifconfig | grep "inet "

# Actualiza .env.development en mobile
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000

# Escanea QR en Expo Go
```

### 3. Producción

```bash
# Backend en Vercel
EXPO_PUBLIC_API_URL=https://tu-app.vercel.app

# Mobile en App Store / Google Play
# Conecta a https://tu-app.vercel.app
```

## 📚 Recursos

- [Backend API Documentation](./API_ENDPOINTS.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [README](./README.md)

## ✅ Resumen

| Aspecto | Mobile App | Backend | MongoDB |
|---------|-----------|---------|---------|
| Conexión a BD | ❌ No | ✅ Sí | - |
| Credenciales | ❌ No | ✅ Sí | - |
| Validación | ✅ Local | ✅ Completa | - |
| Autenticación | ✅ JWT | ✅ JWT | - |
| Autorización | ❌ No | ✅ Sí | - |
| Logging | ❌ No | ✅ Sí | - |

---

**Conclusión**: La app móvil es un cliente que se conecta al backend a través de HTTP/HTTPS. El backend es responsable de toda la lógica de base de datos. Esta arquitectura es segura, escalable y es el estándar en la industria.
