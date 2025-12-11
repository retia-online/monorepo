'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Card } from '@retia/ui';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
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
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error al registrar usuario');
                setLoading(false);
                return;
            }

            // Success - redirect to login
            router.push('/login?registered=true');
        } catch (err) {
            setError('Error al conectar con el servidor');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Crear Cuenta
                    </h1>
                    <p className="text-gray-600">
                        Regístrate para comenzar
                    </p>
                </div>

                <Card>
                    <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded">
                        <p className="text-sm">
                            <strong>Nota:</strong> El primer usuario registrado obtendrá automáticamente privilegios de administrador.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
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
                        />

                        <Input
                            label="Contraseña"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            helperText="Mínimo 6 caracteres"
                            required
                            fullWidth
                        />

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
                            Crear Cuenta
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
            </div>
        </div>
    );
}
