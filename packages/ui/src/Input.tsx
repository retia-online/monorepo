import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
}

export function Input({
    label,
    error,
    helperText,
    fullWidth = true,
    className = '',
    id,
    ...props
}: InputProps) {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    const baseStyles = 'px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200';
    const errorStyles = hasError
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 focus:ring-primary focus:border-primary';
    const widthStyles = fullWidth ? 'w-full' : '';

    return (
        <div className={fullWidth ? 'w-full' : ''}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`${baseStyles} ${errorStyles} ${widthStyles} ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
}
