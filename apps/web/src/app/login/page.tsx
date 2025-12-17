import LoginForm from './login-form';
import { Suspense } from 'react';
import { redirectIfAuthenticated } from '@/lib/route-protection';

// Helper function to determine enabled providers on the server
const getEnabledProviders = (): string[] => {
    const providers = process.env.AUTH_PROVIDERS || 'email';
    const list = providers.split(',').map((p) => p.trim().toLowerCase());

    const final: string[] = [];
    if (list.includes('email')) final.push('email');

    // Only enable OAuth providers if they are in the list AND have secrets configured
    if (
        list.includes('google') &&
        process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET
    ) {
        final.push('google');
    }

    if (
        list.includes('facebook') &&
        process.env.FACEBOOK_CLIENT_ID &&
        process.env.FACEBOOK_CLIENT_SECRET
    ) {
        final.push('facebook');
    }

    return final;
};

export default async function LoginPage() {
    // Redirect if already authenticated
    await redirectIfAuthenticated();

    const enabledProviders = getEnabledProviders();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Iniciar Sesión</h1>
                    <p className="text-gray-600">Ingresa a tu cuenta</p>
                </div>

                <Suspense fallback={<div className="text-center">Cargando...</div>}>
                    <LoginForm enabledProviders={enabledProviders} />
                </Suspense>
            </div>
        </div>
    );
}
