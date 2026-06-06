import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User, UserRole } from '@core/api';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { sendEmail } from '@core/api';
import crypto from 'crypto';

/**
 * POST /api/admin/users/invite
 * Crea un usuario e envía una invitación (solo Admin)
 */
export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación y rol de admin
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        const body = await request.json();
        const { name, email } = body;

        if (!name || !email) {
            return NextResponse.json(
                { error: 'El nombre y el email son requeridos' },
                { status: 400 }
            );
        }

        await connectDB();

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Un usuario con este email ya existe' },
                { status: 400 }
            );
        }

        // Generar token de invitación
        const inviteToken = crypto.randomBytes(32).toString('hex');
        const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

        // Crear usuario (inicialmente aprobado)
        const user = await User.create({
            name,
            email,
            role: UserRole.USER,
            approved: true,
            inviteToken,
            inviteExpires,
            invitedBy: session.user.id as any,
        });

        logger.info(
            {
                event: 'admin.user.invited',
                userId: user._id.toString(),
                email: user.email,
                invitedBy: session.user.email,
            },
            'Usuario invitado'
        );

        // Enviar email de invitación
        try {
            const inviteUrl = `${process.env.NEXTAUTH_URL}/register?token=${inviteToken}&email=${encodeURIComponent(email)}`;
            const emailHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                        .footer { font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>👋 Te han invitado</h1>
                        </div>
                        <div class="content">
                            <p>Hola <strong>${name}</strong>,</p>
                            <p>Has sido invitado a unirte a <strong>${process.env.INSTANCE || 'nuestra plataforma'}</strong>.</p>
                            <p>Para completar tu registro y establecer tu contraseña, haz clic en el siguiente botón:</p>
                            <p style="text-align: center;">
                                <a href="${inviteUrl}" class="button">Aceptar Invitación</a>
                            </p>
                            <p>Este enlace expirará en 7 días.</p>
                            <div class="footer">
                                <p>Si no esperabas esta invitación, puedes ignorar este correo.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `;

            await sendEmail({
                to: email,
                subject: `🚀 Invitación para unirte a ${process.env.INSTANCE || 'la app'}`,
                html: emailHtml,
            });

            logger.info({ event: 'email.invite_sent', email }, 'Email de invitación enviado');
        } catch (emailError) {
            logger.warn(
                {
                    event: 'email.invite_failed',
                    email,
                    error: emailError instanceof Error ? emailError.message : 'Unknown error',
                },
                'Error enviando email de invitación'
            );
        }

        return NextResponse.json({
            message: 'Usuario invitado exitosamente',
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        logger.error(
            {
                event: 'admin.user.invite_error',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            'Error invitando usuario'
        );

        return NextResponse.json({ error: 'Error al invitar al usuario' }, { status: 500 });
    }
}
