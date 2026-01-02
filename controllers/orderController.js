const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

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

