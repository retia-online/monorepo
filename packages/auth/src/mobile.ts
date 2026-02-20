import { SignJWT, jwtVerify } from 'jose';
import { AuthUser } from './types';

/**
 * Generate a JWT token for mobile authentication
 */
export async function generateMobileToken(
    user: AuthUser,
    secret: string,
    expiresIn: string = '7d'
): Promise<string> {
    const secretKey = new TextEncoder().encode(secret);

    return await new SignJWT({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(secretKey);
}

/**
 * Verify a mobile JWT token
 */
export async function verifyMobileToken(
    token: string,
    secret: string
): Promise<AuthUser | null> {
    try {
        const secretKey = new TextEncoder().encode(secret);
        const { payload } = await jwtVerify(token, secretKey);

        return {
            id: payload.id as string,
            email: payload.email as string,
            name: payload.name as string,
            role: payload.role as string,
        } as AuthUser;
    } catch (error) {
        return null;
    }
}
