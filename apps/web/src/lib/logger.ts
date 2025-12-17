import pino from 'pino';

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Create logger instance with appropriate configuration
export const logger = pino({
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

    // Pretty print in development for better readability
    transport: !isProduction
        ? {
              target: 'pino-pretty',
              options: {
                  colorize: true,
                  translateTime: 'HH:MM:ss Z',
                  ignore: 'pid,hostname',
              },
          }
        : undefined,

    // Base configuration
    base: {
        env: process.env.NODE_ENV,
    },

    // Redact sensitive information
    redact: {
        paths: [
            'password',
            'req.headers.authorization',
            'req.headers.cookie',
            '*.password',
            '*.token',
            '*.secret',
            '*.apiKey',
        ],
        censor: '[REDACTED]',
    },

    // Serializers for common objects
    serializers: {
        err: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res,
    },
});

// Helper functions for common logging patterns

/**
 * Log authentication events
 */
export const logAuth = {
    login: (email: string, success: boolean, ip?: string) => {
        logger.info(
            {
                event: 'auth.login',
                email,
                success,
                ip,
            },
            `Login ${success ? 'successful' : 'failed'} for ${email}`
        );
    },

    register: (email: string, role: string, ip?: string) => {
        logger.info(
            {
                event: 'auth.register',
                email,
                role,
                ip,
            },
            `New user registered: ${email}`
        );
    },

    logout: (email: string, ip?: string) => {
        logger.info(
            {
                event: 'auth.logout',
                email,
                ip,
            },
            `User logged out: ${email}`
        );
    },

    passwordReset: (email: string, ip?: string) => {
        logger.info(
            {
                event: 'auth.password_reset',
                email,
                ip,
            },
            `Password reset requested for ${email}`
        );
    },
};

/**
 * Log API events
 */
export const logAPI = {
    request: (method: string, path: string, ip?: string) => {
        logger.debug(
            {
                event: 'api.request',
                method,
                path,
                ip,
            },
            `${method} ${path}`
        );
    },

    error: (method: string, path: string, error: Error, ip?: string) => {
        logger.error(
            {
                event: 'api.error',
                method,
                path,
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                },
                ip,
            },
            `API error: ${method} ${path} - ${error.message}`
        );
    },

    rateLimited: (ip: string, endpoint: string) => {
        logger.warn(
            {
                event: 'api.rate_limited',
                ip,
                endpoint,
            },
            `Rate limit exceeded for ${ip} on ${endpoint}`
        );
    },
};

/**
 * Log database events
 */
export const logDB = {
    connected: (uri: string) => {
        // Mask the URI to hide credentials
        const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
        logger.info(
            {
                event: 'db.connected',
                uri: maskedUri,
            },
            'Database connected'
        );
    },

    disconnected: () => {
        logger.info(
            {
                event: 'db.disconnected',
            },
            'Database disconnected'
        );
    },

    error: (error: Error, operation?: string) => {
        logger.error(
            {
                event: 'db.error',
                operation,
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                },
            },
            `Database error${operation ? ` during ${operation}` : ''}: ${error.message}`
        );
    },
};

/**
 * Log security events
 */
export const logSecurity = {
    suspiciousActivity: (description: string, ip?: string, details?: Record<string, any>) => {
        logger.warn(
            {
                event: 'security.suspicious',
                description,
                ip,
                ...details,
            },
            `Suspicious activity: ${description}`
        );
    },

    unauthorized: (path: string, ip?: string, reason?: string) => {
        logger.warn(
            {
                event: 'security.unauthorized',
                path,
                ip,
                reason,
            },
            `Unauthorized access attempt to ${path}`
        );
    },

    tokenExpired: (email: string, tokenType: string) => {
        logger.info(
            {
                event: 'security.token_expired',
                email,
                tokenType,
            },
            `${tokenType} token expired for ${email}`
        );
    },
};

// Export default logger
export default logger;
