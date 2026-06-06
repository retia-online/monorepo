import { OdooService } from './client';

/**
 * Creates a project task in Odoo.
 * Returns the Odoo task ID.
 */
export async function createOdooTask(
    odoo: OdooService,
    title: string,
    description: string = '',
    projectId?: number
): Promise<number> {
    const adminUid = parseInt(process.env.ODOO_ADMIN_UID || '2');
    const adminPassword = process.env.ODOO_ADMIN_PASSWORD || '';

    if (!adminPassword) {
        throw new Error('Odoo Admin credentials missing for task creation');
    }

    const taskFields: Record<string, any> = {
        name: title,
        description: description,
    };

    if (projectId) {
        taskFields.project_id = projectId;
    }

    const taskId = await odoo.executeKeyword(
        'project.task',
        'create',
        [taskFields],
        {},
        adminPassword,
        adminUid
    );

    return taskId;
}

/**
 * Updates a project task in Odoo.
 * Returns true if successful.
 */
export async function updateOdooTask(
    odoo: OdooService,
    odooTaskId: number,
    fields: Record<string, any>
): Promise<boolean> {
    const adminUid = parseInt(process.env.ODOO_ADMIN_UID || '2');
    const adminPassword = process.env.ODOO_ADMIN_PASSWORD || '';

    if (!adminPassword) {
        throw new Error('Odoo Admin credentials missing for task update');
    }

    return await odoo.executeKeyword(
        'project.task',
        'write',
        [[odooTaskId], fields],
        {},
        adminPassword,
        adminUid
    );
}

/**
 * Read details of a task from Odoo.
 */
export async function readOdooTask(
    odoo: OdooService,
    odooTaskId: number,
    fields: string[] = ['name', 'description', 'stage_id', 'project_id', 'user_ids']
): Promise<any> {
    const adminUid = parseInt(process.env.ODOO_ADMIN_UID || '2');
    const adminPassword = process.env.ODOO_ADMIN_PASSWORD || '';

    if (!adminPassword) {
        throw new Error('Odoo Admin credentials missing for task read');
    }

    const result = await odoo.read('project.task', [odooTaskId], fields, adminPassword, adminUid);
    return result && result.length > 0 ? result[0] : null;
}
