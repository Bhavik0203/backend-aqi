const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const firebaseAdmin = require('../config/firebase');

// FCM Notification Helper
// Sends to 'orders' topic and the specific test token
const sendFCMOrderNotification = async (order, title, body) => {
  const payload = {
    notification: { title, body },
    data: {
      order_id: order.id ? String(order.id) : '',
      status: order.current_order_status || '',
      type: 'order_update'
    }
  };

  // Specific token for testing
  const TEST_TOKEN = 'dVl3zUSoBu5h0kq9tYDuPe:APA91bEQ2A3yCUyk8vDNcFxGFRuDM9hk6AA_U_8Gp-SPMf5YsG3la1avEA6gw65rCEi9jSye8IxY-KJGi3F_Z_nASRCR9dFG3k03YV4T4v_-3j46N8e948U';

  try {
    // 1. Topic
    await firebaseAdmin.messaging().send({
      topic: 'orders',
      ...payload
    });
    // 2. Test Token
    await firebaseAdmin.messaging().send({
      token: TEST_TOKEN,
      ...payload
    });
    console.log(`✅ FCM Order Notification sent: ${title}`);
  } catch (e) {
    console.error('❌ FCM Order Notification failed:', e.message);
  }
};

exports.getAllOrders = asyncHandler(async (req, res) => {
  const { status, user_id } = req.query;
  const where = {};
  if (status) where.current_order_status = status;
  if (user_id) where.ordered_by_user_id = user_id;

  const orders = await db.Order.findAll({
    where,
    include: [
      { model: db.Kit, as: 'kit' },
      { model: db.OrderStatusLog, as: 'statusLogs', order: [['status_updated_at', 'DESC']] }
    ],
    order: [['ordered_at', 'DESC']]
  });
  res.json({ success: true, data: orders });
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await db.Order.findByPk(req.params.id, {
    include: [
      { model: db.Kit, as: 'kit' },
      { model: db.OrderStatusLog, as: 'statusLogs', order: [['status_updated_at', 'DESC']] }
    ]
  });
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, data: order });
});

exports.createOrder = asyncHandler(async (req, res) => {
  const order = await db.Order.create(req.body);

  await db.OrderStatusLog.create({
    order_id: order.id,
    order_status: order.current_order_status,
    status_remarks: 'Order created'
  });

  // Trigger Alert
  await db.Alert.create({
    alert_category: 'order',
    alert_description: `New Order created #${order.id}. Status: ${order.current_order_status}`,
    alert_status: 'open',
    kit_id: order.kit_id || null
  });

  // Send Notification
  sendFCMOrderNotification(order, 'New Order Created', `Order #${order.id} has been placed.`);

  // Send Email
  if (order.email) {
    const { sendOrderConfirmationEmail } = require('../utils/emailService');
    await sendOrderConfirmationEmail(order.email, order);
  }

  res.status(201).json({ success: true, data: order });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { order_status, status_remarks } = req.body;
  const order = await db.Order.findByPk(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  await order.update({ current_order_status: order_status });

  if (order_status === 'delivered') {
    await order.update({ delivered_at: new Date() });
  }

  await db.OrderStatusLog.create({
    order_id: order.id,
    order_status: order_status,
    status_remarks: status_remarks || 'Status updated'
  });

  // Send Notification
  sendFCMOrderNotification(order, `Order Status Update`, `Order #${order.id} is now ${order_status}.`);

  res.json({ success: true, data: order });
});

exports.deleteOrder = asyncHandler(async (req, res) => {
  const order = await db.Order.findByPk(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  await order.destroy();
  res.json({ success: true, message: 'Order deleted successfully' });
});

exports.getUniqueCustomers = asyncHandler(async (req, res) => {
  const orders = await db.Order.findAll({
    attributes: ['contact_number', 'customer_name', 'company', 'office_incharge', 'email', 'ordered_at'],
    order: [['ordered_at', 'DESC']]
  });

  const uniqueMap = new Map();
  orders.forEach(o => {
    if (o.contact_number && !uniqueMap.has(o.contact_number)) {
      uniqueMap.set(o.contact_number, {
        contactNumber: o.contact_number,
        name: o.customer_name,
        company: o.company,
        officeIncharge: o.office_incharge,
        email: o.email
      });
    }
  });

  res.json({ success: true, data: Array.from(uniqueMap.values()) });
});

