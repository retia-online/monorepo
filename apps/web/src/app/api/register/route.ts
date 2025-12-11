import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User, UserRole } from '@retia/database';
import { registerSchema } from '@retia/utils';
import { sendWelcomeEmail } from '@retia/utils';
import { rateLimit } from '@/lib/rate-limit';
import { logger, logAuth, logAPI } from '@/lib/logger';

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Rate limiting
    const rateLimitResponse = await rateLimit(request, 'register');
    if (rateLimitResponse) {
        logAPI.rateLimited(ip, '/api/register');
        return rateLimitResponse;
    }

    try {
        const body = await request.json();

        // Validate input
        const validated = registerSchema.parse(body);

        // Connect to database
        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email: validated.email });
        if (existingUser) {
            logger.warn({
                event: 'register.duplicate_email',
                email: validated.email,
                ip,
            }, `Registration attempt with existing email: ${validated.email}`);

            return NextResponse.json(
                { error: 'Email ya registrado' },
                { status: 400 }
            );
        }

        // Check if this is the first user
        const userCount = await User.countDocuments();
        const isFirstUser = userCount === 0;

        // Create new user
        const user = await User.create({
            name: validated.name,
            email: validated.email,
            password: validated.password,
            role: isFirstUser ? UserRole.ADMIN : UserRole.USER,
        });

        // Log successful registration
        logAuth.register(user.email, user.role, ip);

        // Send welcome email (optional, catch errors to not block registration)
        try {
            await sendWelcomeEmail(user.name, user.email);
        } catch (emailError) {
            logger.warn({
                event: 'email.send_failed',
                email: user.email,
                error: emailError instanceof Error ? emailError.message : 'Unknown error',
            }, 'Failed to send welcome email');
            // Continue anyway
        }

        return NextResponse.json(
            {
                message: 'Usuario registrado exitosamente',
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        logAPI.error('POST', '/api/register', error instanceof Error ? error : new Error(String(error)), ip);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Error al registrar usuario' },
            { status: 500 }
        );
    }
}
