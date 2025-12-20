// import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/route-protection';
import { getEnv } from '@/lib/env';

export default async function HomePage() {
    const env = getEnv();
    
    // Get session (may be null depending on AUTH_MODE)
    const session = await requireAuth('/');
    
    // If auth is disabled, show a simple welcome page
    if (env.AUTH_MODE === 'disabled') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                <div className="max-w-2xl w-full mx-auto p-8">
                    <div className="bg-white shadow-2xl rounded-2xl p-12 text-center">
                        <div className="mb-6">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center text-white text-4xl font-bold">
                                🌟
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold text-gray-800 mb-4">
                            ¡Bienvenido!
                        </h1>

                        <p className="text-xl text-gray-600 mb-8">
                            La aplicación está funcionando correctamente
                        </p>

                        <div className="space-y-4 text-left bg-gray-50 rounded-lg p-6 mb-8">
                            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                <span className="font-semibold text-gray-700">Modo de Autenticación:</span>
                                <span className="text-gray-600 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                    Deshabilitado
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Estado:</span>
                                <span className="text-gray-600">✅ Funcionando</span>
                            </div>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-blue-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">
                                        <strong>Modo sin autenticación:</strong> La autenticación está deshabilitada. 
                                        Para habilitar el login, cambia AUTH_MODE a "required" en tu archivo .env.local
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    // If auth is optional, show different content based on session
    if (env.AUTH_MODE === 'optional') {
        if (session && session.user) {
            // User is logged in - show authenticated view
            const user = session.user;
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                    <div className="max-w-2xl w-full mx-auto p-8">
                        <div className="bg-white shadow-2xl rounded-2xl p-12 text-center">
                            <div className="mb-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center text-white text-4xl font-bold">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            </div>

                            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                                ¡Bienvenido, {user.name}!
                            </h1>

                            <p className="text-xl text-gray-600 mb-2">Has iniciado sesión exitosamente</p>

                            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-8">
                                {user.role === 'ADMIN' ? '👑 Administrador' : '👤 Usuario'}
                            </div>

                            <div className="space-y-4 text-left bg-gray-50 rounded-lg p-6 mb-8">
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                    <span className="font-semibold text-gray-700">Email:</span>
                                    <span className="text-gray-600">{user.email}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                    <span className="font-semibold text-gray-700">Rol:</span>
                                    <span className="text-gray-600">{user.role}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-700">Modo:</span>
                                    <span className="text-gray-600 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        Opcional
                                    </span>
                                </div>
                            </div>

                            <form action="/api/auth/signout" method="POST">
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-8 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    Cerrar Sesión
                                </button>
                            </form>
                        </div>

                        {user.role === 'ADMIN' && (
                            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-5 w-5 text-yellow-400"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            <strong>Panel de Administración:</strong> Como administrador,
                                            puedes agregar más funcionalidades como gestión de usuarios,
                                            configuración del sistema, etc.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        } else {
            // User is not logged in - show guest view with login options
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                    <div className="max-w-2xl w-full mx-auto p-8">
                        <div className="bg-white shadow-2xl rounded-2xl p-12 text-center">
                            <div className="mb-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center text-white text-4xl font-bold">
                                    👋
                                </div>
                            </div>

                            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                                ¡Bienvenido!
                            </h1>

                            <p className="text-xl text-gray-600 mb-8">
                                Puedes usar la aplicación como invitado o iniciar sesión para acceder a más funciones
                            </p>

                            <div className="space-y-4 text-left bg-gray-50 rounded-lg p-6 mb-8">
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                    <span className="font-semibold text-gray-700">Estado:</span>
                                    <span className="text-gray-600">👤 Invitado</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-700">Modo:</span>
                                    <span className="text-gray-600 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        Opcional
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="/login"
                                    className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                >
                                    Iniciar Sesión
                                </a>
                                <a
                                    href="/register"
                                    className="px-8 py-3 bg-secondary text-white font-medium rounded-lg hover:bg-secondary/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                                >
                                    Registrarse
                                </a>
                            </div>

                            <div className="mt-8 bg-green-50 border-l-4 border-green-400 p-4 rounded">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-5 w-5 text-green-400"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-green-700">
                                            <strong>Modo opcional:</strong> Puedes usar la aplicación sin registrarte, 
                                            pero al iniciar sesión tendrás acceso a funciones adicionales y personalización.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
    
    // If we get here, auth is required and user is authenticated
    const user = session!.user;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="max-w-2xl w-full mx-auto p-8">
                <div className="bg-white shadow-2xl rounded-2xl p-12 text-center">
                    <div className="mb-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center text-white text-4xl font-bold">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        ¡Bienvenido, {user.name}!
                    </h1>

                    <p className="text-xl text-gray-600 mb-2">Has iniciado sesión exitosamente</p>

                    <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-8">
                        {user.role === 'ADMIN' ? '👑 Administrador' : '👤 Usuario'}
                    </div>

                    <div className="space-y-4 text-left bg-gray-50 rounded-lg p-6 mb-8">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                            <span className="font-semibold text-gray-700">Email:</span>
                            <span className="text-gray-600">{user.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-700">Rol:</span>
                            <span className="text-gray-600">{user.role}</span>
                        </div>
                    </div>

                    <form action="/api/auth/signout" method="POST">
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-8 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Cerrar Sesión
                        </button>
                    </form>
                </div>

                {user.role === 'ADMIN' && (
                    <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-yellow-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <strong>Panel de Administración:</strong> Como administrador,
                                    puedes agregar más funcionalidades como gestión de usuarios,
                                    configuración del sistema, etc.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
