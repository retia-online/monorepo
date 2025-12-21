import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@retia/database';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { sendEmail } from '@retia/utils';

/**
 * PATCH /api/admin/users/[id]/approve
 * Aprobar o desaprobar un usuario (solo Admin)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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
        const { approved } = body;

        if (typeof approved !== 'boolean') {
            return NextResponse.json(
                { error: 'El campo approved debe ser boolean' },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // No permitir cambiar el estado de admin
        if (user.role === 'ADMIN') {
            return NextResponse.json(
                { error: 'No se puede cambiar el estado de un administrador' },
                { status: 400 }
            );
        }

        const wasApproved = user.approved;
        user.approved = approved;

        if (approved && !wasApproved) {
            user.approvedAt = new Date();
            user.approvedBy = session.user.id as any;
        }

        await user.save();

        logger.info({
            event: 'admin.user.approval_changed',
            userId: user._id.toString(),
            email: user.email,
            approved,
            changedBy: session.user.email,
        }, `Usuario ${approved ? 'aprobado' : 'desaprobado'}`);

        // Si se aprobó el usuario, enviar email de notificación
        if (approved && !wasApproved) {
            try {
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
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>✅ Cuenta Aprobada</h1>
                            </div>
                            <div class="content">
                                <p>Hola <strong>${user.name}</strong>,</p>
                                <p>¡Buenas noticias! Tu cuenta ha sido aprobada por el administrador.</p>
                                <p>Ya puedes iniciar sesión y acceder a todas las funcionalidades de la plataforma.</p>
                                <p style="text-align: center;">
                                    <a href="${process.env.NEXTAUTH_URL}/login" class="button">Iniciar Sesión</a>
                                </p>
                                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                                <p>Saludos,<br>El equipo de ${process.env.INSTANCE || 'App'}</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `;

                await sendEmail({
                    to: user.email,
                    subject: '✅ Tu cuenta ha sido aprobada',
                    html: emailHtml,
                });

                logger.info({
                    event: 'email.approval_sent',
                    email: user.email,
                }, 'Email de aprobación enviado');
            } catch (emailError) {
                logger.warn({
                    event: 'email.approval_failed',
                    email: user.email,
                    error: emailError instanceof Error ? emailError.message : 'Unknown error',
                }, 'Error enviando email de aprobación');
                // No fallar la operación si el email no se envía
            }
        }

        return NextResponse.json({
            message: `Usuario ${approved ? 'aprobado' : 'desaprobado'} exitosamente`,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                approved: user.approved,
                approvedAt: user.approvedAt,
            },
        });
    } catch (error) {
        logger.error({
            event: 'admin.user.approval_error',
            error: error instanceof Error ? error.message : 'Unknown error',
        }, 'Error cambiando aprobación de usuario');

        return NextResponse.json(
            { error: 'Error al cambiar estado del usuario' },
            { status: 500 }
        );
    }
}
