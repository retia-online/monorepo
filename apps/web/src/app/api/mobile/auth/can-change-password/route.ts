import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@megamercado/api';
import { jwtVerify } from 'jose';
import { logAPI } from '@/lib/logger';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');

async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch (_error) {
        return null;
    }
}

export async function GET(request: NextRequest) {
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

        // Connect to database
        await connectDB();

        // Find user with password field (incluir password que está excluido por defecto)
        const user = await User.findById(payload.id).select('+password');
        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // Check if user has password (not OAuth user)
        const canChangePassword = !!user.password;

        return NextResponse.json({
            canChangePassword,
            isOAuthUser: !user.password,
            message: canChangePassword 
                ? 'El usuario puede cambiar su contraseña' 
                : 'Usuario registrado con OAuth, no puede cambiar contraseña'
        });

    } catch (error: unknown) {
        logAPI.error(
            'GET',
            '/api/mobile/auth/can-change-password',
            error instanceof Error ? error : new Error(String(error)),
            ip
        );

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}