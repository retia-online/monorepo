# Guía de Protección de Rutas (Actualizada)

## Enfoque de Protección

Debido a limitaciones del Edge Runtime en Next.js 15+ con MongoDB, utilizamos **protección a nivel de página** en lugar de middleware global.

## Helpers de Protección

El archivo `apps/web/src/lib/route-protection.ts` proporciona funciones helper para proteger rutas:

### `requireAuth(callbackUrl?)`

Protege una página requiriendo autenticación. Redirige a login si el usuario no está autenticado.

```typescript
import { requireAuth } from '@/lib/route-protection';

export default async function ProtectedPage() {
    // Esto redirigirá a /login si no está autenticado
    const session = await requireAuth('/dashboard');
    
    return <div>Contenido protegido</div>;
}
```

### `redirectIfAuthenticated()`

Redirige usuarios autenticados lejos de páginas de autenticación (login/register).

```typescript
import { redirectIfAuthenticated } from '@/lib/route-protection';

export default async function LoginPage() {
    // Redirige a / si ya está autenticado
    await redirectIfAuthenticated();
    
    return <LoginForm />;
}
```

### `requireAdmin()`

Requiere que el usuario sea administrador. Redirige a home si no lo es.

```typescript
import { requireAdmin } from '@/lib/route-protection';

export default async function AdminPage() {
    const session = await requireAdmin();
    
    return <div>Panel de administración</div>;
}
```

### `checkFirstUser()`

Verifica si existen usuarios en la base de datos. Redirige a register si no hay usuarios.

```typescript
import { checkFirstUser } from '@/lib/route-protection';

export default async function SomePage() {
    await checkFirstUser();
    
    // ... resto del código
}
```

## Ejemplos de Uso

### Página Protegida Simple

```typescript
// app/dashboard/page.tsx
import { requireAuth } from '@/lib/route-protection';

export default async function DashboardPage() {
    const session = await requireAuth('/dashboard');
    const user = session.user;
    
    return (
        <div>
            <h1>Dashboard de {user.name}</h1>
        </div>
    );
}
```

### Página Solo para Administradores

```typescript
// app/admin/page.tsx
import { requireAdmin } from '@/lib/route-protection';

export default async function AdminPage() {
    const session = await requireAdmin();
    
    return (
        <div>
            <h1>Panel de Administración</h1>
            <p>Bienvenido, {session.user.name}</p>
        </div>
    );
}
```

### Página de Login (Redirige si ya está autenticado)

```typescript
// app/login/page.tsx
import { redirectIfAuthenticated } from '@/lib/route-protection';
import LoginForm from './login-form';

export default async function LoginPage() {
    await redirectIfAuthenticated();
    
    return <LoginForm />;
}
```

## Rutas Públicas

Las siguientes rutas NO requieren protección:

- `/login` - Página de inicio de sesión
- `/register` - Página de registro
- `/forgot-password` - Recuperación de contraseña
- `/reset-password` - Restablecer contraseña
- `/api/register` - API de registro
- `/api/forgot-password` - API de recuperación
- `/api/reset-password` - API de restablecimiento
- `/api/auth/*` - Endpoints de NextAuth

## Flujo de Autenticación

### Usuario No Autenticado Intenta Acceder a Ruta Protegida

1. Usuario navega a `/dashboard`
2. `requireAuth('/dashboard')` detecta que no hay sesión
3. Usuario es redirigido a `/login?callbackUrl=/dashboard`
4. Usuario inicia sesión
5. `LoginForm` lee el `callbackUrl` y redirige a `/dashboard`

### Usuario Autenticado Intenta Acceder a Login

1. Usuario autenticado navega a `/login`
2. `redirectIfAuthenticated()` detecta la sesión
3. Usuario es redirigido a `/`

## Agregar Protección a Nueva Página

### Paso 1: Importar el Helper

```typescript
import { requireAuth } from '@/lib/route-protection';
```

### Paso 2: Llamar al Helper

```typescript
export default async function MyNewPage() {
    const session = await requireAuth('/my-new-page');
    
    // Tu código aquí
}
```

¡Eso es todo! La página ahora está protegida.

## Protección por Rol Personalizada

Si necesitas lógica de protección personalizada:

```typescript
import { requireAuth } from '@/lib/route-protection';
import { redirect } from 'next/navigation';

export default async function CustomProtectedPage() {
    const session = await requireAuth('/custom');
    
    // Lógica personalizada
    if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN') {
        redirect('/');
    }
    
    return <div>Contenido para managers y admins</div>;
}
```

## Ventajas de Este Enfoque

1. **Compatible con Edge Runtime**: No depende de middleware que requiere Node.js APIs
2. **Explícito**: Cada página declara claramente sus requisitos de autenticación
3. **Flexible**: Fácil agregar lógica personalizada de autorización
4. **Type-Safe**: TypeScript garantiza que uses los helpers correctamente
5. **Server Components**: Aprovecha las ventajas de React Server Components

## Desventajas

1. **No Automático**: Debes recordar agregar protección a nuevas páginas
2. **Sin Protección de API Routes**: Las API routes deben implementar su propia protección

## Protección de API Routes

Para proteger API routes, usa `auth()` directamente:

```typescript
// app/api/protected-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const session = await auth();
    
    if (!session || !session.user) {
        return NextResponse.json(
            { error: 'No autenticado' },
            { status: 401 }
        );
    }
    
    // Tu lógica aquí
    return NextResponse.json({ data: 'Datos protegidos' });
}
```

## Mejores Prácticas

1. **Siempre usa helpers**: No reimplementes la lógica de autenticación
2. **Pasa callbackUrl**: Ayuda a mejorar la UX después del login
3. **Documenta requisitos**: Si una página tiene requisitos especiales, documéntalos
4. **Prueba flujos**: Verifica que las redirecciones funcionen correctamente
5. **Maneja errores**: Considera qué hacer si la autenticación falla

## Troubleshooting

### Problema: Loop de redirección

**Causa**: Una página protegida está redirigiendo a otra página protegida.

**Solución**: Asegúrate de que las páginas de autenticación (`/login`, `/register`) no usen `requireAuth`.

### Problema: Usuario no redirigido después del login

**Causa**: El `callbackUrl` no se está pasando correctamente.

**Solución**: Verifica que `login-form.tsx` esté leyendo `callbackUrl` de los search params.

### Problema: Error "global is not defined"

**Causa**: Estás intentando usar código de base de datos en middleware o Edge Runtime.

**Solución**: Usa los helpers de protección solo en Server Components, no en middleware.
