import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Task, TaskStatus } from '@core/api';
import { z } from 'zod';

const webhookPayloadSchema = z.object({
    odooTaskId: z.number(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    status: z.enum(['todo', 'in_progress', 'done', 'cancelled']).optional(),
    projectId: z.number().optional(),
});

/**
 * POST: Receptor de webhook asíncrono enviado por Odoo
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Validar autenticidad del Webhook mediante token en cabecera
        const token = request.headers.get('x-odoo-webhook-token');
        const secret = process.env.ODOO_WEBHOOK_SECRET;

        if (!secret) {
            console.error('❌ ODOO_WEBHOOK_SECRET no está configurado en las variables de entorno.');
            return NextResponse.json({ error: 'Configuración de servidor incompleta' }, { status: 500 });
        }

        if (!token || token !== secret) {
            console.warn(`⚠️ Intento de acceso no autorizado al webhook de Odoo desde IP: ${request.headers.get('x-forwarded-for') || 'desconocida'}`);
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // 2. Parsear y validar el payload recibido
        const body = await request.json();
        const validated = webhookPayloadSchema.parse(body);

        // 3. Conectar a Base de Datos local (MongoDB)
        await connectDB();

        // 4. Buscar si la tarea ya existe localmente
        let task = await Task.findOne({ odooTaskId: validated.odooTaskId });

        if (task) {
            // Caso A: La tarea ya existe, actualizamos sus campos
            task.title = validated.title;
            if (validated.description !== undefined) task.description = validated.description;
            if (validated.status) task.status = validated.status as TaskStatus;
            if (validated.projectId) task.projectId = validated.projectId;

            await task.save();
            console.log(`🔄 Tarea local actualizada desde Odoo (ID Odoo: ${validated.odooTaskId})`);
        } else {
            // Caso B: Es una tarea creada en Odoo primero, la insertamos localmente
            task = await Task.create({
                title: validated.title,
                description: validated.description || '',
                status: (validated.status as TaskStatus) || TaskStatus.TODO,
                odooTaskId: validated.odooTaskId,
                projectId: validated.projectId,
            });
            console.log(`✨ Nueva tarea creada localmente desde Odoo (ID Odoo: ${validated.odooTaskId})`);
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Webhook procesado y sincronizado con éxito',
                task: {
                    id: task._id.toString(),
                    title: task.title,
                    odooTaskId: task.odooTaskId,
                    status: task.status,
                },
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('❌ Error al procesar Webhook de Odoo:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Formato de payload inválido', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: 'Error interno al procesar el webhook' }, { status: 500 });
    }
}
