import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@core/api';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { logAPI } from '@/lib/logger';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch (_error) {
        return null;
    }
}

export async function POST(request: NextRequest) {
    const ip =
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    try {
        // Get token from Authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const payload = await verifyToken(token);

        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }

        // Validate request body
        const body = await request.json();
        const validatedData = changePasswordSchema.parse(body);

        // Connect to database
        await connectDB();

        // Find user with password field
        const user = await User.findById(payload.id).select('+password');
        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // Check if user has password (not OAuth user)
        if (!user.password) {
            return NextResponse.json(
                {
                    error: 'Este usuario no tiene contraseña. Fue registrado usando OAuth (Google/Facebook).',
                },
                { status: 400 }
            );
        }

        // Check if user has odoo integration
        const isOdooEnabled = (process.env.AUTH_PROVIDERS || 'email').split(',').includes('odoo');
        const odooUid = user.metadata?.odoo_uid;

        if (isOdooEnabled && odooUid) {
            try {
                const { createOdooService } = await import('@core/api');
                const odoo = createOdooService();

                // 1. Verify current password with Odoo
                const odooAuth = await odoo.authenticate(user.email, validatedData.currentPassword);
                if (!odooAuth) {
                    return NextResponse.json(
                        { error: 'La contraseña actual es incorrecta en Odoo' },
                        { status: 400 }
                    );
                }

                // 2. Update password in Odoo
                await odoo.updatePassword(odooUid, validatedData.newPassword);
            } catch (odooError) {
                logAPI.error('POST', '/api/mobile/auth/change-password', odooError as Error, ip);
                return NextResponse.json(
                    { error: 'Error al actualizar contraseña en Odoo' },
                    { status: 500 }
                );
            }
        } else {
            // Standard flow for local-only users
            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(
                validatedData.currentPassword,
                user.password || ''
            );

            if (!isCurrentPasswordValid) {
                return NextResponse.json(
                    { error: 'La contraseña actual es incorrecta' },
                    { status: 400 }
                );
            }
        }

        // Hash new password and update local DB (always update local too for consistency)
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, saltRounds);

        // Update password in database
        await User.findByIdAndUpdate(user._id, {
            password: hashedNewPassword,
            updatedAt: new Date(),
        });

        return NextResponse.json(
            { message: 'Contraseña actualizada exitosamente' },
            { status: 200 }
        );
    } catch (error: unknown) {
        logAPI.error(
            'POST',
            '/api/mobile/auth/change-password',
            error instanceof Error ? error : new Error(String(error)),
            ip
        );

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
