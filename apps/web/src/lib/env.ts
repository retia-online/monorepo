import { z } from 'zod';

/**
 * Schema for environment variables validation
 * This ensures all required environment variables are present and valid
 */
const envSchema = z
    .object({
        // Node Environment
        NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

        // Instance Configuration
        INSTANCE: z.string().default('App'),
        COMPANY: z.string().default('App'),

        // Database
        MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

        // NextAuth
        NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
        NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),

        // Auth Providers
        AUTH_PROVIDERS: z.string().default('email'),

        // Auth Mode
        AUTH_MODE: z
            .enum(['required', 'disabled', 'optional', 'whitelist', 'invite-only'])
            .default('required'),

        // Google OAuth (optional)
        GOOGLE_CLIENT_ID: z.string().optional(),
        GOOGLE_CLIENT_SECRET: z.string().optional(),

        // Facebook OAuth (optional)
        FACEBOOK_CLIENT_ID: z.string().optional(),
        FACEBOOK_CLIENT_SECRET: z.string().optional(),

        // Email/SMTP (optional but recommended)
        SMTP_HOST: z.string().optional(),
        SMTP_PORT: z.string().regex(/^\d+$/, 'SMTP_PORT must be a number').optional(),
        SMTP_USER: z.string().optional(),
        SMTP_PASSWORD: z.string().optional(),
        SMTP_FROM: z.string().email('SMTP_FROM must be a valid email').optional(),

        // Logging
        LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).optional(),

        // Design Configuration
        NEXT_PUBLIC_PRIMARY_COLOR: z.string().optional().default('#6366f1'),
        NEXT_PUBLIC_SECONDARY_COLOR: z.string().optional().default('#ec4899'),
        NEXT_PUBLIC_BACKGROUND_COLOR: z.string().optional().default('#f8fafc'),
        NEXT_PUBLIC_TEXT_COLOR: z.string().optional().default('#1e293b'),
        NEXT_PUBLIC_FONT_FAMILY: z.string().optional().default('Manrope'),
    })
    .refine(
        (data) => {
            // If Google is in AUTH_PROVIDERS, both client ID and secret must be present
            const providers = data.AUTH_PROVIDERS.split(',').map((p) => p.trim().toLowerCase());
            if (providers.includes('google')) {
                return !!data.GOOGLE_CLIENT_ID && !!data.GOOGLE_CLIENT_SECRET;
            }
            return true;
        },
        {
            message:
                'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required when Google is enabled in AUTH_PROVIDERS',
            path: ['GOOGLE_CLIENT_ID'],
        }
    )
    .refine(
        (data) => {
            // If Facebook is in AUTH_PROVIDERS, both client ID and secret must be present
            const providers = data.AUTH_PROVIDERS.split(',').map((p) => p.trim().toLowerCase());
            if (providers.includes('facebook')) {
                return !!data.FACEBOOK_CLIENT_ID && !!data.FACEBOOK_CLIENT_SECRET;
            }
            return true;
        },
        {
            message:
                'FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET are required when Facebook is enabled in AUTH_PROVIDERS',
            path: ['FACEBOOK_CLIENT_ID'],
        }
    )
    .refine(
        (data) => {
            // If SMTP is partially configured, all SMTP fields should be present
            const smtpFields = [
                data.SMTP_HOST,
                data.SMTP_PORT,
                data.SMTP_USER,
                data.SMTP_PASSWORD,
                data.SMTP_FROM,
            ];
            // Filter out undefined AND empty strings
            const definedFields = smtpFields.filter((f) => f !== undefined && f !== '');

            // If some fields are defined but not all, it's an error
            if (definedFields.length > 0 && definedFields.length < 5) {
                return false;
            }
            return true;
        },
        {
            message:
                'If SMTP is configured, all SMTP fields (HOST, PORT, USER, PASSWORD, FROM) must be provided',
            path: ['SMTP_HOST'],
        }
    );

/**
 * Validated environment variables
 * Use this instead of process.env to get type-safe, validated env vars
 */
export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

/**
 * Validate and return environment variables
 * This function should be called once at application startup
 */
export function validateEnv(): Env {
    if (_env) {
        return _env;
    }

    try {
        _env = envSchema.parse(process.env);
        console.log('✅ Environment variables validated successfully');
        return _env;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Invalid environment variables:');
            console.error('');

            error.errors.forEach((err) => {
                console.error(`  • ${err.path.join('.')}: ${err.message}`);
            });

            console.error('');
            console.error(
                'Please check your .env.local file and ensure all required variables are set correctly.'
            );
            console.error('');

            // Exit the process in production, throw in development for better DX
            if (process.env.NODE_ENV === 'production') {
                process.exit(1);
            } else {
                throw new Error('Environment validation failed. Check the errors above.');
            }
        }
        throw error;
    }
}

/**
 * Get validated environment variables
 * Automatically validates if not done before
 */
export function getEnv(): Env {
    if (!_env) {
        // Auto-validate if not done before
        return validateEnv();
    }
    return _env;
}

/**
 * Check if a specific OAuth provider is enabled and properly configured
 */
export function isProviderEnabled(provider: 'google' | 'facebook'): boolean {
    const env = getEnv();
    const providers = env.AUTH_PROVIDERS.split(',').map((p) => p.trim().toLowerCase());

    if (!providers.includes(provider)) {
        return false;
    }

    if (provider === 'google') {
        return !!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET;
    }

    if (provider === 'facebook') {
        return !!env.FACEBOOK_CLIENT_ID && !!env.FACEBOOK_CLIENT_SECRET;
    }

    return false;
}

/**
 * Check if SMTP is properly configured
 */
export function isSMTPConfigured(): boolean {
    const env = getEnv();
    return !!(
        env.SMTP_HOST &&
        env.SMTP_PORT &&
        env.SMTP_USER &&
        env.SMTP_PASSWORD &&
        env.SMTP_FROM
    );
}

// Export the schema for testing purposes
export { envSchema };
