const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

// Get all maintenance schedules
exports.getAllSchedules = asyncHandler(async (req, res) => {
  const { status, kit_id } = req.query;
  const where = {};
  if (status) where.schedule_status = status;
  if (kit_id) where.kit_id = kit_id;

  const schedules = await db.MaintenanceSchedule.findAll({
    where,
    include: [{ model: db.Kit, as: 'kit' }]
  });
  res.json({ success: true, data: schedules });
});

// Get schedule by ID
exports.getScheduleById = asyncHandler(async (req, res) => {
  const schedule = await db.MaintenanceSchedule.findByPk(req.params.id, {
    include: [{ model: db.Kit, as: 'kit' }]
  });
  if (!schedule) {
    return res.status(404).json({ success: false, message: 'Schedule not found' });
  }
  res.json({ success: true, data: schedule });
});

// Create new schedule
exports.createSchedule = asyncHandler(async (req, res) => {
  const schedule = await db.MaintenanceSchedule.create(req.body);
  res.status(201).json({ success: true, data: schedule });
});

// Update schedule
exports.updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await db.MaintenanceSchedule.findByPk(req.params.id);
  if (!schedule) {
    return res.status(404).json({ success: false, message: 'Schedule not found' });
  }
  await schedule.update(req.body);
  res.json({ success: true, data: schedule });
});

// Delete schedule
exports.deleteSchedule = asyncHandler(async (req, res) => {
  const schedule = await db.MaintenanceSchedule.findByPk(req.params.id);
  if (!schedule) {
    return res.status(404).json({ success: false, message: 'Schedule not found' });
  }
  await schedule.destroy();
  res.json({ success: true, message: 'Schedule deleted successfully' });
});

