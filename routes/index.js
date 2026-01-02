const express = require('express');
const router = express.Router();

// Import all route modules
const userProfileRoutes = require('./userProfileRoutes');
const sensorBatchRoutes = require('./sensorBatchRoutes');
const kitBatchRoutes = require('./kitBatchRoutes');
const kitRoutes = require('./kitRoutes');
const orderRoutes = require('./orderRoutes');
const deploymentRoutes = require('./deploymentRoutes');
const ticketRoutes = require('./ticketRoutes');
const aqiReadingRoutes = require('./aqiReadingRoutes');
const alertRoutes = require('./alertRoutes');
const maintenanceRoutes = require('./maintenanceRoutes');
const deviceHealthRoutes = require('./deviceHealthRoutes');
const technicianRoutes = require('./technicianRoutes');
const reportRoutes = require('./reportRoutes');

// Mount routes
router.use('/user-profiles', userProfileRoutes);
router.use('/sensor-batches', sensorBatchRoutes);
router.use('/kit-batches', kitBatchRoutes);
router.use('/kits', kitRoutes);
router.use('/orders', orderRoutes);
router.use('/deployments', deploymentRoutes);
router.use('/tickets', ticketRoutes);
router.use('/aqi-readings', aqiReadingRoutes);
router.use('/alerts', alertRoutes);
router.use('/maintenance-schedules', maintenanceRoutes);
router.use('/device-health', deviceHealthRoutes);
router.use('/technicians', technicianRoutes);
router.use('/reports', reportRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

module.exports = router;

