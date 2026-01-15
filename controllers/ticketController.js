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
      { model: db.TicketImage, as: 'images' },
      { model: db.UserProfile, as: 'technician', attributes: ['id', 'first_name', 'last_name', 'email'] },
      { model: db.UserProfile, as: 'creator', attributes: ['id', 'first_name', 'last_name'] }
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
      { model: db.TicketImage, as: 'images' },
      { model: db.UserProfile, as: 'technician', attributes: ['id', 'first_name', 'last_name', 'email'] },
      { model: db.UserProfile, as: 'creator', attributes: ['id', 'first_name', 'last_name'] }
    ]
  });
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }
  res.json({ success: true, data: ticket });
});

exports.createTicket = asyncHandler(async (req, res) => {
  const {
    ticket_type,
    kit_id,
    device_id, // Accept serial number string
    issue_description,
    priority,
    source = 'Manual',
    scheduled_date,
    created_by_user_id
  } = req.body;

  let finalKitId = kit_id;

  // Lookup kit by serial number if kit_id not provided
  if (!finalKitId && device_id) {
    const kit = await db.Kit.findOne({ where: { kit_serial_number: device_id } });
    if (!kit) {
      return res.status(404).json({ success: false, message: `Device with ID/Serial '${device_id}' not found` });
    }
    finalKitId = kit.id;
  }

  if (!finalKitId) {
    return res.status(400).json({ success: false, message: 'Kit ID or valid Device Serial Number is required' });
  }

  // Validate user if provided (optional)
  let finalUserId = created_by_user_id;
  if (finalUserId) {
    const user = await db.UserProfile.findByPk(finalUserId);
    if (!user) {
      // Fallback to null or warn. For now, let's set to null to avoid FK crash
      console.warn(`User ID ${finalUserId} not found, creating ticket as anonymous/system`);
      finalUserId = null;
    }
  }

  const ticketData = {
    ticket_type,
    kit_id: finalKitId,
    issue_description,
    priority,
    source,
    scheduled_date,
    created_by_user_id: finalUserId || null,
    ticket_status: 'created'
  };

  const ticket = await db.Ticket.create(ticketData);

  await db.TicketLog.create({
    ticket_id: ticket.id,
    action_taken: 'Ticket created',
    remarks: `Ticket created via ${source} source. Issue: ${issue_description || 'No description'}`
  });

  // Trigger Alert
  await db.Alert.create({
    alert_category: 'ticket',
    alert_description: `New ${priority} Priority Ticket #${ticket.id}: ${issue_description?.substring(0, 50)}...`,
    alert_status: 'open',
    kit_id: finalKitId || null
  });

  res.status(201).json({ success: true, data: ticket });
});

exports.updateTicket = asyncHandler(async (req, res) => {
  const ticket = await db.Ticket.findByPk(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const { ticket_status, assigned_technician_id } = req.body;

  const oldStatus = ticket.ticket_status;
  const oldTechId = ticket.assigned_technician_id;

  // Logic to update status if only technician is assigned but status not sent
  let newStatus = ticket_status || oldStatus;

  if (assigned_technician_id && oldStatus === 'created' && !ticket_status) {
    newStatus = 'assigned';
  }

  await ticket.update({ ...req.body, ticket_status: newStatus });

  // Log status change or assignment
  if (newStatus !== oldStatus) {
    await db.TicketLog.create({
      ticket_id: ticket.id,
      action_taken: 'Status Updated',
      remarks: `Status changed from ${oldStatus} to ${newStatus}`
    });

    // AUTOMATED DEPLOYMENT LOGIC
    // Trigger when ticket is completed and is an installation ticket
    const incomingStatus = (newStatus || '').toLowerCase();
    const currentTicketType = (ticket.ticket_type || '').toLowerCase();

    console.log(`[DEBUG] UpdateTicket: ID=${ticket.id}, IncomingStatus=${incomingStatus}, Type=${currentTicketType}`);

    if (incomingStatus === 'completed' && currentTicketType.includes('installation')) {
      try {
        console.log(`🚀 Automated Deployment Triggered for Ticket #${ticket.id}`);

        // 1. Find the Client (User) from the Order associated with this Kit
        const order = await db.Order.findOne({
          where: { kit_id: ticket.kit_id },
          order: [['ordered_at', 'DESC']]
        });

        console.log(`[DEBUG] Order Found: ${order ? order.id : 'No Order'}`);

        // 2. Parse Location
        let location = 'Unknown';
        if (ticket.issue_description) {
          const locMatch = ticket.issue_description.match(/Location:\s*(.*?)(\n|$)/);
          if (locMatch) location = locMatch[1].trim();
        }
        if ((!location || location === 'Unknown') && order) {
          location = [order.location, order.city, order.country].filter(Boolean).join(', ') || 'Unknown';
        }

        // 3. Create Deployment Record
        // Fallback User ID: Order User -> Ticket Creator -> 1 (Admin/System)
        const userId = order ? order.ordered_by_user_id : (ticket.created_by_user_id || 1);

        const deploymentPayload = {
          kit_id: ticket.kit_id,
          deployed_for_user_id: userId,
          assigned_technician_id: ticket.assigned_technician_id || ticket.created_by_user_id, // Tech or at least someone
          ticket_id: ticket.id,
          deployment_location: location,
          installation_date: new Date(),
          deployment_status: 'active'
        };

        const newDeployment = await db.Deployment.create(deploymentPayload);
        console.log(`✅ Deployment Created: #${newDeployment.id}`);

        // 4. Update Kit Status
        await db.Kit.update(
          { kit_status: 'deployed' },
          { where: { id: ticket.kit_id } }
        );

        // 5. SYNC ORDER STATUS: Mark Order as 'delivered' (Completed)
        if (order) {
          await order.update({
            current_order_status: 'delivered',
            delivered_at: new Date()
          });
          // Log status change in Order Logs
          await db.OrderStatusLog.create({
            order_id: order.id,
            status: 'delivered',
            changed_by_user_id: ticket.assigned_technician_id || 1, // Tech or Admin
            remarks: `Order delivered/installed via Ticket #${ticket.id}`
          });
          console.log(`✅ Associated Order #${order.id} marked as Delivered`);
        }

      } catch (depError) {
        console.error("❌ Failed to auto-create deployment or update order:", depError);
      }
    }
  }

  if (assigned_technician_id && String(assigned_technician_id) !== String(oldTechId)) {
    const action = oldTechId ? 'Technician Reassigned' : 'Technician Assigned';
    await db.TicketLog.create({
      ticket_id: ticket.id,
      action_taken: action,
      remarks: `Technician changed from ${oldTechId || 'None'} to ${assigned_technician_id}`
    });
  }

  // Fetch updated ticket with associations for response
  const updatedTicket = await db.Ticket.findByPk(ticket.id, {
    include: [
      { model: db.Kit, as: 'kit' },
      { model: db.TicketLog, as: 'logs', order: [['logged_at', 'DESC']] },
      { model: db.TicketImage, as: 'images' },
      { model: db.UserProfile, as: 'technician', attributes: ['id', 'first_name', 'last_name', 'email'] },
      { model: db.UserProfile, as: 'creator', attributes: ['id', 'first_name', 'last_name'] }
    ]
  });

  res.json({ success: true, data: updatedTicket });
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

