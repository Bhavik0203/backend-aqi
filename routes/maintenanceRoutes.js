const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');

router.get('/', maintenanceController.getAllSchedules);
router.get('/:id', maintenanceController.getScheduleById);
router.post('/', maintenanceController.createSchedule);
router.put('/:id', maintenanceController.updateSchedule);
router.delete('/:id', maintenanceController.deleteSchedule);

module.exports = router;

