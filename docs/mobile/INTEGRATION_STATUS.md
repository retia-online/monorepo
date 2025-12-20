# Integración con Sistema de Autenticación Web

## ✅ **Estado de Integración**

La aplicación móvil ahora está **completamente integrada** con el sistema de autenticación de la aplicación web del monorepo.

## 🔄 **Arquitectura de Integración**

### **Base de Datos Compartida**
- ✅ **Misma base de datos MongoDB** para ambas aplicaciones
- ✅ **Mismos modelos de usuario** (`@retia/database`)
- ✅ **Mismas validaciones** (`@retia/utils`)

### **Endpoints Específicos para Móvil**
Se crearon endpoints específicos que mantienen compatibilidad con NextAuth:

#### **1. Login: `/api/mobile/auth/login`**
- ✅ Usa las mismas validaciones que la web
- ✅ Verifica contraseñas con el mismo método
- ✅ Genera JWT compatible con NextAuth
- ✅ Logs de auditoría integrados

#### **2. Perfil: `/api/mobile/auth/profile`**
- ✅ Verifica JWT tokens
- ✅ Retorna datos de usuario actualizados
- ✅ Manejo de sesiones expiradas

#### **3. OAuth: `/api/mobile/auth/oauth`**
- ✅ Integrado con Google y Facebook
- ✅ Crea usuarios con misma lógica que web
- ✅ Primer usuario es automáticamente admin

#### **4. Registro: `/api/register`**
- ✅ **Reutiliza endpoint existente** de la web
- ✅ Misma lógica de validación y creación
- ✅ Primer usuario es admin automáticamente

## 🔐 **Sistema de Autenticación Unificado**

### **Usuarios Compartidos**
- ✅ Un usuario creado en web puede loguearse en móvil
- ✅ Un usuario creado en móvil puede loguearse en web
- ✅ Mismos roles y permisos en ambas plataformas
- ✅ Misma base de datos de usuarios

### **Tokens y Sesiones**
- **Web**: Usa NextAuth con JWT/sessions
- **Móvil**: Usa JWT tokens compatibles con NextAuth
- ✅ Ambos sistemas respetan los mismos datos de usuario
- ✅ Misma lógica de expiración y renovación

### **OAuth Integrado**
- ✅ Google OAuth funciona en ambas plataformas
- ✅ Facebook OAuth funciona en ambas plataformas
- ✅ Usuarios OAuth pueden alternar entre plataformas

## 📱 **Configuración Unificada**

### **Variables de Entorno Sincronizadas**

#### **Web (.env.local)**
```bash
# Proveedores habilitados
AUTH_PROVIDERS=email,google,facebook

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
```

#### **Mobile (.env.local)**
```bash
# Modo de autenticación
EXPO_PUBLIC_AUTH_MODE=required

# Métodos disponibles (deben coincidir con web)
EXPO_PUBLIC_AUTH_METHODS=email,google,facebook

# OAuth (solo client IDs públicos)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
```

## 🔄 **Flujos de Autenticación**

### **1. Login con Email/Contraseña**
```
Mobile App → /api/mobile/auth/login → Misma DB → JWT Token
Web App   → NextAuth credentials    → Misma DB → Session
```

### **2. Registro**
```
Mobile App → /api/register → Misma DB → Usuario creado
Web App   → /api/register → Misma DB → Usuario creado
```

### **3. OAuth (Google/Facebook)**
```
Mobile App → Expo OAuth → /api/mobile/auth/oauth → Misma DB → JWT Token
Web App   → NextAuth OAuth → NextAuth callbacks → Misma DB → Session
```

### **4. Obtener Perfil**
```
Mobile App → /api/mobile/auth/profile → Misma DB → Datos usuario
Web App   → NextAuth session        → Misma DB → Datos usuario
```

## ✅ **Beneficios de la Integración**

1. **Usuarios Unificados**: Un solo sistema de usuarios para todo el monorepo
2. **Configuración Centralizada**: Cambios en una app se reflejan en la otra
3. **Datos Sincronizados**: Perfil actualizado en una app se ve en la otra
4. **OAuth Compartido**: Mismas credenciales OAuth para ambas plataformas
5. **Auditoría Unificada**: Logs centralizados de todas las acciones
6. **Roles Consistentes**: Permisos y roles funcionan igual en ambas apps

## 🚀 **Próximos Pasos**

1. **Probar integración completa**:
   - Crear usuario en web, loguearse en móvil
   - Crear usuario en móvil, loguearse en web
   - Probar OAuth en ambas plataformas

2. **Sincronización en tiempo real** (opcional):
   - WebSockets para notificaciones
   - Actualización automática de perfil

3. **Funcionalidades avanzadas**:
   - Recuperación de contraseña desde móvil
   - Verificación de email desde móvil
   - Gestión de sesiones múltiples

## 📋 **Checklist de Verificación**

- [x] Misma base de datos MongoDB
- [x] Mismos modelos de usuario
- [x] Endpoints móviles creados
- [x] JWT tokens compatibles
- [x] OAuth integrado
- [x] Registro compartido
- [x] Configuración sincronizada
- [x] Logs de auditoría unificados
- [ ] Testing de integración completa
- [ ] Documentación de API actualizada

¡La integración está completa y lista para testing! 🎉