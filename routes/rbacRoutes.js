const express = require('express');
const router = express.Router();
const rbacController = require('../controllers/rbacController');

// Retrieve the full matrix
router.get('/matrix', rbacController.getRbacMatrix);

// Role management
router.post('/roles', rbacController.createRole);
router.put('/roles/:id', rbacController.updateRole);
router.delete('/roles/:id', rbacController.deleteRole);

// Permission (Function) management
router.post('/permissions', rbacController.createPermission);
router.put('/permissions/:id', rbacController.updatePermission);
// router.delete('/permissions/:id', rbacController.deletePermission);

// Matrix updates
router.post('/toggle', rbacController.toggleRolePermission);
router.post('/toggle-all', rbacController.toggleAllRolePermissions);
router.post('/sync', rbacController.syncRbac);

module.exports = router;
