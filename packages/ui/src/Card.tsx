import React from 'react';

export interface CardProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
}

export function Card({ children, title, className = '' }: CardProps) {
    return (
        <div className={`bg-white shadow-lg rounded-lg overflow-hidden ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                </div>
            )}
            <div className="px-6 py-6">{children}</div>
        </div>
    );
}
