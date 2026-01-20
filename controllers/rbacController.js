const db = require('../models');
const { Role, Permission, RolePermission } = db;
const firebaseAdmin = require('../config/firebase');

// FCM Helper
const sendFCMRbacNotification = async (title, body) => {
    const payload = {
        notification: { title, body },
        data: { type: 'admin_alert' }
    };
    const TEST_TOKEN = 'dVl3zUSoBu5h0kq9tYDuPe:APA91bEQ2A3yCUyk8vDNcFxGFRuDM9hk6AA_U_8Gp-SPMf5YsG3la1avEA6gw65rCEi9jSye8IxY-KJGi3F_Z_nASRCR9dFG3k03YV4T4v_-3j46N8e948U';
    try {
        await firebaseAdmin.messaging().send({ topic: 'admin', ...payload });
        await firebaseAdmin.messaging().send({ token: TEST_TOKEN, ...payload });
        console.log(`✅ FCM RBAC Notification sent: ${title}`);
    } catch (e) {
        console.error('❌ FCM RBAC Notification failed:', e.message);
    }
};

// Fetch full RBAC Matrix
exports.getRbacMatrix = async (req, res) => {
    try {
        const roles = await Role.findAll({
            order: [['id', 'ASC']]
        });
        const permissions = await Permission.findAll({
            include: [{
                model: Role,
                as: 'roles',
                through: { attributes: [] } // Hide junction table attributes if not needed
            }],
            order: [['id', 'ASC']]
        });

        // Format for frontend
        // Frontend expects: permissions array where each perm has boolean flags for roles
        const formattedPermissions = permissions.map(perm => {
            const roleMap = {};
            perm.roles.forEach(r => {
                roleMap[r.key] = true;
            });

            // Ensure all roles have a key, default false
            roles.forEach(r => {
                if (!roleMap[r.key]) roleMap[r.key] = false;
            });

            return {
                id: perm.id,
                name: perm.name,
                key: perm.key,
                ...roleMap
            };
        });

        res.json({
            success: true,
            data: {
                roles: roles.map(r => ({ key: r.key, label: r.label, id: r.id })), // Minimal role data
                permissions: formattedPermissions
            }
        });
    } catch (error) {
        console.error('Error fetching RBAC matrix:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Create Role
exports.createRole = async (req, res) => {
    try {
        const { key, label } = req.body;
        if (!key || !label) {
            return res.status(400).json({ success: false, message: 'Key and Label are required' });
        }

        const existing = await Role.findOne({ where: { key } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Role key already exists' });
        }

        const role = await Role.create({ key, label });

        // Alert & Notify
        try {
            await db.Alert.create({
                alert_category: 'user',
                alert_description: `New Role Created: ${label} (${key})`,
                alert_status: 'open',
                kit_id: null
            });
            sendFCMRbacNotification('New Role Created', `Role ${label} added to system.`);
        } catch (e) { console.error(e); }

        res.json({ success: true, data: role });
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Update Role
exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { label } = req.body; // Key usually shouldn't change easily

        const role = await Role.findByPk(id);
        if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

        role.label = label || role.label;
        await role.save();

        res.json({ success: true, data: role });

        // Alert & Notify
        try {
            await db.Alert.create({
                alert_category: 'user',
                alert_description: `Role Updated: ${role.label}`,
                alert_status: 'open',
                kit_id: null
            });
            sendFCMRbacNotification('Role Updated', `Role ${role.label} updated.`);
        } catch (e) { console.error(e); }
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}

// Delete Role
exports.deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        // Prevent deleting critical roles if necessary, e.g. admin
        const role = await Role.findByPk(id);
        if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

        if (role.key === 'admin') {
            return res.status(403).json({ success: false, message: 'Cannot delete admin role' });
        }

        await role.destroy();
        res.json({ success: true, message: 'Role deleted' });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}

// Create Permission (Function)
exports.createPermission = async (req, res) => {
    try {
        const { key, name } = req.body;
        if (!key || !name) {
            return res.status(400).json({ success: false, message: 'Key and Name are required' });
        }

        const existing = await Permission.findOne({ where: { key } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Permission key already exists' });
        }

        const permission = await Permission.create({ key, name });
        res.json({ success: true, data: permission });
    } catch (error) {
        console.error('Error creating permission:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Update Permission
exports.updatePermission = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const permission = await Permission.findByPk(id);
        if (!permission) return res.status(404).json({ success: false, message: 'Permission not found' });

        permission.name = name || permission.name;
        await permission.save();

        res.json({ success: true, data: permission });
    } catch (error) {
        console.error('Error updating permission:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}

// Delete Permission
exports.deletePermission = async (req, res) => {
    try {
        const { id } = req.params;
        const permission = await Permission.findByPk(id);

        if (!permission) {
            return res.status(404).json({ success: false, message: 'Permission not found' });
        }

        await permission.destroy();
        res.json({ success: true, message: 'Permission deleted successfully' });
    } catch (error) {
        console.error('Error deleting permission:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}

// Toggle Permission for Role
exports.toggleRolePermission = async (req, res) => {
    try {
        const { roleKey, permissionKey, enabled } = req.body;

        const role = await Role.findOne({ where: { key: roleKey } });
        if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

        const permission = await Permission.findOne({ where: { key: permissionKey } });
        if (!permission) return res.status(404).json({ success: false, message: 'Permission not found' });

        if (enabled) {
            await RolePermission.findOrCreate({
                where: { role_id: role.id, permission_id: permission.id }
            });
        } else {
            await RolePermission.destroy({
                where: { role_id: role.id, permission_id: permission.id }
            });
        }

        res.json({ success: true, message: 'Updated successfully' });

        // Alert & Notify (Summary)
        try {
            await db.Alert.create({
                alert_category: 'user',
                alert_description: `Permission '${permissionKey}' ${enabled ? 'granted to' : 'revoked from'} role '${roleKey}'`,
                alert_status: 'open',
                kit_id: null
            });
            sendFCMRbacNotification('RBAC Update', `Permission ${permissionKey} ${enabled ? 'enabled' : 'disabled'} for ${roleKey}`);
        } catch (e) { console.error(e); }
    } catch (error) {
        console.error('Error toggling permission:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Start Sync (Bulk save)
exports.syncRbac = async (req, res) => {
    // Expects { permissions: [ { id, roles: { admin: true, user: false... } } ] } or similar
    // This example assumes one-by-one toggle usage from frontend is easier or full sync.
    // Implementing full "save" payload handler if frontend sends full matrix.
    try {
        const { permissions, roles } = req.body;
        // Loop through permissions and roles to set/unset
        // Simplest strategy: Delete all RolePermissions and recreate them? 
        // No, that's risky. Better to upsert based on valid keys.

        // This is complex to implement generically without exact payload structure.
        // Assuming frontend calls this with the state `permissions` array

        // 1. Get all roles mapping: key -> id
        const dbRoles = await Role.findAll();
        const roleMap = {};
        dbRoles.forEach(r => roleMap[r.key] = r.id);

        // 2. Iterate permissions
        for (const p of permissions) {
            // Find permission DB ID by p.key or p.id if consistent
            // If p.id is internal frontend ID, use p.name or p.key to find real DB ID.
            // Let's assume p.id is real DB ID.
            for (const r of roles) {
                const isEnabled = p[r.key];
                const roleId = roleMap[r.key];

                if (roleId && p.id) {
                    if (isEnabled) {
                        await RolePermission.findOrCreate({ where: { role_id: roleId, permission_id: p.id } });
                    } else {
                        await RolePermission.destroy({ where: { role_id: roleId, permission_id: p.id } });
                    }
                }
            }
        }
        res.json({ success: true, message: 'Synced successfully' });
    } catch (error) {
        console.error('Error syncing RBAC:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}
exports.toggleAllRolePermissions = async (req, res) => {
    try {
        const { roleKey, enabled } = req.body;

        const role = await Role.findOne({ where: { key: roleKey } });
        if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

        if (enabled) {
            // Get all permissions
            const allPermissions = await Permission.findAll({ attributes: ['id'] });

            // Bulk Create
            const bulkData = allPermissions.map(p => ({
                role_id: role.id,
                permission_id: p.id
            }));

            // Transaction safe upsert or ignore duplicates
            await RolePermission.bulkCreate(bulkData, { ignoreDuplicates: true });
        } else {
            // Delete all for this role
            await RolePermission.destroy({ where: { role_id: role.id } });
        }

        res.json({ success: true, message: `All permissions ${enabled ? 'enabled' : 'disabled'} for role` });
    } catch (error) {
        console.error('Error in bulk toggle:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}
