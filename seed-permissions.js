const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./models');

async function seedPermissions() {
    try {
        await db.sequelize.authenticate();
        console.log('Database connection established.');

        const roles = {
            admin: { key: 'administrator', label: 'Administrator' },
            tech: { key: 'technician', label: 'Technician' },
            user: { key: 'user', label: 'User' }
        };

        // Ensure Roles Exist
        const adminRole = await db.Role.findOrCreate({ where: { key: roles.admin.key }, defaults: roles.admin });
        const techRole = await db.Role.findOrCreate({ where: { key: roles.tech.key }, defaults: roles.tech });
        const userRole = await db.Role.findOrCreate({ where: { key: roles.user.key }, defaults: roles.user });

        console.log('Roles verified.');

        const permissions = [
            { key: 'view_dashboard', name: 'Dashboard' },
            { key: 'manage_inventory', name: 'Inventory Management' },
            { key: 'manage_devices', name: 'Device Management' },
            { key: 'manage_orders', name: 'Order Management' },
            { key: 'manage_transactions', name: 'Transaction Management' },
            { key: 'view_analytics', name: 'AQI Data Analytics' },
            { key: 'view_notifications', name: 'Notifications & Alerts' },
            { key: 'manage_staff', name: 'Staff Management' },
            { key: 'manage_rbac', name: 'Access Control' },
            { key: 'manage_deployments', name: 'Deployments' },
            { key: 'manage_maintenance', name: 'Ticket Management' },
            { key: 'view_sla', name: 'SLA Tracking and Performance' },
            { key: 'view_logs', name: 'Customer Activity Logs' }
        ];

        const permInstances = [];
        for (const p of permissions) {
            const [perm] = await db.Permission.findOrCreate({ where: { key: p.key }, defaults: p });
            permInstances.push(perm);
        }
        console.log('Permissions verified.');

        // Assign ALL to Admin
        await adminRole[0].addPermissions(permInstances);
        console.log('Assigned all permissions to Administrator.');

        // Assign specific to Technician
        const techPerms = permInstances.filter(p =>
            ['view_dashboard', 'manage_maintenance', 'manage_deployments', 'view_notifications'].includes(p.key)
        );
        await techRole[0].addPermissions(techPerms);
        console.log('Assigned permissions to Technician.');

        console.log('Seeding permissions completed.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

seedPermissions();
