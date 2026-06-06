'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Input,
    Button,
    Card,
    PasswordStrength,
    type PasswordRequirement,
} from '@core/ui';
import Link from 'next/link';

// Check environment
const isProduction = process.env.NODE_ENV === 'production';

import { Suspense } from 'react';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Calculate password requirements
    const passwordRequirements: PasswordRequirement[] = useMemo(() => {
        if (isProduction) {
            return [
                { text: 'Mínimo 8 caracteres', met: password.length >= 8 },
                { text: 'Al menos una letra mayúscula', met: /[A-Z]/.test(password) },
                { text: 'Al menos una letra minúscula', met: /[a-z]/.test(password) },
                { text: 'Al menos un número', met: /[0-9]/.test(password) },
                { text: 'Al menos un carácter especial', met: /[^A-Za-z0-9]/.test(password) },
            ];
        } else {
            return [{ text: 'Mínimo 6 caracteres', met: password.length >= 6 }];
        }
    }, [password]);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            setError('Token no encontrado en la URL');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        // Validate password requirements
        const allRequirementsMet = passwordRequirements.every((req) => req.met);
        if (!allRequirementsMet) {
            setError('La contraseña no cumple con todos los requisitos');
            return;
        }

        if (!token) {
            setError('Token no válido');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error al restablecer la contraseña');
                setLoading(false);
                return;
            }

            // Success
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setError('Error al conectar con el servidor');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <Card>
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg
                                    className="h-6 w-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                ¡Contraseña Actualizada!
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Tu contraseña ha sido restablecida exitosamente.
                            </p>
                            <p className="text-sm text-gray-500">
                                Serás redirigido al login en unos segundos...
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Restablecer Contraseña
                    </h1>
                    <p className="text-gray-600">Ingresa tu nueva contraseña</p>
                </div>

                <Card>
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Input
                                label="Nueva Contraseña"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                fullWidth
                                disabled={!token || loading}
                            />
                            <PasswordStrength
                                password={password}
                                requirements={passwordRequirements}
                            />
                        </div>

                        <Input
                            label="Confirmar Contraseña"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            fullWidth
                            disabled={!token || loading}
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loading}
                            disabled={!token || loading}
                        >
                            Restablecer Contraseña
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <Link
                            href="/login"
                            className="font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            Volver al login
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">Cargando...</div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}
