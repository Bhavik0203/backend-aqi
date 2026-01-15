const express = require('express');
const router = express.Router();

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
const rbacRoutes = require('./rbacRoutes');
const transactionRoutes = require('./transactionRoutes');

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
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/sla', require('./slaRoutes'));
router.use('/rbac', rbacRoutes);
router.use('/transactions', transactionRoutes);
router.use('/upload', require('./uploadRoutes'));
router.use('/auth', require('./authRoutes'));


router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

module.exports = router;

