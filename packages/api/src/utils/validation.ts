import { z } from 'zod';

export const emailSchema = z.string().min(1, 'Email is required').email('Invalid email address');

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Password schema for development (simple)
const passwordSchemaDev = z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters');

// Password schema for production (strong)
const passwordSchemaProd = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Export the appropriate schema based on environment
export const passwordSchema = isProduction ? passwordSchemaProd : passwordSchemaDev;

export const nameSchema = z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters');

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export const registerSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
});

export const resetPasswordSchema = z.object({
    email: emailSchema,
});

export const updatePasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: passwordSchema,
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export function validateEmail(email: string): boolean {
    return emailSchema.safeParse(email).success;
}

export function validatePassword(password: string): boolean {
    return passwordSchema.safeParse(password).success;
}

export function validateName(name: string): boolean {
    return nameSchema.safeParse(name).success;
}

/**
 * Get password requirements based on current environment
 * @returns Object with password requirements
 */
export function getPasswordRequirements() {
    return {
        isProduction,
        minLength: isProduction ? 8 : 6,
        requireUppercase: isProduction,
        requireLowercase: isProduction,
        requireNumber: isProduction,
        requireSpecialChar: isProduction,
        requirements: isProduction
            ? [
                  'Mínimo 8 caracteres',
                  'Al menos una letra mayúscula',
                  'Al menos una letra minúscula',
                  'Al menos un número',
                  'Al menos un carácter especial (!@#$%^&*)',
              ]
            : ['Mínimo 6 caracteres'],
    };
}