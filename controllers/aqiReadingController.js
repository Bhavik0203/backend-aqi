const db = require('../models');
const { Op } = require('sequelize');
const asyncHandler = require('../middleware/asyncHandler');

// Get all AQI readings
exports.getAllReadings = asyncHandler(async (req, res) => {
  const { kit_id, start_date, end_date, limit = 100 } = req.query;
  const where = {};
  if (kit_id) where.kit_id = kit_id;
  if (start_date || end_date) {
    where.recorded_at = {};
    if (start_date) where.recorded_at[Op.gte] = start_date;
    if (end_date) where.recorded_at[Op.lte] = end_date;
  }

  const readings = await db.AQIReading.findAll({
    where,
    include: [{ model: db.Kit, as: 'kit' }],
    order: [['recorded_at', 'DESC']],
    limit: parseInt(limit)
  });
  res.json({ success: true, data: readings });
});

// Get reading by ID
exports.getReadingById = asyncHandler(async (req, res) => {
  const reading = await db.AQIReading.findByPk(req.params.id, {
    include: [{ model: db.Kit, as: 'kit' }]
  });
  if (!reading) {
    return res.status(404).json({ success: false, message: 'Reading not found' });
  }
  res.json({ success: true, data: reading });
});

// Create new reading
exports.createReading = asyncHandler(async (req, res) => {
  const reading = await db.AQIReading.create(req.body);
  res.status(201).json({ success: true, data: reading });
});

// Bulk create readings
exports.bulkCreateReadings = asyncHandler(async (req, res) => {
  const { readings } = req.body;
  const createdReadings = await db.AQIReading.bulkCreate(readings);
  res.status(201).json({ success: true, data: createdReadings, count: createdReadings.length });
});

// Get latest reading for a kit
exports.getLatestReading = asyncHandler(async (req, res) => {
  const reading = await db.AQIReading.findOne({
    where: { kit_id: req.params.kitId },
    include: [{ model: db.Kit, as: 'kit' }],
    order: [['recorded_at', 'DESC']]
  });
  if (!reading) {
    return res.status(404).json({ success: false, message: 'No readings found for this kit' });
  }
  res.json({ success: true, data: reading });
});

// Delete reading
exports.deleteReading = asyncHandler(async (req, res) => {
  const reading = await db.AQIReading.findByPk(req.params.id);
  if (!reading) {
    return res.status(404).json({ success: false, message: 'Reading not found' });
  }
  await reading.destroy();
  res.json({ success: true, message: 'Reading deleted successfully' });
});

