'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export default function ProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [formData, setFormData] = useState({
        name: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Si no hay sesión, mostrar mensaje
    if (!session) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
                <Navbar
                    showAuthButtons={true}
                    instanceName={process.env.NEXT_PUBLIC_COMPANY || 'App'}
                />
                <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                    <div className="max-w-md w-full mx-auto text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Acceso Restringido
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Necesitas iniciar sesión para acceder a tu perfil.
                        </p>
                        <a
                            href="/login"
                            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Iniciar Sesión
                        </a>
                    </div>
                </main>
            </div>
        );
    }

    // Cargar perfil al montar el componente
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/profile');
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data.user);
                    setFormData({ name: data.user.name });
                } else {
                    setError('Error al cargar el perfil');
                }
            } catch (error) {
                setError('Error de conexión');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Limpiar mensajes cuando el usuario empiece a escribir
        if (error) setError('');
        if (success) setSuccess('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('El nombre es requerido');
            return;
        }

        setIsSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setProfile(data.user);
                setSuccess('Perfil actualizado exitosamente');
                // Recargar la sesión para actualizar el nombre en el navbar
                window.location.reload();
            } else {
                setError(data.error || 'Error al actualizar el perfil');
            }
        } catch (error) {
            setError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
                <Navbar
                    showAuthButtons={true}
                    instanceName={process.env.NEXT_PUBLIC_COMPANY || 'App'}
                />
                <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando perfil...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
                <Navbar
                    showAuthButtons={true}
                    instanceName={process.env.NEXT_PUBLIC_COMPANY || 'App'}
                />
                <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                    <div className="max-w-md w-full mx-auto text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
                        <p className="text-gray-600 mb-6">No se pudo cargar tu perfil.</p>
                        <a
                            href="/"
                            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Volver al Inicio
                        </a>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
            <Navbar
                showAuthButtons={true}
                instanceName={process.env.NEXT_PUBLIC_COMPANY || 'App'}
            />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
                        <p className="text-gray-600">Gestiona tu información personal</p>
                    </div>

                    {/* Profile Content */}
                    <div className="p-6">
                        {/* Messages */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-5 w-5 text-red-400"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                                <div className="flex">
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
                                        <p className="text-sm text-green-800">{success}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <Image
                                        src="/assets/images/branding/avatar.svg"
                                        alt="Avatar"
                                        width={120}
                                        height={120}
                                        className="rounded-full border-4 border-gray-200"
                                    />
                                    <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 hover:bg-primary/90 transition-colors">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Cambiar foto</p>
                            </div>

                            {/* Profile Form */}
                            <div className="flex-1">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label
                                                htmlFor="name"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Nombre Completo
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Correo Electrónico
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={profile.email}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                                                disabled
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                El email no se puede cambiar
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="role"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Rol
                                        </label>
                                        <div className="flex items-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${profile.role === 'ADMIN'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                    }`}
                                            >
                                                {profile.role === 'ADMIN'
                                                    ? '👑 Administrador'
                                                    : '👤 Usuario'}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="created"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Miembro desde
                                        </label>
                                        <input
                                            type="text"
                                            id="created"
                                            value={new Date(profile.createdAt).toLocaleDateString(
                                                'es-ES'
                                            )}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                                            disabled
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                        </button>
                                        <a
                                            href="/change-password"
                                            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors text-center"
                                        >
                                            Cambiar Contraseña
                                        </a>
                                        <a
                                            href="/"
                                            className="text-gray-600 hover:text-gray-900 px-6 py-2 text-center transition-colors"
                                        >
                                            Cancelar
                                        </a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
