const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

// Get all alerts
exports.getAllAlerts = asyncHandler(async (req, res) => {
  const { status, category, kit_id } = req.query;
  const where = {};
  if (status) where.alert_status = status;
  if (category) where.alert_category = category;
  if (kit_id) where.kit_id = kit_id;

  const alerts = await db.Alert.findAll({
    where,
    include: [{ model: db.Kit, as: 'kit' }],
    order: [['created_at', 'DESC']]
  });
  res.json({ success: true, data: alerts });
});

// Get alert by ID
exports.getAlertById = asyncHandler(async (req, res) => {
  const alert = await db.Alert.findByPk(req.params.id, {
    include: [{ model: db.Kit, as: 'kit' }]
  });
  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }
  res.json({ success: true, data: alert });
});

// Create new alert
exports.createAlert = asyncHandler(async (req, res) => {
  const alert = await db.Alert.create(req.body);
  res.status(201).json({ success: true, data: alert });
});

// Update alert
exports.updateAlert = asyncHandler(async (req, res) => {
  const alert = await db.Alert.findByPk(req.params.id);
  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }
  await alert.update(req.body);
  res.json({ success: true, data: alert });
});

// Resolve alert
exports.resolveAlert = asyncHandler(async (req, res) => {
  const alert = await db.Alert.findByPk(req.params.id);
  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }
  await alert.update({ alert_status: 'resolved' });
  res.json({ success: true, data: alert });
});

// Delete alert
exports.deleteAlert = asyncHandler(async (req, res) => {
  const alert = await db.Alert.findByPk(req.params.id);
  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }
  await alert.destroy();
  res.json({ success: true, message: 'Alert deleted successfully' });
});

