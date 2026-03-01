'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Input,
    Button,
    Card,
    PasswordStrength,
    type PasswordRequirement,
} from '@megamercado-vzla/ui';
import Link from 'next/link';

// Check environment
const isProduction = process.env.NODE_ENV === 'production';

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get token and email from URL for invitations
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');

    const [name, setName] = useState('');
    const [email, setEmail] = useState(emailParam || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [emailParam]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

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

        setLoading(true);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    token, // Pass the invitation token if exists
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error al registrar usuario');
                setLoading(false);
                return;
            }

            // Success handling
            if (data.needsApproval) {
                setSuccessMessage(data.message);
                setLoading(false);
            } else {
                // Success - redirect to login
                router.push('/login?registered=true');
            }
        } catch (err) {
            setError('Error al conectar con el servidor');
            setLoading(false);
        }
    };

    if (successMessage) {
        return (
            <Card>
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        ✅
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Registro Recibido!</h2>
                    <p className="text-gray-600 mb-8">{successMessage}</p>
                    <Link href="/login" className="text-primary font-medium hover:underline">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </Card>
        );
    }

    return (
        <>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {token ? 'Completa tu registro' : 'Crear Cuenta'}
                </h1>
                <p className="text-gray-600">
                    {token ? 'Establece tu contraseña para acceder' : 'Regístrate para comenzar'}
                </p>
            </div>

            <Card>
                {!token && (
                    <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded">
                        <p className="text-sm">
                            <strong>Nota:</strong> El primer usuario registrado obtendrá
                            automáticamente privilegios de administrador.
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-101 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nombre Completo"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Juan Pérez"
                        required
                        fullWidth
                    />

                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        required
                        fullWidth
                        disabled={!!token} // Disable email if invited
                    />

                    <div>
                        <Input
                            label="Contraseña"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            fullWidth
                        />
                        <PasswordStrength password={password} requirements={passwordRequirements} />
                    </div>

                    <Input
                        label="Confirmar Contraseña"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        fullWidth
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        loading={loading}
                        disabled={loading}
                    >
                        {token ? 'Finalizar Registro' : 'Crear Cuenta'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    ¿Ya tienes una cuenta?{' '}
                    <Link
                        href="/login"
                        className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                        Inicia sesión aquí
                    </Link>
                </div>
            </Card>
        </>
    );
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <Suspense fallback={<div className="text-center">Cargando...</div>}>
                    <RegisterForm />
                </Suspense>
            </div>
        </div>
    );
}
