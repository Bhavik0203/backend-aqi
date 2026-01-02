const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

exports.getAllHealthLogs = asyncHandler(async (req, res) => {
  const { kit_id, status, limit = 100 } = req.query;
  const where = {};
  if (kit_id) where.kit_id = kit_id;
  if (status) where.health_status = status;

  const logs = await db.DeviceHealthLog.findAll({
    where,
    include: [{ model: db.Kit, as: 'kit' }],
    order: [['recorded_at', 'DESC']],
    limit: parseInt(limit)
  });
  res.json({ success: true, data: logs });
});

exports.getLatestHealthStatus = asyncHandler(async (req, res) => {
  const log = await db.DeviceHealthLog.findOne({
    where: { kit_id: req.params.kitId },
    include: [{ model: db.Kit, as: 'kit' }],
    order: [['recorded_at', 'DESC']]
  });
  if (!log) {
    return res.status(404).json({ success: false, message: 'No health logs found for this kit' });
  }
  res.json({ success: true, data: log });
});

exports.createHealthLog = asyncHandler(async (req, res) => {
  const log = await db.DeviceHealthLog.create(req.body);
  res.status(201).json({ success: true, data: log });
});

exports.deleteHealthLog = asyncHandler(async (req, res) => {
  const log = await db.DeviceHealthLog.findByPk(req.params.id);
  if (!log) {
    return res.status(404).json({ success: false, message: 'Health log not found' });
  }
  await log.destroy();
  res.json({ success: true, message: 'Health log deleted successfully' });
});

