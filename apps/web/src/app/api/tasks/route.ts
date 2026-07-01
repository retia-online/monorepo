import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB, Task } from '@core/api';
import { z } from 'zod';

const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
});

/**
 * GET: Obtener todas las tareas locales
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await connectDB();

        const tasks = await Task.find({}).sort({ createdAt: -1 });

        return NextResponse.json({ tasks }, { status: 200 });
    } catch (error: any) {
        console.error('Error in GET /api/tasks:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

/**
 * POST: Crear una tarea local
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const validated = createTaskSchema.parse(body);

        await connectDB();

        // 1. Crear tarea en base de datos local (MongoDB)
        const localTask = await Task.create({
            title: validated.title,
            description: validated.description || '',
        });

        return NextResponse.json(
            {
                message: 'Tarea creada exitosamente',
                task: localTask,
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Error in POST /api/tasks:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos de entrada inválidos', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
