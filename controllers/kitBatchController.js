const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

exports.getAllBatches = asyncHandler(async (req, res) => {
  const batches = await db.KitBatch.findAll({
    include: [{ model: db.Kit, as: 'kits' }]
  });
  res.json({ success: true, data: batches });
});

exports.getBatchById = asyncHandler(async (req, res) => {
  const batch = await db.KitBatch.findByPk(req.params.id, {
    include: [{ model: db.Kit, as: 'kits' }]
  });
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }
  res.json({ success: true, data: batch });
});

exports.createBatch = asyncHandler(async (req, res) => {
  const batch = await db.KitBatch.create(req.body);
  res.status(201).json({ success: true, data: batch });
});

exports.updateBatch = asyncHandler(async (req, res) => {
  const batch = await db.KitBatch.findByPk(req.params.id);
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }
  await batch.update(req.body);
  res.json({ success: true, data: batch });
});

exports.deleteBatch = asyncHandler(async (req, res) => {
  const batch = await db.KitBatch.findByPk(req.params.id);
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }
  await batch.destroy();
  res.json({ success: true, message: 'Batch deleted successfully' });
});

