const express = require('express');
const router = express.Router();
const deploymentController = require('../controllers/deploymentController');

router.get('/', deploymentController.getAllDeployments);
router.get('/:id', deploymentController.getDeploymentById);
router.post('/', deploymentController.createDeployment);
router.put('/:id', deploymentController.updateDeployment);
router.delete('/:id', deploymentController.deleteDeployment);

module.exports = router;

