import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB, User } from '@retia-global/api';

export async function GET() {
    try {
        // Verificar autenticación
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Conectar a la base de datos
        await connectDB();

        // Buscar el usuario (incluir password que está excluido por defecto)
        const user = await User.findOne({ email: session.user.email }).select('+password');
        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // Verificar si tiene contraseña (no es OAuth)
        const canChangePassword = !!user.password;

        return NextResponse.json({
            canChangePassword,
            isOAuthUser: !user.password,
            message: canChangePassword
                ? 'El usuario puede cambiar su contraseña'
                : 'Usuario registrado con OAuth, no puede cambiar contraseña',
        });
    } catch (error) {
        console.error('Error checking password capability:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
