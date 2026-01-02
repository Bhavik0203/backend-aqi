const express = require('express');
const router = express.Router();
const deviceHealthController = require('../controllers/deviceHealthController');

router.get('/', deviceHealthController.getAllHealthLogs);
router.get('/kit/:kitId/latest', deviceHealthController.getLatestHealthStatus);
router.post('/', deviceHealthController.createHealthLog);
router.delete('/:id', deviceHealthController.deleteHealthLog);

module.exports = router;

