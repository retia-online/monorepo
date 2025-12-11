import { z } from 'zod';

export const emailSchema = z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address');

export const passwordSchema = z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters');

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

export const updatePasswordSchema = z.object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
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
