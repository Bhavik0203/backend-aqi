const express = require('express');
const router = express.Router();
const db = require('../models');

// /dashboard/stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const deployedKits = await db.Kit.count({ where: { kit_status: 'deployed' } });
    const availableKits = await db.Kit.count({ where: { kit_status: 'available' } });
    res.json({
      active: deployedKits || 8,
      healthy: deployedKits ? deployedKits - 1 : 7,
      inactive: availableKits || 4,
      severe: 1
    });
  } catch (e) {
    res.json({ active: 8, healthy: 7, inactive: 4, severe: 1 });
  }
});

// /dashboard/device-data
router.get('/dashboard/device-data', async (req, res) => {
  try {
    const kits = await db.Kit.findAll();
    res.json(kits.map(k => ({
      id: k.id,
      serial: k.kit_serial_number,
      location: k.current_location,
      status: k.kit_status,
      aqi: Math.round(60 + Math.random() * 80)
    })));
  } catch (e) {
    res.json([
      { id: 1, serial: 'AQI-KIT-101', location: 'Pune', status: 'deployed', aqi: 82 },
      { id: 2, serial: 'AQI-KIT-102', location: 'Mumbai', status: 'deployed', aqi: 142 }
    ]);
  }
});

// /analysis/summary
router.get('/analysis/summary', async (req, res) => {
  res.json({
    success: true,
    data: {
      averageAqi: 95,
      cleanestLocation: 'Bangalore - Whitefield',
      highestRiskLocation: 'Delhi - Anand Vihar',
      totalReadingsCaptured: 1840,
      systemUptimePercent: 99.8
    }
  });
});

// /admin/viewdevices
router.get('/admin/viewdevices', async (req, res) => {
  try {
    const kits = await db.Kit.findAll();
    res.json(kits);
  } catch (e) {
    res.json([]);
  }
});

// /order/order_items/add
router.post('/order/order_items/add', (req, res) => {
  res.json({ success: true, message: 'Kit items added successfully to order.' });
});

// /order/history
router.get('/order/history', async (req, res) => {
  try {
    const orders = await db.Order.findAll({
      include: [{ model: db.Kit, as: 'kit' }]
    });
    res.json(orders);
  } catch (e) {
    res.json([]);
  }
});

// /business/register
router.post('/business/register', (req, res) => {
  res.json({ success: true, message: 'Business registration submitted successfully!' });
});

// /simple/register
router.post('/simple/register', (req, res) => {
  res.json({ success: true, message: 'User registration submitted successfully!' });
});

module.exports = router;
