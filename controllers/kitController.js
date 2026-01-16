const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const firebaseAdmin = require('../config/firebase');

// FCM Helper
const sendFCMKitNotification = async (kit, title, body) => {
  const payload = {
    notification: { title, body },
    data: {
      kit_id: kit.id ? String(kit.id) : '',
      status: kit.kit_status || '',
      type: 'inventory_alert'
    }
  };
  const TEST_TOKEN = 'dVl3zUSoBu5h0kq9tYDuPe:APA91bEQ2A3yCUyk8vDNcFxGFRuDM9hk6AA_U_8Gp-SPMf5YsG3la1avEA6gw65rCEi9jSye8IxY-KJGi3F_Z_nASRCR9dFG3k03YV4T4v_-3j46N8e948U';
  try {
    await firebaseAdmin.messaging().send({ topic: 'inventory', ...payload });
    await firebaseAdmin.messaging().send({ token: TEST_TOKEN, ...payload });
    console.log(`✅ FCM Kit Notification sent: ${title}`);
  } catch (e) {
    console.error('❌ FCM Kit Notification failed:', e.message);
  }
};

exports.getAllKits = asyncHandler(async (req, res) => {
  const { status, batch_id } = req.query;
  const where = {};
  if (status) where.kit_status = status;
  if (batch_id) where.kit_batch_id = batch_id;

  const kits = await db.Kit.findAll({
    where,
    include: [
      { model: db.KitBatch, as: 'batch' },
      { model: db.Order, as: 'orders' },
      { model: db.Deployment, as: 'deployments' }
    ]
  });
  res.json({ success: true, data: kits });
});

exports.getKitsSimple = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const where = {};
  if (status) where.kit_status = status;

  const kits = await db.Kit.findAll({
    where,
    order: [['id', 'DESC']]
  });
  res.json({ success: true, data: kits });
});

exports.getKitList = asyncHandler(async (req, res) => {
  const kits = await db.Kit.findAll({
    attributes: ['id', 'kit_batch_id', 'kit_serial_number', 'kit_status'],
    order: [['id', 'DESC']]
  });
  res.json({ success: true, data: kits });
});

exports.getKitById = asyncHandler(async (req, res) => {
  const kit = await db.Kit.findByPk(req.params.id, {
    include: [
      { model: db.KitBatch, as: 'batch' },
      { model: db.Order, as: 'orders' },
      { model: db.Deployment, as: 'deployments' },
      { model: db.AQIReading, as: 'readings', limit: 10, order: [['recorded_at', 'DESC']] }
    ]
  });
  if (!kit) {
    return res.status(404).json({ success: false, message: 'Kit not found' });
  }
  res.json({ success: true, data: kit });
});

exports.createKit = asyncHandler(async (req, res) => {
  const kit = await db.Kit.create(req.body);

  // Trigger Alert
  try {
    await db.Alert.create({
      alert_category: 'inventory',
      alert_description: `New Kit Created: ${kit.kit_label || kit.kit_uid || kit.id}. Status: ${kit.kit_status}`,
      alert_status: 'open',
      kit_id: kit.id
    });
    // Send Notification
    sendFCMKitNotification(kit, 'New Kit Added', `Kit ${kit.kit_uid || kit.id} added. Status: ${kit.kit_status}`);
  } catch (err) {
    console.error('Failed to create alert for new kit:', err.message);
  }

  res.status(201).json({ success: true, data: kit });
});

exports.updateKit = asyncHandler(async (req, res) => {
  const kit = await db.Kit.findByPk(req.params.id);
  if (!kit) {
    return res.status(404).json({ success: false, message: 'Kit not found' });
  }
  await kit.update(req.body);

  // Trigger Alert
  try {
    await db.Alert.create({
      alert_category: 'inventory', // or 'maintenance' if status changed to maintenance? Keeping simple.
      alert_description: `Kit Updated: ${kit.kit_label || kit.kit_uid || kit.id}. Status: ${kit.kit_status}`,
      alert_status: 'open',
      kit_id: kit.id
    });
    // Send Notification
    sendFCMKitNotification(kit, 'Kit Updated', `Kit ${kit.kit_uid || kit.id} status updated to ${kit.kit_status}`);
  } catch (err) {
    console.error('Failed to create alert for kit update:', err.message);
  }

  res.json({ success: true, data: kit });
});

exports.deleteKit = asyncHandler(async (req, res) => {
  const kit = await db.Kit.findByPk(req.params.id);
  if (!kit) {
    return res.status(404).json({ success: false, message: 'Kit not found' });
  }
  await kit.destroy();
  res.json({ success: true, message: 'Kit deleted successfully' });
});

