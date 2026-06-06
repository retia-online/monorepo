import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@core/api';
import { resetPasswordSchema, sendPasswordResetEmail } from '@core/api';
import crypto from 'crypto';
import { rateLimit } from '@/lib/rate-limit';
import { logger, logAuth, logAPI } from '@/lib/logger';

export async function POST(request: NextRequest) {
    const ip =
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Rate limiting
    const rateLimitResponse = await rateLimit(request, 'forgot-password');
    if (rateLimitResponse) {
        logAPI.rateLimited(ip, '/api/forgot-password');
        return rateLimitResponse;
    }

    try {
        const body = await request.json();

        // Validate input
        const validated = resetPasswordSchema.parse(body);

        // Connect to database
        await connectDB();

        // Find user
        const user = await User.findOne({ email: validated.email });

        // Always return success even if user doesn't exist (security best practice)
        if (!user) {
            logger.info(
                {
                    event: 'password_reset.user_not_found',
                    email: validated.email,
                    ip,
                },
                `Password reset requested for non-existent email: ${validated.email}`
            );

            return NextResponse.json(
                { message: 'Si el email existe, recibirás un link de recuperación' },
                { status: 200 }
            );
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save hashed token to user with 1 hour expiration
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        // Log password reset request
        logAuth.passwordReset(user.email, ip);

        try {
            // Send email with reset token
            await sendPasswordResetEmail(user.email, resetToken);
        } catch (emailError) {
            logger.error(
                {
                    event: 'email.send_failed',
                    email: user.email,
                    error: emailError instanceof Error ? emailError.message : 'Unknown error',
                    ip,
                },
                'Failed to send password reset email'
            );

            return NextResponse.json(
                { error: 'Error al enviar el email. Verifica la configuración SMTP.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: 'Email de recuperación enviado' }, { status: 200 });
    } catch (error: any) {
        logAPI.error(
            'POST',
            '/api/forgot-password',
            error instanceof Error ? error : new Error(String(error)),
            ip
        );

        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
        }

        return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
    }
}
