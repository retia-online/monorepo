import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@retia/database';
import crypto from 'crypto';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { logger, logAPI, logSecurity } from '@/lib/logger';

const resetPasswordConfirmSchema = z.object({
    token: z.string().min(1, 'Token es requerido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function POST(request: NextRequest) {
    const ip =
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Rate limiting
    const rateLimitResponse = await rateLimit(request, 'reset-password');
    if (rateLimitResponse) {
        logAPI.rateLimited(ip, '/api/reset-password');
        return rateLimitResponse;
    }

    try {
        const body = await request.json();

        // Validate input
        const validated = resetPasswordConfirmSchema.parse(body);

        // Hash the token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(validated.token).digest('hex');

        // Connect to database
        await connectDB();

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }, // Token not expired
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            logSecurity.tokenExpired('unknown', 'password_reset');

            return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 });
        }

        // Update password
        user.password = validated.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        logger.info(
            {
                event: 'password_reset.success',
                email: user.email,
                ip,
            },
            `Password successfully reset for ${user.email}`
        );

        return NextResponse.json(
            { message: 'Contraseña actualizada exitosamente' },
            { status: 200 }
        );
    } catch (error: any) {
        logAPI.error(
            'POST',
            '/api/reset-password',
            error instanceof Error ? error : new Error(String(error)),
            ip
        );

        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }

        return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
    }
}
