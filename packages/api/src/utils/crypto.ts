import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a password reset token with expiration
 */
export function generatePasswordResetToken(): {
    token: string;
    expires: Date;
} {
    const token = generateToken(32);
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour from now

    return { token, expires };
}

/**
 * Generate an invite token with expiration
 */
export function generateInviteToken(daysValid: number = 7): {
    token: string;
    expires: Date;
} {
    const token = generateToken(32);
    const expires = new Date();
    expires.setDate(expires.getDate() + daysValid);

    return { token, expires };
}