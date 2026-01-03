import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProfileCardProps {
    profile: UserProfile;
    onSave: (formData: { name: string }) => Promise<void>;
    loading?: boolean;
    error?: string;
    success?: string;
    avatarSrc?: string;
}

export function ProfileCard({
    profile,
    onSave,
    loading = false,
    error,
    success,
    avatarSrc = '/assets/images/branding/avatar.svg',
}: ProfileCardProps) {
    const [formData, setFormData] = useState({
        name: profile.name,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            return;
        }
        await onSave(formData);
    };

    return (
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
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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
                            <img
                                src={avatarSrc}
                                alt="Avatar"
                                width={120}
                                height={120}
                                className="rounded-full border-4 border-gray-200"
                            />
                            <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 hover:bg-primary/90 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Cambiar foto</p>
                    </div>

                    {/* Profile Form */}
                    <div className="flex-1">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Nombre Completo"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />

                                <Input
                                    label="Correo Electrónico"
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    helperText="El email no se puede cambiar"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rol
                                </label>
                                <div className="flex items-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        profile.role === 'ADMIN' 
                                            ? 'bg-yellow-100 text-yellow-800' 
                                            : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {profile.role === 'ADMIN' ? '👑 Administrador' : '👤 Usuario'}
                                    </span>
                                </div>
                            </div>

                            <Input
                                label="Miembro desde"
                                value={new Date(profile.createdAt).toLocaleDateString('es-ES')}
                                disabled
                            />

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={loading}
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
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
    );
}