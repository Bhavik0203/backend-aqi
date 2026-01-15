const express = require('express');
const router = express.Router();
const slaController = require('../controllers/slaController');

// SLA Tracking
router.get('/tracking', slaController.getAllSlaTracking);
router.get('/tracking/:id', slaController.getSlaTrackingById);
router.post('/tracking', slaController.createSlaTracking);
router.put('/tracking/:id', slaController.updateSlaTracking);
router.delete('/tracking/:id', slaController.deleteSlaTracking);

// SLA Performance
router.get('/performance', slaController.getAllSlaPerformance);
router.get('/performance/:id', slaController.getSlaPerformanceById);
router.post('/performance', slaController.createSlaPerformance);
router.put('/performance/:id', slaController.updateSlaPerformance);
router.delete('/performance/:id', slaController.deleteSlaPerformance);

module.exports = router;

