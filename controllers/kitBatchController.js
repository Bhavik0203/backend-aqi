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

  // Trigger Alert
  await db.Alert.create({
    alert_category: 'inventory',
    alert_description: `New Kit Batch created: ${batch.batch_number || batch.id}`,
    alert_status: 'open',
    kit_id: null
  });

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

exports.addKitsToBatch = asyncHandler(async (req, res) => {
  const { kits } = req.body;
  const batch = await db.KitBatch.findByPk(req.params.id);
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }

  const createdKits = await db.Kit.bulkCreate(
    kits.map(kit => ({ ...kit, kit_batch_id: req.params.id }))
  );
  res.status(201).json({ success: true, data: createdKits });
});

