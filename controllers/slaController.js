const db = require('../models');
const { SlaTracking, SlaPerformance } = db;
const firebaseAdmin = require('../config/firebase');

// FCM Helper
const sendFCMSlaNotification = async (tracking, title, body) => {
  const payload = {
    notification: { title, body },
    data: {
      sla_id: tracking.id ? String(tracking.id) : '',
      status: tracking.status || '',
      type: 'sla_alert'
    }
  };
  const TEST_TOKEN = 'dVl3zUSoBu5h0kq9tYDuPe:APA91bEQ2A3yCUyk8vDNcFxGFRuDM9hk6AA_U_8Gp-SPMf5YsG3la1avEA6gw65rCEi9jSye8IxY-KJGi3F_Z_nASRCR9dFG3k03YV4T4v_-3j46N8e948U';
  try {
    await firebaseAdmin.messaging().send({ topic: 'sla', ...payload });
    await firebaseAdmin.messaging().send({ token: TEST_TOKEN, ...payload });
    console.log(`✅ FCM SLA Notification sent: ${title}`);
  } catch (e) {
    console.error('❌ FCM SLA Notification failed:', e.message);
  }
};

// SLA Tracking Handlers
exports.getAllSlaTracking = async (req, res) => {
  try {
    const tracking = await SlaTracking.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: tracking });
  } catch (error) {
    console.error('Error fetching SLA tracking:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSlaTrackingById = async (req, res) => {
  try {
    const tracking = await SlaTracking.findByPk(req.params.id);
    if (!tracking) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: tracking });
  } catch (error) {
    console.error('Error fetching SLA tracking by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSlaTracking = async (req, res) => {
  res.status(405).json({ success: false, message: 'Creation via API is disabled. Use Tickets to trigger SLA Tracking.' });
};

exports.updateSlaTracking = async (req, res) => {
  try {
    const tracking = await SlaTracking.findByPk(req.params.id);
    if (!tracking) return res.status(404).json({ success: false, message: 'Not found' });

    const oldStatus = tracking.status;
    await tracking.update(req.body);

    const newStatus = tracking.status;

    // Trigger Alert on Edit
    try {
      let description = `SLA Tracking Updated: Ticket #${tracking.ticketId}`;
      if (oldStatus !== newStatus) {
        description += ` - Status changed from ${oldStatus} to ${newStatus}`;
      } else {
        description += ` - Details updated`;
      }

      await db.Alert.create({
        alert_category: 'sla',
        alert_description: description,
        alert_status: 'open',
        kit_id: null
      });
    } catch (alertError) {
      console.error('Error creating SLA update alert:', alertError);
    }

    // Send Notification
    sendFCMSlaNotification(tracking, 'SLA Update', `Ticket #${tracking.ticketId} updated. Status: ${tracking.status}`);

    res.json({ success: true, data: tracking });
  } catch (error) {
    console.error('Error updating SLA tracking:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSlaTracking = async (req, res) => {
  res.status(405).json({ success: false, message: 'Deletion via API is disabled.' });
};

// SLA Performance Handlers
exports.getAllSlaPerformance = async (req, res) => {
  try {
    const performances = await SlaPerformance.findAll({
      order: [['performanceScore', 'DESC']]
    });
    res.json({ success: true, data: performances });
  } catch (error) {
    console.error('Error fetching SLA performance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSlaPerformanceById = async (req, res) => {
  try {
    const performance = await SlaPerformance.findByPk(req.params.id);
    if (!performance) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: performance });
  } catch (error) {
    console.error('Error fetching SLA performance by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSlaPerformance = async (req, res) => {
  res.status(405).json({ success: false, message: 'Auto-calculated. manual creation disabled.' });
};

exports.updateSlaPerformance = async (req, res) => {
  res.status(405).json({ success: false, message: 'Auto-calculated. manual update disabled.' });
};

exports.deleteSlaPerformance = async (req, res) => {
  res.status(405).json({ success: false, message: 'Deletion disabled.' });
};
