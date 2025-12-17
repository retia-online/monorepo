import { RateLimiterMemory } from 'rate-limiter-flexible';
import { NextRequest, NextResponse } from 'next/server';

// Create rate limiters for different endpoints
const loginLimiter = new RateLimiterMemory({
    points: 5, // 5 attempts
    duration: 15 * 60, // per 15 minutes
    blockDuration: 15 * 60, // Block for 15 minutes
});

const registerLimiter = new RateLimiterMemory({
    points: 3, // 3 attempts
    duration: 60 * 60, // per hour
    blockDuration: 60 * 60, // Block for 1 hour
});

const forgotPasswordLimiter = new RateLimiterMemory({
    points: 3, // 3 attempts
    duration: 60 * 60, // per hour
    blockDuration: 60 * 60, // Block for 1 hour
});

const resetPasswordLimiter = new RateLimiterMemory({
    points: 5, // 5 attempts
    duration: 15 * 60, // per 15 minutes
    blockDuration: 15 * 60, // Block for 15 minutes
});

export type RateLimiterType = 'login' | 'register' | 'forgot-password' | 'reset-password';

/**
 * Rate limit middleware
 * @param request - Next.js request object
 * @param type - Type of rate limiter to use
 * @returns NextResponse if rate limited, null otherwise
 */
export async function rateLimit(
    request: NextRequest,
    type: RateLimiterType
): Promise<NextResponse | null> {
    // Get IP address from request
    const ip =
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Select appropriate limiter
    let limiter: RateLimiterMemory;
    switch (type) {
        case 'login':
            limiter = loginLimiter;
            break;
        case 'register':
            limiter = registerLimiter;
            break;
        case 'forgot-password':
            limiter = forgotPasswordLimiter;
            break;
        case 'reset-password':
            limiter = resetPasswordLimiter;
            break;
        default:
            limiter = loginLimiter;
    }

    try {
        await limiter.consume(ip);
        return null; // Not rate limited
    } catch (rateLimiterRes: any) {
        const retryAfter = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;

        return NextResponse.json(
            {
                error: 'Demasiados intentos. Por favor, intenta más tarde.',
                retryAfter,
            },
            {
                status: 429,
                headers: {
                    'Retry-After': String(retryAfter),
                },
            }
        );
    }
}
