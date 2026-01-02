const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

exports.getAllTickets = asyncHandler(async (req, res) => {
  const { status, type, kit_id, technician_id } = req.query;
  const where = {};
  if (status) where.ticket_status = status;
  if (type) where.ticket_type = type;
  if (kit_id) where.kit_id = kit_id;
  if (technician_id) where.assigned_technician_id = technician_id;

  const tickets = await db.Ticket.findAll({
    where,
    include: [
      { model: db.Kit, as: 'kit' },
      { model: db.TicketLog, as: 'logs', order: [['logged_at', 'DESC']] },
      { model: db.TicketImage, as: 'images' }
    ],
    order: [['created_at', 'DESC']]
  });
  res.json({ success: true, data: tickets });
});

exports.getTicketById = asyncHandler(async (req, res) => {
  const ticket = await db.Ticket.findByPk(req.params.id, {
    include: [
      { model: db.Kit, as: 'kit' },
      { model: db.TicketLog, as: 'logs', order: [['logged_at', 'DESC']] },
      { model: db.TicketImage, as: 'images' }
    ]
  });
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }
  res.json({ success: true, data: ticket });
});

exports.createTicket = asyncHandler(async (req, res) => {
  const ticket = await db.Ticket.create(req.body);

  await db.TicketLog.create({
    ticket_id: ticket.id,
    action_taken: 'Ticket created',
    remarks: 'Ticket has been created'
  });

  res.status(201).json({ success: true, data: ticket });
});

exports.updateTicket = asyncHandler(async (req, res) => {
  const ticket = await db.Ticket.findByPk(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }
  await ticket.update(req.body);
  res.json({ success: true, data: ticket });
});

exports.addTicketLog = asyncHandler(async (req, res) => {
  const { action_taken, remarks } = req.body;
  const ticket = await db.Ticket.findByPk(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const log = await db.TicketLog.create({
    ticket_id: req.params.id,
    action_taken,
    remarks
  });

  res.status(201).json({ success: true, data: log });
});

exports.addTicketImage = asyncHandler(async (req, res) => {
  const { image_url } = req.body;
  const ticket = await db.Ticket.findByPk(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const image = await db.TicketImage.create({
    ticket_id: req.params.id,
    image_url
  });

  res.status(201).json({ success: true, data: image });
});

exports.deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await db.Ticket.findByPk(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }
  await ticket.destroy();
  res.json({ success: true, message: 'Ticket deleted successfully' });
});

