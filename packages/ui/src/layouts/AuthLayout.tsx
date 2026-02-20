import React from 'react';

export interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    showLogo?: boolean;
    logoSrc?: string;
    instanceName?: string;
    className?: string;
}

export function AuthLayout({
    children,
    title,
    subtitle,
    showLogo = true,
    logoSrc = '/assets/images/branding/logo-square.svg',
    instanceName = 'App',
    className = '',
}: AuthLayoutProps) {
    return (
        <div className={`min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${className}`}>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {showLogo && (
                    <div className="flex justify-center items-center mb-6">
                        <img
                            src={logoSrc}
                            alt="Logo"
                            width={64}
                            height={64}
                            className="mr-3"
                        />
                        <h1 className="text-3xl font-bold text-gray-900">
                            {instanceName}
                        </h1>
                    </div>
                )}
                
                {title && (
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
                        {title}
                    </h2>
                )}
                
                {subtitle && (
                    <p className="text-center text-sm text-gray-600 mb-8">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {children}
                </div>
            </div>
        </div>
    );
}