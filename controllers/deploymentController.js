const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const firebaseAdmin = require('../config/firebase');

// FCM Helper
const sendFCMDeploymentNotification = async (deployment, title, body) => {
  const payload = {
    notification: { title, body },
    data: {
      deployment_id: deployment.id ? String(deployment.id) : '',
      status: deployment.deployment_status || '',
      type: 'deployment_alert'
    }
  };
  const TEST_TOKEN = 'dVl3zUSoBu5h0kq9tYDuPe:APA91bEQ2A3yCUyk8vDNcFxGFRuDM9hk6AA_U_8Gp-SPMf5YsG3la1avEA6gw65rCEi9jSye8IxY-KJGi3F_Z_nASRCR9dFG3k03YV4T4v_-3j46N8e948U';
  try {
    await firebaseAdmin.messaging().send({ topic: 'deployment', ...payload });
    await firebaseAdmin.messaging().send({ token: TEST_TOKEN, ...payload });
    console.log(`✅ FCM Deployment Notification sent: ${title}`);
  } catch (e) {
    console.error('❌ FCM Deployment Notification failed:', e.message);
  }
};

exports.getAllDeployments = asyncHandler(async (req, res) => {
  const { status, kit_id, user_id } = req.query;
  const where = {};
  if (status) where.deployment_status = status;
  if (kit_id) where.kit_id = kit_id;
  if (user_id) where.deployed_for_user_id = user_id;

  const deployments = await db.Deployment.findAll({
    where,
    include: [
      {
        model: db.Kit,
        as: 'kit',
        include: [{ model: db.KitBatch, as: 'batch' }]
      },
      { model: db.UserProfile, as: 'User' },
      { model: db.UserProfile, as: 'technician' },
      { model: db.Ticket, as: 'ticket' }
    ]
  });
  res.json({ success: true, data: deployments });
});

exports.getDeploymentById = asyncHandler(async (req, res) => {
  const deployment = await db.Deployment.findByPk(req.params.id, {
    include: [{ model: db.Kit, as: 'kit' }]
  });
  if (!deployment) {
    return res.status(404).json({ success: false, message: 'Deployment not found' });
  }
  res.json({ success: true, data: deployment });
});

exports.createDeployment = asyncHandler(async (req, res) => {
  const deployment = await db.Deployment.create(req.body);

  const kit = await db.Kit.findByPk(req.body.kit_id);
  if (kit) {
    await kit.update({
      kit_status: 'deployed',
      deployment_date: req.body.installation_date || new Date()
    });
  }

  res.status(201).json({ success: true, data: deployment });

  // Trigger Alert
  await db.Alert.create({
    alert_category: 'deployment',
    alert_description: `New Deployment initiated for Kit #${deployment.kit_id || 'N/A'} at ${deployment.location_address || 'unknown location'}`,
    alert_status: 'open',
    kit_id: deployment.kit_id || null
  });

  // Send Notification
  sendFCMDeploymentNotification(deployment, 'New Deployment', `Deployment #${deployment.id} initiated for Kit #${deployment.kit_id}. Status: ${deployment.deployment_status}`);
});

exports.updateDeployment = asyncHandler(async (req, res) => {
  const deployment = await db.Deployment.findByPk(req.params.id);
  if (!deployment) {
    return res.status(404).json({ success: false, message: 'Deployment not found' });
  }
  await deployment.update(req.body);

  // Trigger Alert & Notification
  try {
    await db.Alert.create({
      alert_category: 'deployment',
      alert_description: `Deployment #${deployment.id} updated. Status: ${deployment.deployment_status}`,
      alert_status: 'open',
      kit_id: deployment.kit_id || null
    });
    sendFCMDeploymentNotification(deployment, 'Deployment Update', `Deployment #${deployment.id} is now ${deployment.deployment_status}`);
  } catch (e) { console.error(e); }

  res.json({ success: true, data: deployment });
});

exports.deleteDeployment = asyncHandler(async (req, res) => {
  const deployment = await db.Deployment.findByPk(req.params.id);
  if (!deployment) {
    return res.status(404).json({ success: false, message: 'Deployment not found' });
  }
  await deployment.destroy();
  res.json({ success: true, message: 'Deployment deleted successfully' });
});

