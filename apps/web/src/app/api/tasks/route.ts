import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB, Task, createOdooService, createOdooTask } from '@core/api';
import { z } from 'zod';

const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    projectId: z.number().optional(),
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
 * POST: Crear una tarea local y sincronizarla con Odoo
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
            projectId: validated.projectId,
        });

        // 2. Sincronización con Odoo si está habilitado
        const isOdooEnabled = (process.env.AUTH_PROVIDERS || 'email').split(',').includes('odoo');
        let odooTaskId: number | undefined;

        if (isOdooEnabled) {
            try {
                const odoo = createOdooService();
                
                // Intentamos crear la tarea en Odoo
                odooTaskId = await createOdooTask(
                    odoo,
                    validated.title,
                    validated.description || '',
                    validated.projectId
                );

                if (odooTaskId) {
                    // Actualizar tarea local con el ID devuelto por Odoo
                    localTask.odooTaskId = odooTaskId;
                    await localTask.save();
                    console.log(`✅ Tarea sincronizada con Odoo con ID: ${odooTaskId}`);
                }
            } catch (odooError) {
                // En producción podrías querer guardar una tarea de reintento en cola,
                // pero permitiremos que la tarea se cree localmente.
                console.error('⚠️ Error al crear tarea en Odoo (sincronización fallida):', odooError);
            }
        }

        return NextResponse.json(
            {
                message: 'Tarea creada exitosamente',
                task: localTask,
                odooSynced: !!odooTaskId,
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
