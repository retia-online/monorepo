import React, { useState } from 'react';

export interface User {
    name?: string | null;
    email?: string | null;
    role?: string;
}

export interface NavbarProps {
    showAuthButtons?: boolean;
    instanceName?: string;
    user?: User | null;
    onLogout?: () => void;
    logoSrc?: string;
}

export function Navbar({
    showAuthButtons = true,
    instanceName = 'App',
    user,
    onLogout,
    logoSrc = '/assets/images/branding/logo-square.svg',
}: NavbarProps) {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleLogout = () => {
        setIsUserMenuOpen(false);
        onLogout?.();
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <a href="/" className="flex items-center">
                            <img
                                src={logoSrc}
                                alt="Logo"
                                width={40}
                                height={40}
                                className="mr-3"
                            />
                            <span className="text-xl font-bold text-gray-900">
                                {instanceName}
                            </span>
                        </a>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <a
                                href="/"
                                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Inicio
                            </a>
                        </div>
                    </div>

                    {/* Auth Buttons */}
                    {showAuthButtons && (
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-3 py-2"
                                    >
                                        <img
                                            src="/assets/images/branding/avatar.svg"
                                            alt="Avatar"
                                            width={32}
                                            height={32}
                                            className="rounded-full"
                                        />
                                        <span className="text-sm font-medium">
                                            {user.name}
                                        </span>
                                        {user.role === 'ADMIN' && (
                                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                                Admin
                                            </span>
                                        )}
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* User Dropdown Menu */}
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                            <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                                                {user.email}
                                            </div>
                                            <a
                                                href="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Mi Perfil
                                                </div>
                                            </a>
                                            <a
                                                href="/change-password"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2v6m0 0V9a2 2 0 00-2-2M9 7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2" />
                                                    </svg>
                                                    Cambiar Contraseña
                                                </div>
                                            </a>

                                            {user.role === 'ADMIN' && (
                                                <a
                                                    href="/admin/users"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                        Gestión de Usuarios
                                                    </div>
                                                </a>
                                            )}
                                            <div className="border-t border-gray-100 mt-1">
                                                <button
                                                    type="button"
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                        </svg>
                                                        Cerrar Sesión
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <a
                                        href="/login"
                                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Iniciar Sesión
                                    </a>
                                    <a
                                        href="/register"
                                        className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Registrarse
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            type="button"
                            className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}