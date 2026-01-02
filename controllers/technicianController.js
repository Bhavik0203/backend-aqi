const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

exports.getAllTechnicians = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const where = {};
  if (status) where.availability_status = status;

  const technicians = await db.TechnicianAvailability.findAll({
    where,
    order: [['last_updated', 'DESC']]
  });
  res.json({ success: true, data: technicians });
});

exports.getTechnicianById = asyncHandler(async (req, res) => {
  const technician = await db.TechnicianAvailability.findOne({
    where: { technician_id: req.params.id }
  });
  if (!technician) {
    return res.status(404).json({ success: false, message: 'Technician not found' });
  }
  res.json({ success: true, data: technician });
});

exports.updateAvailability = asyncHandler(async (req, res) => {
  const { availability_status } = req.body;
  const [technician, created] = await db.TechnicianAvailability.findOrCreate({
    where: { technician_id: req.params.id },
    defaults: { availability_status: availability_status || 'available' }
  });

  if (!created) {
    await technician.update({
      availability_status,
      last_updated: new Date()
    });
  }

  res.json({ success: true, data: technician });
});

exports.deleteTechnician = asyncHandler(async (req, res) => {
  const technician = await db.TechnicianAvailability.findOne({
    where: { technician_id: req.params.id }
  });
  if (!technician) {
    return res.status(404).json({ success: false, message: 'Technician not found' });
  }
  await technician.destroy();
  res.json({ success: true, message: 'Technician record deleted successfully' });
});

