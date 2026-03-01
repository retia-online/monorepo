'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@megamercado-vzla/ui';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    approved: boolean;
    approvedAt?: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteData, setInviteData] = useState({ name: '', email: '' });
    const [inviteStatus, setInviteStatus] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    // Redirect if not admin
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session?.user && session.user.role !== 'ADMIN') {
            router.push('/');
        }
    }, [session, status, router]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.role === 'ADMIN') {
            fetchUsers();
        }
    }, [session]);

    const handleToggleApproval = async (userId: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}/approve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved: !currentStatus }),
            });

            if (res.ok) {
                // Update local state
                setUsers(
                    users.map((u) => (u.id === userId ? { ...u, approved: !currentStatus } : u))
                );
            } else {
                const data = await res.json();
                window.alert(data.error || 'Error al cambiar el estado');
            }
        } catch (error) {
            console.error('Error toggling approval:', error);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteStatus(null);
        setIsInviting(true);

        try {
            const res = await fetch('/api/admin/users/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inviteData),
            });

            const data = await res.json();

            if (res.ok) {
                setInviteStatus({ type: 'success', message: 'Invitación enviada exitosamente' });
                setInviteData({ name: '', email: '' });
                fetchUsers(); // Refresh list to show the new invited user
            } else {
                setInviteStatus({
                    type: 'error',
                    message: data.error || 'Error al enviar invitación',
                });
            }
        } catch (error) {
            setInviteStatus({ type: 'error', message: 'Error de conexión' });
        } finally {
            setIsInviting(false);
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Administración de Usuarios
                    </h1>
                    <p className="text-gray-600">
                        Gestiona aprobaciones e invita a nuevos colaboradores.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User List Table */}
                <div className="lg:col-span-2">
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usuario
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rol
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aprobado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-10 text-center text-gray-500"
                                            >
                                                No hay usuarios registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                                {user.name[0].toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {user.approved ? (
                                                        <span className="flex items-center text-sm text-green-600">
                                                            <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                                            Activo
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center text-sm text-orange-600">
                                                            <span className="h-2 w-2 rounded-full bg-orange-500 mr-2 animate-pulse"></span>
                                                            Pendiente
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {user.role !== 'ADMIN' && (
                                                        <button
                                                            onClick={() =>
                                                                handleToggleApproval(
                                                                    user.id,
                                                                    user.approved
                                                                )
                                                            }
                                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${user.approved ? 'bg-primary' : 'bg-gray-200'}`}
                                                        >
                                                            <span
                                                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user.approved ? 'translate-x-5' : 'translate-x-0'}`}
                                                            />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Invite Section */}
                <div className="lg:col-span-1">
                    <Card>
                        <div className="p-2">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="mr-2">🚀</span> Invitar Usuario
                            </h2>
                            <p className="text-sm text-gray-600 mb-6">
                                Envía una invitación por correo electrónico para que un nuevo
                                usuario se registre.
                            </p>

                            <form onSubmit={handleInvite} className="space-y-4">
                                {inviteStatus && (
                                    <div
                                        className={`p-3 rounded-lg text-sm ${inviteStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                    >
                                        {inviteStatus.message}
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        placeholder="Ej. Juan Pérez"
                                        value={inviteData.name}
                                        onChange={(e) =>
                                            setInviteData({ ...inviteData, name: e.target.value })
                                        }
                                        disabled={isInviting}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        placeholder="juan@ejemplo.com"
                                        value={inviteData.email}
                                        onChange={(e) =>
                                            setInviteData({ ...inviteData, email: e.target.value })
                                        }
                                        disabled={isInviting}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isInviting}
                                    className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isInviting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                            Enviando...
                                        </>
                                    ) : (
                                        'Enviar Invitación'
                                    )}
                                </button>
                            </form>
                        </div>
                    </Card>

                    <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center">
                            <span className="mr-2">💡</span> Ayuda
                        </h3>
                        <ul className="text-xs text-blue-800 space-y-2">
                            <li>
                                • Los usuarios invitados son aprobados automáticamente al
                                registrarse.
                            </li>
                            <li>
                                • En modo <strong>Whitelist</strong>, los registros libres requieren
                                aprobación manual aquí.
                            </li>
                            <li>
                                • En modo <strong>Invite-only</strong>, el botón de registro público
                                está deshabilitado.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
