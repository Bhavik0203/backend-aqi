const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

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
  res.status(201).json({ success: true, data: kit });
});

exports.updateKit = asyncHandler(async (req, res) => {
  const kit = await db.Kit.findByPk(req.params.id);
  if (!kit) {
    return res.status(404).json({ success: false, message: 'Kit not found' });
  }
  await kit.update(req.body);
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

