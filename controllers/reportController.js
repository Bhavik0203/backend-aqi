const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

exports.getAllReports = asyncHandler(async (req, res) => {
  const { user_id, report_type } = req.query;
  const where = {};
  if (user_id) where.generated_for_user_id = user_id;
  if (report_type) where.report_type = report_type;

  const reports = await db.Report.findAll({
    where,
    order: [['generated_at', 'DESC']]
  });
  res.json({ success: true, data: reports });
});

exports.getReportById = asyncHandler(async (req, res) => {
  const report = await db.Report.findByPk(req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }
  res.json({ success: true, data: report });
});

exports.createReport = asyncHandler(async (req, res) => {
  const report = await db.Report.create(req.body);
  res.status(201).json({ success: true, data: report });
});

exports.deleteReport = asyncHandler(async (req, res) => {
  const report = await db.Report.findByPk(req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }
  await report.destroy();
  res.json({ success: true, message: 'Report deleted successfully' });
});

