const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technicianController');

router.get('/', technicianController.getAllTechnicians);
router.get('/:id', technicianController.getTechnicianById);
router.put('/:id/availability', technicianController.updateAvailability);
router.delete('/:id', technicianController.deleteTechnician);

module.exports = router;

