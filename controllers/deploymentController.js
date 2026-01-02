const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

// Get all deployments
exports.getAllDeployments = asyncHandler(async (req, res) => {
  const { status, kit_id, user_id } = req.query;
  const where = {};
  if (status) where.deployment_status = status;
  if (kit_id) where.kit_id = kit_id;
  if (user_id) where.deployed_for_user_id = user_id;

  const deployments = await db.Deployment.findAll({
    where,
    include: [{ model: db.Kit, as: 'kit' }]
  });
  res.json({ success: true, data: deployments });
});

// Get deployment by ID
exports.getDeploymentById = asyncHandler(async (req, res) => {
  const deployment = await db.Deployment.findByPk(req.params.id, {
    include: [{ model: db.Kit, as: 'kit' }]
  });
  if (!deployment) {
    return res.status(404).json({ success: false, message: 'Deployment not found' });
  }
  res.json({ success: true, data: deployment });
});

// Create new deployment
exports.createDeployment = asyncHandler(async (req, res) => {
  const deployment = await db.Deployment.create(req.body);
  
  // Update kit status to deployed
  const kit = await db.Kit.findByPk(req.body.kit_id);
  if (kit) {
    await kit.update({ 
      kit_status: 'deployed',
      deployment_date: req.body.installation_date || new Date()
    });
  }

  res.status(201).json({ success: true, data: deployment });
});

// Update deployment
exports.updateDeployment = asyncHandler(async (req, res) => {
  const deployment = await db.Deployment.findByPk(req.params.id);
  if (!deployment) {
    return res.status(404).json({ success: false, message: 'Deployment not found' });
  }
  await deployment.update(req.body);
  res.json({ success: true, data: deployment });
});

// Delete deployment
exports.deleteDeployment = asyncHandler(async (req, res) => {
  const deployment = await db.Deployment.findByPk(req.params.id);
  if (!deployment) {
    return res.status(404).json({ success: false, message: 'Deployment not found' });
  }
  await deployment.destroy();
  res.json({ success: true, message: 'Deployment deleted successfully' });
});

