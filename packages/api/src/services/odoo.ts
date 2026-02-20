/**
 * Odoo JSON-RPC Service
 */
export class OdooService {
    private url: string;
    private db: string;
    private adminUid?: number;
    private adminPassword?: string;

    constructor(url: string, db: string, adminUid?: number, adminPassword?: string) {
        this.url = url.endsWith('/') ? url.slice(0, -1) : url;
        this.db = db;
        this.adminUid = adminUid;
        this.adminPassword = adminPassword;
    }

    /**
     * Authenticate with Odoo
     */
    async authenticate(login: string, password: string): Promise<{
        uid: number;
        name: string;
        username: string;
        email: string;
        company_id: number;
        isAdmin: boolean;
    } | null> {
        try {
            const response = await fetch(`${this.url}/jsonrpc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'call',
                    params: {
                        service: 'common',
                        method: 'login',
                        args: [this.db, login, password],
                    },
                    id: Math.floor(Math.random() * 1000000000),
                }),
            });

            const data = await response.json();
            console.log('--- ODOO AUTH RESPONSE ---');
            console.log('Result:', data.result);
            if (data.error) console.log('Error:', JSON.stringify(data.error));

            if (data.error) {
                console.error('Odoo authentication error:', data.error);
                return null;
            }

            const uid = data.result;

            if (!uid) {
                return null;
            }

            // Get user info and determine if they are an admin in Odoo
            const userInfo = await this.read('res.users', [uid], ['name', 'login', 'email', 'company_id', 'groups_id'], password, uid);

            if (!userInfo || userInfo.length === 0) {
                return null;
            }

            // Check if user belongs to administrative groups in Odoo
            // We'll look for 'base.group_erp_manager' or 'base.group_system'
            let isOdooAdmin = false;
            try {
                const adminGroupNames = ['base.group_erp_manager', 'base.group_system'];
                const groupIds = await this.executeKeyword(
                    'ir.model.data',
                    'search_read',
                    [[['model', '=', 'res.groups'], ['name', 'in', adminGroupNames]]],
                    { fields: ['res_id'] },
                    password,
                    uid
                );

                const adminResIds = groupIds.map((g: any) => g.res_id);
                const userGroups = userInfo[0].groups_id || [];
                isOdooAdmin = userGroups.some((gid: number) => adminResIds.includes(gid));
            } catch (e) {
                console.warn('Could not determine Odoo admin status, defaulting to false:', e);
            }

            return {
                uid: uid,
                name: userInfo[0].name,
                username: userInfo[0].login,
                email: userInfo[0].email || `${userInfo[0].login}@odoo.local`, // Fallback email
                company_id: Array.isArray(userInfo[0].company_id) ? userInfo[0].company_id[0] : userInfo[0].company_id,
                isAdmin: isOdooAdmin,
            };
        } catch (error) {
            console.error('Odoo connection error:', error);
            return null;
        }
    }

    /**
     * Generic Odoo Read
     */
    async read(model: string, ids: number[], fields: string[], password: string, uid: number): Promise<any[]> {
        return this.executeKeyword(model, 'read', [ids, fields], {}, password, uid);
    }

    /**
     * Execute keyword on Odoo model
     */
    async executeKeyword(
        model: string,
        method: string,
        args: any[] = [],
        kwargs: any = {},
        password?: string,
        uid?: number
    ): Promise<any> {
        // If uid or password not provided, we might need to authenticate first or use provided ones
        // In many cases we'll pass them from the session/config

        try {
            const response = await fetch(`${this.url}/jsonrpc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'call',
                    params: {
                        service: 'object',
                        method: 'execute_kw',
                        args: [this.db, uid, password, model, method, args, kwargs],
                    },
                    id: Math.floor(Math.random() * 1000000000),
                }),
            });

            const data = await response.json();

            if (data.error) {
                console.error(`Odoo execute_kw error (${model}.${method}):`, data.error);
                throw new Error(data.error.message || 'Odoo execution failed');
            }

            return data.result;
        } catch (error) {
            console.error('Odoo connection error:', error);
            throw error;
        }
    }

    /**
     * Create a new user in Odoo
     */
    async createUser(name: string, login: string, password: string): Promise<number> {
        if (!this.adminUid || !this.adminPassword) {
            throw new Error('Odoo Admin credentials missing for user creation');
        }

        // 1. Create the user record
        // By default, we try to make them portal users if possible
        // We might need to find the portal group ID first or just use common defaults
        const userId = await this.executeKeyword(
            'res.users',
            'create',
            [{
                name: name,
                login: login,
                email: login,
                password: password,
                // In many Odoo installations, new users should be in group_portal
                // This part might vary, but let's try a standard approach
                groups_id: [[6, 0, []]] // We can refine this if we know the portal group XML ID
            }],
            {},
            this.adminPassword,
            this.adminUid
        );

        // 2. Try to assign portal group by XML ID if we can
        try {
            const groupData = await this.executeKeyword(
                'ir.model.data',
                'search_read',
                [[['module', '=', 'base'], ['name', '=', 'group_portal']]],
                { fields: ['res_id'] },
                this.adminPassword,
                this.adminUid
            );

            const portalGroupId = groupData.length > 0 ? groupData[0].res_id : null;

            if (portalGroupId) {
                await this.executeKeyword(
                    'res.users',
                    'write',
                    [
                        [userId],
                        {
                            groups_id: [[4, portalGroupId]]
                        }
                    ],
                    {},
                    this.adminPassword,
                    this.adminUid
                );
            }
        } catch (e) {
            console.warn('Failed to assign portal group to new Odoo user, they might have default groups:', e);
        }

        return userId;
    }

    /**
     * Update user password in Odoo
     */
    async updatePassword(uid: number, newPassword: string): Promise<boolean> {
        if (!this.adminUid || !this.adminPassword) {
            throw new Error('Odoo Admin credentials missing for password update');
        }

        return await this.executeKeyword(
            'res.users',
            'write',
            [
                [uid],
                {
                    password: newPassword
                }
            ],
            {},
            this.adminPassword,
            this.adminUid
        );
    }
}

/**
 * Singleton instance factory
 */
export function createOdooService(url?: string, db?: string): OdooService {
    const odooUrl = url || process.env.ODOO_URL || '';
    const odooDb = db || process.env.ODOO_DB || '';
    const odooAdminUid = parseInt(process.env.ODOO_ADMIN_UID || '2');
    const odooAdminPassword = process.env.ODOO_ADMIN_PASSWORD || '';

    if (!odooUrl || !odooDb) {
        throw new Error('Odoo configuration missing (ODOO_URL or ODOO_DB)');
    }

    return new OdooService(odooUrl, odooDb, odooAdminUid, odooAdminPassword);
}
