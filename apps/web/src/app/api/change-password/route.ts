import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB, User } from '@retia-global/api';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
    try {
        console.log('🔐 Change password request received');

        // Verificar autenticación
        const session = await auth();
        console.log('👤 Session:', session ? 'Found' : 'Not found');

        if (!session || !session.user?.email) {
            console.log('❌ No session or email');
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Validar datos de entrada
        const body = await request.json();
        console.log('📝 Request body received');

        const validatedData = changePasswordSchema.parse(body);
        console.log('✅ Data validated');

        // Conectar a la base de datos
        console.log('🔌 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected');

        // Buscar el usuario (incluir password que está excluido por defecto)
        console.log('🔍 Looking for user:', session.user.email);
        const user = await User.findOne({ email: session.user.email }).select('+password');
        console.log('👤 User found:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('❌ User not found in database');
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        console.log('🔐 User has password field:', !!user.password);

        // Verificar si el usuario tiene contraseña (no es OAuth)
        if (!user.password) {
            console.log('❌ User has no password (OAuth user)');
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
                const { createOdooService } = await import('@retia-global/api');
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
                console.error('Odoo password update error:', odooError);
                return NextResponse.json(
                    { error: 'Error al actualizar contraseña en Odoo' },
                    { status: 500 }
                );
            }
        } else {
            // Standard flow for local-only users
            // Verificar contraseña actual
            console.log('🔍 Verifying current password...');
            const isCurrentPasswordValid = await bcrypt.compare(
                validatedData.currentPassword,
                user.password || ''
            );
            console.log('✅ Current password valid:', isCurrentPasswordValid);

            if (!isCurrentPasswordValid) {
                console.log('❌ Current password is incorrect');
                return NextResponse.json(
                    { error: 'La contraseña actual es incorrecta' },
                    { status: 400 }
                );
            }
        }

        // Verificar que la nueva contraseña sea diferente
        console.log('🔍 Checking if new password is different...');
        const isSamePassword = await bcrypt.compare(validatedData.newPassword, user.password);
        console.log('🔄 Is same password:', isSamePassword);

        if (isSamePassword) {
            console.log('❌ New password is the same as current');
            return NextResponse.json(
                { error: 'La nueva contraseña debe ser diferente a la actual' },
                { status: 400 }
            );
        }

        // Hashear la nueva contraseña
        console.log('🔐 Hashing new password...');
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, saltRounds);
        console.log('✅ Password hashed');

        // Actualizar la contraseña en la base de datos
        console.log('💾 Updating password in database...');
        const updateResult = await User.findByIdAndUpdate(user._id, {
            password: hashedNewPassword,
            updatedAt: new Date(),
        });
        console.log('✅ Password updated:', !!updateResult);

        console.log('🎉 Password change completed successfully');
        return NextResponse.json(
            { message: 'Contraseña actualizada exitosamente' },
            { status: 200 }
        );
    } catch (error) {
        console.error('❌ Error changing password:', error);
        console.error('Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });

        if (error instanceof z.ZodError) {
            console.log('📝 Validation error:', error.errors);
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
