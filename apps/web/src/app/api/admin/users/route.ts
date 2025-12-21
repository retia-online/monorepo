import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@retia/database';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/users
 * Lista todos los usuarios (solo Admin)
 */
export async function GET(request: NextRequest) {
    try {
        // Verificar autenticación y rol de admin
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        await connectDB();

        // Obtener todos los usuarios con información básica
        const users = await User.find({})
            .select('name email role approved approvedAt createdAt')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            users: users.map(user => ({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                approved: user.approved,
                approvedAt: user.approvedAt,
                createdAt: user.createdAt,
            })),
        });
    } catch (error) {
        logger.error({
            event: 'admin.users.list_error',
            error: error instanceof Error ? error.message : 'Unknown error',
        }, 'Error listando usuarios');

        return NextResponse.json(
            { error: 'Error al obtener usuarios' },
            { status: 500 }
        );
    }
}
