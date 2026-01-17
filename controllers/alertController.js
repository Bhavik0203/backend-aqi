const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { io } = require('../server');
const firebaseAdmin = require('../config/firebase');

// FCM: Send to 'alerts' topic AND the specific test token (for demo purposes)
const sendFCMAlertNotification = async (alert, action = 'create') => {
  const payload = {
    notification: {
      title: `Alert ${action}: ${alert.alert_category}`,
      body: alert.alert_description || `Alert status: ${alert.alert_status}`,
    },
    data: {
      id: alert.id ? String(alert.id) : '',
      kit_id: alert.kit_id ? String(alert.kit_id) : '',
      alert_status: alert.alert_status || '',
      alert_category: alert.alert_category || '',
    },
  };

  // The specific token from your test (HARDCODED FOR DEMO)
  // In production, you would fetch the user's token from the database
  const TEST_TOKEN = 'dVl3zUSoBu5h0kq9tYDuPe:APA91bEQ2A3yCUyk8vDNcFxGFRuDM9hk6AA_U_8Gp-SPMf5YsG3la1avEA6gw65rCEi9jSye8IxY-KJGi3F_Z_nASRCR9dFG3k03YV4T4v_-3j46N8e948U';

  try {
    // 1. Send to Topic (Standard way for broadcasts)
    await firebaseAdmin.messaging().send({
      topic: 'alerts',
      ...payload
    });
    console.log(`✅ FCM sent to topic 'alerts'`);

    // 2. Send to your specific Test Token (So you see it now)
    await firebaseAdmin.messaging().send({
      token: TEST_TOKEN,
      ...payload
    });
    console.log(`✅ FCM sent to test token`);

  } catch (e) {
    console.error('❌ FCM send error:', e.message);
  }
};

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

exports.getAlertsByPublicUser = asyncHandler(async (req, res) => {
  const { id } = req.params; // User ID from route

  // 1. Fetch Orders placed by this user to get their Kit IDs
  const orders = await db.Order.findAll({
    where: { ordered_by_user_id: id },
    attributes: ['kit_id']
  });

  const userKitIds = orders.map(o => o.kit_id).filter(id => id);

  if (userKitIds.length === 0) {
    return res.json({ success: true, data: [] });
  }

  // 2. Fetch Alerts associated with these Kits
  const alerts = await db.Alert.findAll({
    where: {
      kit_id: { [db.Sequelize.Op.in]: userKitIds }
    },
    include: [{ model: db.Kit, as: 'kit' }],
    order: [['created_at', 'DESC']]
  });

  res.json({ success: true, data: alerts });
});

exports.getAlertsByTechnician = asyncHandler(async (req, res) => {
  const { id } = req.params; // Technician ID

  // 1. Fetch Tickets assigned to this technician to get relevant Kit IDs
  const tickets = await db.Ticket.findAll({
    where: { assigned_technician_id: id },
    attributes: ['kit_id']
  });

  const techKitIds = tickets.map(t => t.kit_id).filter(Boolean);

  if (techKitIds.length === 0) {
    return res.json({ success: true, data: [] });
  }

  // 2. Fetch Alerts for those Kits
  const alerts = await db.Alert.findAll({
    where: {
      kit_id: { [db.Sequelize.Op.in]: techKitIds }
    },
    include: [{ model: db.Kit, as: 'kit' }],
    order: [['created_at', 'DESC']]
  });

  res.json({ success: true, data: alerts });
});

exports.getAlertById = asyncHandler(async (req, res) => {
  const alert = await db.Alert.findByPk(req.params.id, {
    include: [{ model: db.Kit, as: 'kit' }]
  });
  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }
  res.json({ success: true, data: alert });
});

exports.createAlert = asyncHandler(async (req, res) => {
  const alert = await db.Alert.create(req.body);
  // Socket.IO emit
  if (io) io.emit('alert:new', alert);
  // FCM push
  sendFCMAlertNotification(alert, 'created');
  res.status(201).json({ success: true, data: alert });
});

exports.updateAlert = asyncHandler(async (req, res) => {
  const alert = await db.Alert.findByPk(req.params.id);
  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }
  await alert.update(req.body);
  // Socket.IO emit
  if (io) io.emit('alert:updated', alert);
  // FCM push
  sendFCMAlertNotification(alert, 'updated');
  res.json({ success: true, data: alert });
});

exports.resolveAlert = asyncHandler(async (req, res) => {
  const alert = await db.Alert.findByPk(req.params.id);
  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }
  await alert.update({ alert_status: 'resolved' });
  // Socket.IO emit
  if (io) io.emit('alert:resolved', alert);
  // FCM push
  sendFCMAlertNotification(alert, 'resolved');
  res.json({ success: true, data: alert });
});

exports.deleteAlert = asyncHandler(async (req, res) => {
  const alert = await db.Alert.findByPk(req.params.id);
  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }
  await alert.destroy();
  res.json({ success: true, message: 'Alert deleted successfully' });
});

