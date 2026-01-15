const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const firebaseAdmin = require('../config/firebase');

// FCM Notification Helper
const sendFCMSensorBatchNotification = async (batch, title, body) => {
  const payload = {
    notification: { title, body },
    data: {
      batch_id: batch.id ? String(batch.id) : '',
      batch_code: batch.sensor_batch_code || '',
      type: 'inventory_alert'
    }
  };

  // Specific token for testing
  const TEST_TOKEN = 'dVl3zUSoBu5h0kq9tYDuPe:APA91bEQ2A3yCUyk8vDNcFxGFRuDM9hk6AA_U_8Gp-SPMf5YsG3la1avEA6gw65rCEi9jSye8IxY-KJGi3F_Z_nASRCR9dFG3k03YV4T4v_-3j46N8e948U';

  try {
    await firebaseAdmin.messaging().send({ topic: 'inventory', ...payload });
    await firebaseAdmin.messaging().send({ token: TEST_TOKEN, ...payload });
    console.log(`✅ FCM Inventory Notification sent: ${title}`);
  } catch (e) {
    console.error('❌ FCM Inventory Notification failed:', e.message);
  }
};

exports.getAllBatches = asyncHandler(async (req, res) => {
  const batches = await db.SensorBatch.findAll({
    include: [{ model: db.SensorBatchItem, as: 'items' }]
  });
  res.json({ success: true, data: batches });
});

exports.getBatchById = asyncHandler(async (req, res) => {
  const batch = await db.SensorBatch.findByPk(req.params.id, {
    include: [{ model: db.SensorBatchItem, as: 'items' }]
  });
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }
  res.json({ success: true, data: batch });
});

exports.createBatch = asyncHandler(async (req, res) => {
  const { sensor_batch_code } = req.body;

  // Check for duplicate Batch ID
  const existingBatch = await db.SensorBatch.findOne({ where: { sensor_batch_code } });
  if (existingBatch) {
    return res.status(409).json({
      success: false,
      message: `Batch ID '${sensor_batch_code}' already exists. Please use a unique Batch ID.`
    });
  }

  const batch = await db.SensorBatch.create(req.body);

  // Create Alert (Uncommented and fixed)
  try {
    await db.Alert.create({
      alert_category: 'inventory',
      alert_description: `New Sensor Batch created: ${batch.sensor_batch_code || batch.id}`,
      alert_status: 'open',
      kit_id: null // Ensure your DB allows null here
    });

    // Send Notification
    sendFCMSensorBatchNotification(batch, 'Inventory Update', `New Sensor Batch ${batch.sensor_batch_code} has been added.`);
  } catch (alertErr) {
    console.error("Failed to create alert/notification for new sensor batch:", alertErr.message);
  }

  res.status(201).json({ success: true, data: batch });
});

exports.updateBatch = asyncHandler(async (req, res) => {
  const batch = await db.SensorBatch.findByPk(req.params.id);
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }
  await batch.update(req.body);
  res.json({ success: true, data: batch });
});

exports.deleteBatch = asyncHandler(async (req, res) => {
  const batch = await db.SensorBatch.findByPk(req.params.id);
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }
  await batch.destroy();
  res.json({ success: true, message: 'Batch deleted successfully' });
});

exports.addItemsToBatch = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const batch = await db.SensorBatch.findByPk(req.params.id);
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }

  const createdItems = await db.SensorBatchItem.bulkCreate(
    items.map(item => ({ ...item, sensor_batch_id: req.params.id }))
  );
  res.status(201).json({ success: true, data: createdItems });
});

