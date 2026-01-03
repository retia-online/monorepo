import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@megamercado/api';
import { loginSchema } from '@megamercado/api';
import { rateLimit } from '@/lib/rate-limit';
import { logger, logAuth, logAPI } from '@/lib/logger';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');

export async function POST(request: NextRequest) {
    const ip =
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Rate limiting
    const rateLimitResponse = await rateLimit(request, 'login');
    if (rateLimitResponse) {
        logAPI.rateLimited(ip, '/api/mobile/auth/login');
        return rateLimitResponse;
    }

    try {
        const body = await request.json();

        // Validate input
        const validated = loginSchema.parse(body);

        // Connect to database
        await connectDB();

        // Find user with password field
        const user = await User.findOne({ email: validated.email }).select('+password');

        if (!user || !user.password) {
            logAuth.login(validated.email, false);
            return NextResponse.json({ error: 'El email o la contraseña son incorrectos' }, { status: 401 });
        }

        // Verify password
        const isValid = await user.comparePassword(validated.password);

        if (!isValid) {
            logAuth.login(validated.email, false);
            return NextResponse.json({ error: 'El email o la contraseña son incorrectos' }, { status: 401 });
        }

        // Check if user is approved (for whitelist mode)
        // ADMINs are always considered approved
        if (user.role !== 'ADMIN' && !user.approved) {
            logger.warn({
                event: 'auth.pending_approval',
                email: user.email,
            }, 'User login attempt (mobile) - pending approval');
            logAuth.login(validated.email, false);
            return NextResponse.json({ error: 'Tu cuenta está pendiente de aprobación' }, { status: 403 });
        }

        // Log successful login
        logAuth.login(user.email, true);

        // Create JWT token for mobile
        const token = await new SignJWT({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(JWT_SECRET);

        return NextResponse.json({
            message: 'Login exitoso',
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image,
            },
            token,
        });
    } catch (error: any) {
        logAPI.error(
            'POST',
            '/api/mobile/auth/login',
            error instanceof Error ? error : new Error(String(error)),
            ip
        );

        if (error?.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 });
    }
}
