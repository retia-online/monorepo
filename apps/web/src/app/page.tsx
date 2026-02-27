// import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/route-protection';
import { getEnv } from '@/lib/env';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';

export default async function HomePage() {
    const env = getEnv();

    // Get session (may be null depending on AUTH_MODE)
    const session = await requireAuth('/');

    // If auth is disabled, show a simple welcome page
    if (env.AUTH_MODE === 'disabled') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
                <Navbar showAuthButtons={false} instanceName={env.INSTANCE} />

                <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                    <div className="max-w-4xl w-full mx-auto text-center">
                        <div className="mb-8">
                            <Image
                                src="/assets/images/branding/logo-rectangular.svg"
                                alt="Logo"
                                width={400}
                                height={160}
                                className="mx-auto"
                            />
                        </div>

                        <h1 className="text-5xl font-bold text-gray-900 mb-6">¡Bienvenido!</h1>

                        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                            Explora nuestra aplicación. Todas las funciones están disponibles sin
                            necesidad de registro.
                        </p>

                        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-green-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-800">
                                        <strong>Acceso libre</strong> - Sin registro requerido
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                    <svg
                                        className="w-6 h-6 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Rápido</h3>
                                <p className="text-gray-600 text-sm">
                                    Acceso inmediato a todas las funcionalidades principales.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                    <svg
                                        className="w-6 h-6 text-secondary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Seguro</h3>
                                <p className="text-gray-600 text-sm">
                                    Tus datos están protegidos con la mejor tecnología.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                    <svg
                                        className="w-6 h-6 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fácil</h3>
                                <p className="text-gray-600 text-sm">
                                    Interfaz intuitiva diseñada para una experiencia perfecta.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // If auth is optional, show different content based on session
    if (env.AUTH_MODE === 'optional') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
                <Navbar showAuthButtons={true} instanceName={env.INSTANCE} />

                <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                    <div className="max-w-4xl w-full mx-auto text-center">
                        <div className="mb-8">
                            <Image
                                src="/assets/images/branding/logo-rectangular.svg"
                                alt="Logo"
                                width={400}
                                height={160}
                                className="mx-auto"
                            />
                        </div>

                        <h1 className="text-5xl font-bold text-gray-900 mb-6">¡Bienvenido!</h1>

                        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                            {session ? (
                                <>
                                    Hola{' '}
                                    <span className="font-semibold text-primary">
                                        {session.user?.name}
                                    </span>
                                    , es genial tenerte de vuelta.
                                </>
                            ) : (
                                <>
                                    Explora nuestra aplicación. Puedes usar todas las funciones como
                                    invitado o registrarte para una experiencia personalizada.
                                </>
                            )}
                        </p>

                        {session && session.user?.role === 'ADMIN' && (
                            <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                                <div className="flex items-center">
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
                                        <p className="text-sm text-yellow-800">
                                            <strong>Panel de Administración disponible</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                    <svg
                                        className="w-6 h-6 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Rápido</h3>
                                <p className="text-gray-600 text-sm">
                                    Acceso inmediato a todas las funcionalidades principales.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                    <svg
                                        className="w-6 h-6 text-secondary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Seguro</h3>
                                <p className="text-gray-600 text-sm">
                                    Tus datos están protegidos con la mejor tecnología.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                    <svg
                                        className="w-6 h-6 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fácil</h3>
                                <p className="text-gray-600 text-sm">
                                    Interfaz intuitiva diseñada para una experiencia perfecta.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // If we get here, auth is required and user is authenticated
    const user = session!.user;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
            <Navbar showAuthButtons={true} instanceName={env.INSTANCE} />

            <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                <div className="max-w-4xl w-full mx-auto text-center">
                    <div className="mb-8">
                        <Image
                            src="/assets/images/branding/logo-rectangular.svg"
                            alt="Logo"
                            width={400}
                            height={160}
                            className="mx-auto"
                        />
                    </div>

                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        ¡Bienvenido, {user.name}!
                    </h1>

                    <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                        Has iniciado sesión exitosamente. Disfruta de todas las funcionalidades de
                        la aplicación.
                    </p>

                    {user.role === 'ADMIN' && (
                        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                            <div className="flex items-center">
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
                                    <p className="text-sm text-yellow-800">
                                        <strong>Panel de Administración disponible</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                <svg
                                    className="w-6 h-6 text-primary"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Rápido</h3>
                            <p className="text-gray-600 text-sm">
                                Acceso inmediato a todas las funcionalidades principales.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                <svg
                                    className="w-6 h-6 text-secondary"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Seguro</h3>
                            <p className="text-gray-600 text-sm">
                                Tus datos están protegidos con la mejor tecnología.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                <svg
                                    className="w-6 h-6 text-primary"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fácil</h3>
                            <p className="text-gray-600 text-sm">
                                Interfaz intuitiva diseñada para una experiencia perfecta.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
