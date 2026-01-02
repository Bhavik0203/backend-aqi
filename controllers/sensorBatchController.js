const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

// Get all sensor batches
exports.getAllBatches = asyncHandler(async (req, res) => {
  const batches = await db.SensorBatch.findAll({
    include: [{ model: db.SensorBatchItem, as: 'items' }]
  });
  res.json({ success: true, data: batches });
});

// Get batch by ID
exports.getBatchById = asyncHandler(async (req, res) => {
  const batch = await db.SensorBatch.findByPk(req.params.id, {
    include: [{ model: db.SensorBatchItem, as: 'items' }]
  });
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }
  res.json({ success: true, data: batch });
});

// Create new batch
exports.createBatch = asyncHandler(async (req, res) => {
  const batch = await db.SensorBatch.create(req.body);
  res.status(201).json({ success: true, data: batch });
});

// Update batch
exports.updateBatch = asyncHandler(async (req, res) => {
  const batch = await db.SensorBatch.findByPk(req.params.id);
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }
  await batch.update(req.body);
  res.json({ success: true, data: batch });
});

// Delete batch
exports.deleteBatch = asyncHandler(async (req, res) => {
  const batch = await db.SensorBatch.findByPk(req.params.id);
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }
  await batch.destroy();
  res.json({ success: true, message: 'Batch deleted successfully' });
});

// Add items to batch
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

