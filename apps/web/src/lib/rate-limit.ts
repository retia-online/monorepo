import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Upstash Redis rate limiter — production-safe, works in serverless/edge environments.
 * Falls back to a no-op limiter if Redis is not configured (development without Upstash).
 *
 * Required env vars:
 *   UPSTASH_REDIS_REST_URL  — from https://console.upstash.com
 *   UPSTASH_REDIS_REST_TOKEN — from https://console.upstash.com
 */

// Check if Upstash is configured
const isUpstashConfigured =
    !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

// Redis client (only created when Upstash is configured)
const redis = isUpstashConfigured
    ? new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
    : null;

// Rate limiter configs per endpoint
const limiterConfigs = {
    login: {
        requests: 5,
        window: '15 m', // 5 attempts per 15 minutes
    },
    register: {
        requests: 3,
        window: '1 h', // 3 attempts per hour
    },
    'forgot-password': {
        requests: 3,
        window: '1 h', // 3 attempts per hour
    },
    'reset-password': {
        requests: 5,
        window: '15 m', // 5 attempts per 15 minutes
    },
} as const;

export type RateLimiterType = keyof typeof limiterConfigs;

// Cache of Ratelimit instances (one per endpoint type)
const limiterCache: Partial<Record<RateLimiterType, Ratelimit>> = {};

function getLimiter(type: RateLimiterType): Ratelimit | null {
    if (!redis) return null;

    if (!limiterCache[type]) {
        const config = limiterConfigs[type];
        limiterCache[type] = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(config.requests, config.window),
            analytics: false, // Set to true if you want Upstash analytics
            prefix: `${process.env.INSTANCE || 'app'}:rl:${type}`,
        });
    }

    return limiterCache[type]!;
}

/**
 * Rate limit middleware — production-safe with Upstash Redis.
 * In development without UPSTASH_ vars configured, this is a no-op (passes all requests).
 *
 * @param request - Next.js request object
 * @param type - Endpoint type to apply rate limiting for
 * @returns NextResponse with 429 if rate limited, null if allowed
 */
export async function rateLimit(
    request: NextRequest,
    type: RateLimiterType
): Promise<NextResponse | null> {
    const limiter = getLimiter(type);

    // If Upstash is not configured (development), skip rate limiting
    if (!limiter) {
        if (process.env.NODE_ENV === 'production') {
            console.warn(
                '[rate-limit] WARNING: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not set. ' +
                    'Rate limiting is DISABLED. Configure Upstash Redis for production security.'
            );
        }
        return null;
    }

    // Get IP address from request
    const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        'anonymous';

    // Use IP + type as the rate limit key
    const identifier = `${ip}:${type}`;

    try {
        const { success, remaining, reset } = await limiter.limit(identifier);

        if (!success) {
            const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);

            return NextResponse.json(
                {
                    error: 'Demasiados intentos. Por favor, intenta más tarde.',
                    retryAfter: retryAfterSeconds,
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(retryAfterSeconds),
                        'X-RateLimit-Remaining': String(remaining),
                        'X-RateLimit-Reset': String(reset),
                    },
                }
            );
        }

        return null; // Request allowed
    } catch (error) {
        // If Redis fails, log but don't block the request (fail open)
        console.error('[rate-limit] Redis error, failing open:', error);
        return null;
    }
}
