'use client';

import { useState } from 'react';
import { Input, Button, Card } from '@megamercado-vzla/ui';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error al enviar el email');
                setLoading(false);
                return;
            }

            setSuccess(true);
            setEmail('');
        } catch (err) {
            setError('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Recuperar Contraseña</h1>
                    <p className="text-gray-600">Ingresa tu email para recibir instrucciones</p>
                </div>

                <Card>
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                            <p className="font-medium">¡Email enviado!</p>
                            <p className="text-sm mt-1">
                                Revisa tu bandeja de entrada para restablecer tu contraseña.
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            helperText="Te enviaremos un link para restablecer tu contraseña"
                            required
                            fullWidth
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loading}
                            disabled={loading || success}
                        >
                            {success ? 'Email Enviado' : 'Enviar Instrucciones'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <Link
                            href="/login"
                            className="font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            ← Volver al inicio de sesión
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
