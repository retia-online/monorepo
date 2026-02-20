import React from 'react';
import { Navbar, type User } from '../auth-components/Navbar';

export interface BaseLayoutProps {
    children: React.ReactNode;
    showAuthButtons?: boolean;
    instanceName?: string;
    user?: User | null;
    onLogout?: () => void;
    className?: string;
}

export function BaseLayout({
    children,
    showAuthButtons = true,
    instanceName = 'App',
    user,
    onLogout,
    className = '',
}: BaseLayoutProps) {
    return (
        <div className={`min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 ${className}`}>
            <Navbar
                showAuthButtons={showAuthButtons}
                instanceName={instanceName}
                user={user}
                onLogout={onLogout}
            />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}