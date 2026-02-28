#!/usr/bin/env ts-node

/**
 * Script for pre-syncing users from Odoo to local MongoDB
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createOdooService, User, UserRole } from '@megamercado-vzla/api';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env.development') });

async function syncOdooUsers() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI not found in apps/web/.env.development');
    }

    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        console.log('🏢 Connecting to Odoo...');
        const odoo = createOdooService();

        // We use admin credentials to fetch users
        const adminUid = parseInt(process.env.ODOO_ADMIN_UID || '2');
        const adminPassword = process.env.ODOO_ADMIN_PASSWORD || '';

        if (!adminPassword) {
            throw new Error('ODOO_ADMIN_PASSWORD not found in apps/web/.env.development');
        }

        console.log('🔍 Fetching users from Odoo...');
        // Fetch users from Odoo
        const odooUsers = await odoo.executeKeyword(
            'res.users',
            'search_read',
            [[['active', '=', true]]],
            { fields: ['name', 'login', 'email', 'company_id', 'groups_id'] },
            adminPassword,
            adminUid
        );

        console.log(`📊 Found ${odooUsers.length} users in Odoo`);

        // Fetch admin groups from Odoo to map roles
        const adminGroupNames = ['base.group_erp_manager', 'base.group_system'];
        const adminGroups = await odoo.executeKeyword(
            'ir.model.data',
            'search_read',
            [[['model', '=', 'res.groups'], ['name', 'in', adminGroupNames]]],
            { fields: ['res_id'] },
            adminPassword,
            adminUid
        );
        const adminResIds = adminGroups.map((g: any) => g.res_id);

        let syncedCount = 0;
        let createdCount = 0;

        for (const oUser of odooUsers) {
            const email = oUser.email || `${oUser.login}@odoo.local`;
            const isOdooAdmin = (oUser.groups_id || []).some((gid: number) => adminResIds.includes(gid));

            const userData = {
                name: oUser.name,
                email: email,
                role: isOdooAdmin ? UserRole.ADMIN : UserRole.USER,
                approved: true,
                metadata: {
                    odoo_uid: oUser.id,
                    odoo_company_id: Array.isArray(oUser.company_id) ? oUser.company_id[0] : oUser.company_id,
                }
            };

            const existingUser = await User.findOne({
                $or: [
                    { email: email },
                    { 'metadata.odoo_uid': oUser.id }
                ]
            });

            if (existingUser) {
                Object.assign(existingUser, userData);
                await existingUser.save();
                syncedCount++;
            } else {
                await User.create(userData);
                createdCount++;
            }
        }

        console.log(`\n✅ Sync complete!`);
        console.log(`   📝 Updated: ${syncedCount}`);
        console.log(`   🆕 Created: ${createdCount}`);
        console.log(`   👥 Total: ${syncedCount + createdCount}`);

    } catch (error) {
        console.error('❌ Error syncing Odoo users:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Connections closed');
    }
}

syncOdooUsers();
