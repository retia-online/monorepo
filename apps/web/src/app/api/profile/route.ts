import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB, User } from '@megamercado-vzla/api';
import { z } from 'zod';

const updateProfileSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

export async function GET() {
    try {
        // Verificar autenticación
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Conectar a la base de datos
        await connectDB();

        // Buscar el usuario
        const user = await User.findOne({ email: session.user.email }).select('-password');
        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Verificar autenticación
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Validar datos de entrada
        const body = await request.json();
        const validatedData = updateProfileSchema.parse(body);

        // Conectar a la base de datos
        await connectDB();

        // Buscar y actualizar el usuario
        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                name: validatedData.name,
                updatedAt: new Date(),
            },
            { new: true, select: '-password' }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Perfil actualizado exitosamente',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt,
            }
        });

    } catch (error) {
        console.error('Error updating profile:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}