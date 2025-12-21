/**
 * Error handling utilities for the mobile app
 */

export interface ApiError {
    message: string;
    code?: string;
    statusCode?: number;
    isNetworkError: boolean;
    isAuthError: boolean;
    isValidationError: boolean;
}

/**
 * Parse error from various sources and return standardized ApiError
 */
export function parseError(error: unknown): ApiError {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('Network')) {
        return {
            message: 'Error de conexión. Verifica tu conexión a internet.',
            code: 'NETWORK_ERROR',
            isNetworkError: true,
            isAuthError: false,
            isValidationError: false,
        };
    }

    // Handle Error objects
    if (error instanceof Error) {
        const message = error.message;

        // Session expired
        if (message === 'Session expired') {
            return {
                message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
                code: 'SESSION_EXPIRED',
                statusCode: 401,
                isNetworkError: false,
                isAuthError: true,
                isValidationError: false,
            };
        }

        // Invalid credentials or unauthorized
        if (
            message.includes('incorrectos') ||
            message.includes('inválidas') ||
            message.includes('Unauthorized') ||
            message.includes('unauthorized')
        ) {
            return {
                message: 'El email o la contraseña son incorrectos',
                code: 'INVALID_CREDENTIALS',
                statusCode: 401,
                isNetworkError: false,
                isAuthError: true,
                isValidationError: false,
            };
        }

        // Pending approval
        if (message === 'PENDING_APPROVAL' || message.includes('pendiente de aprobación')) {
            return {
                message: 'Tu registro ha sido recibido. Tu cuenta está pendiente de validar por un administrador.',
                code: 'PENDING_APPROVAL',
                statusCode: 403,
                isNetworkError: false,
                isAuthError: true,
                isValidationError: false,
            };
        }

        // Email already registered
        if (message.includes('Email ya registrado') || message.includes('already registered')) {
            return {
                message: 'Este email ya está registrado',
                code: 'EMAIL_EXISTS',
                statusCode: 400,
                isNetworkError: false,
                isAuthError: false,
                isValidationError: true,
            };
        }

        // Validation errors
        if (message.includes('Datos inválidos') || message.includes('Email inválido')) {
            return {
                message: message,
                code: 'VALIDATION_ERROR',
                statusCode: 400,
                isNetworkError: false,
                isAuthError: false,
                isValidationError: true,
            };
        }

        // OAuth errors
        if (message.includes('OAuth')) {
            return {
                message: 'Error al iniciar sesión con el proveedor. Por favor intenta de nuevo.',
                code: 'OAUTH_ERROR',
                isNetworkError: false,
                isAuthError: true,
                isValidationError: false,
            };
        }

        // Generic error
        return {
            message: message,
            code: 'UNKNOWN_ERROR',
            isNetworkError: false,
            isAuthError: false,
            isValidationError: false,
        };
    }

    // Handle unknown errors
    return {
        message: 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
        code: 'UNKNOWN_ERROR',
        isNetworkError: false,
        isAuthError: false,
        isValidationError: false,
    };
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
    const apiError = parseError(error);
    return apiError.message;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
    return parseError(error).isNetworkError;
}

/**
 * Check if error is an auth error
 */
export function isAuthError(error: unknown): boolean {
    return parseError(error).isAuthError;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
    return parseError(error).isValidationError;
}

/**
 * Check if error is session expired
 */
export function isSessionExpired(error: unknown): boolean {
    return parseError(error).code === 'SESSION_EXPIRED';
}
