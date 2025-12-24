# 🔐 Modos de Autenticación

Este documento describe los diferentes modos de autenticación disponibles en la plataforma y cómo configurarlos.

## ⚙️ Configuración

El modo de autenticación se configura mediante la variable de entorno `AUTH_MODE` (en la web) y `EXPO_PUBLIC_AUTH_MODE` (en mobile).

| Variable | App | Ubicación |
|----------|-----|-----------|
| `AUTH_MODE` | Web | `apps/web/.env.local` |
| `EXPO_PUBLIC_AUTH_MODE` | Mobile | `apps/mobile/.env.local` |

> **Importante:** Ambos valores deben estar sincronizados para una experiencia consistente.

---

## 🚀 Modos Disponibles

### 1. `required` (Por defecto)
El modo estándar. Los usuarios deben iniciar sesión para acceder a la aplicación.
- **Registro**: Habilitado.
- **Acceso**: Solo usuarios autenticados.
- **Uso**: Aplicaciones privadas o con dashboard.

### 2. `optional`
Permite navegar por la aplicación sin estar autenticado, pero ofrece funciones adicionales al iniciar sesión.
- **Registro**: Habilitado.
- **Acceso**: Público, con login disponible en el perfil/navbar.
- **Uso**: E-commerce, blogs, plataformas de contenido.

### 3. `whitelist` ✨
Ideal para comunidades cerradas o betas privadas. Cualquiera puede registrarse, pero un administrador debe aprobar la cuenta.
- **Registro**: Habilitado, pero crea usuarios en estado "Pendiente".
- **Login**: Solo funciona para usuarios "Aprobados".
- **Admin**: Los administradores aprueban usuarios en `/admin/users`.
- **Notificación**: El usuario recibe un email automático cuando su cuenta es aprobada.

### 4. `invite-only` 🚀
Máxima restricción. El registro público está deshabilitado. Solo los usuarios invitados por un administrador pueden unirse.
- **Registro Público**: Deshabilitado (el link se oculta en el login).
- **Invitaciones**: El administrador crea al usuario desde `/admin/users` proporcionando nombre y email.
- **Flujo**:
  1. Admin envía invitación.
  2. Usuario recibe email con link especial.
  3. Usuario completa su perfil y establece su contraseña.
  4. Los usuarios invitados se aprueban automáticamente.

### 5. `disabled`
Desactiva completamente el sistema de autenticación.
- **Uso**: Aplicaciones 100% públicas.

---

## 🛠️ Panel de Administración (`/admin/users`)

Disponible solo para usuarios con el rol `ADMIN`. Permite:

1. **Listar Usuarios**: Ver todos los usuarios, sus roles y estados.
2. **Aprobación (Whitelist)**: Switch para activar/desactivar el acceso de cualquier usuario.
3. **Invitaciones**: Formulario para invitar nuevos miembros en modo `invite-only`.

---

## 📧 Plantillas de Email

El sistema incluye correos electrónicos automáticos con diseño premium para:
- **Bienvenida**: Al registrarse con éxito.
- **Aprobación**: Cuando un admin aprueba la cuenta en modo whitelist.
- **Invitación**: Con el link de registro para modo invite-only.

---

## 📝 Ejemplo de Configuración (.env)

```bash
# Para una Beta Privada con aprobación
AUTH_MODE=whitelist
AUTH_PROVIDERS=email,google

# Para una herramienta interna corporativa
AUTH_MODE=invite-only
AUTH_PROVIDERS=email
```
