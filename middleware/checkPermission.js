const db = require('../models');
const { UserProfile, Role, Permission } = db;

module.exports = (requiredPermissionKey) => {
    return async (req, res, next) => {
        try {
            // Assuming req.user contains the authenticated user's ID or email
            // detailed auth implementation varies, but let's assume req.user.id matches user_id in UserProfile
            // or req.user is the UserProfile itself.

            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Fetch fresh user profile with Role and Permissions
            const profile = await UserProfile.findOne({
                where: { email: user.email }, // Reliable lookup if email is in token
                include: [{
                    model: Role,
                    as: 'roleData', // Updated alias
                    include: [{
                        model: Permission,
                        as: 'permissions'
                    }]
                }]
            });

            if (!profile) {
                return res.status(403).json({ message: 'User profile not found' });
            }

            if (!profile.roleData) {
                // Fallback for legacy users without role_id?
                // Optional: if (profile.role === 'admin') return next(); 
                return res.status(403).json({ message: 'Role not assigned' });
            }

            // Special Case: Super Admin (keys should be consistent)
            if (profile.roleData.key === 'admin' || profile.roleData.key === 'super_admin') {
                return next();
            }

            const hasPermission = profile.roleData.permissions.some(p => p.key === requiredPermissionKey);

            if (!hasPermission) {
                return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
            }

            next();
        } catch (error) {
            console.error('RBAC Middleware Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
};
