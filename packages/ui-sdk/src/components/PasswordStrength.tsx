import React from 'react';

export interface PasswordRequirement {
    text: string;
    met: boolean;
}

export interface PasswordStrengthProps {
    password: string;
    requirements: PasswordRequirement[];
    className?: string;
}

export function PasswordStrength({
    password,
    requirements,
    className = '',
}: PasswordStrengthProps) {
    if (!password) return null;

    return (
        <div className={`mt-2 ${className}`}>
            <p className="text-xs font-medium text-gray-700 mb-1">Requisitos de contraseña:</p>
            <ul className="space-y-1">
                {requirements.map((req, index) => (
                    <li key={index} className="flex items-center text-xs">
                        {req.met ? (
                            <svg
                                className="w-4 h-4 mr-1 text-green-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-4 h-4 mr-1 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                        <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                            {req.text}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}