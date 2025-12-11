import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@retia/database';
import { resetPasswordSchema, sendPasswordResetEmail } from '@retia/utils';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
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
            return NextResponse.json(
                { message: 'Si el email existe, recibirás un link de recuperación' },
                { status: 200 }
            );
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Save hashed token to user (you'll need to add these fields to User model)
        // For now, we'll just send the email
        // In production, save: resetPasswordToken: hashedToken, resetPasswordExpires: Date.now() + 3600000

        try {
            // Send email with reset token
            await sendPasswordResetEmail(user.email, resetToken);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            return NextResponse.json(
                { error: 'Error al enviar el email. Verifica la configuración SMTP.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Email de recuperación enviado' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Forgot password error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Email inválido' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Error al procesar la solicitud' },
            { status: 500 }
        );
    }
}
