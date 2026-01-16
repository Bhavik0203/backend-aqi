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
      {
        model: db.Kit,
        as: 'kit',
        include: [{ model: db.KitBatch, as: 'batch' }]
      },
      { model: db.Order, as: 'order' }, // Include Order
      { model: db.TicketLog, as: 'logs', order: [['logged_at', 'DESC']] },
      { model: db.TicketImage, as: 'images' },
      { model: db.UserProfile, as: 'technician', attributes: ['id', 'first_name', 'last_name', 'email'] },
      { model: db.UserProfile, as: 'creator', attributes: ['id', 'first_name', 'last_name'] }
    ],
    order: [
      [db.sequelize.literal(`CASE WHEN "ticket_status" = 'rejected' THEN 0 ELSE 1 END`), 'ASC'],
      ['created_at', 'DESC']
    ]
  });
  res.json({ success: true, data: tickets });
});

exports.getTicketsByTechnician = asyncHandler(async (req, res) => {
  const { id } = req.params; // Technician ID from route

  const tickets = await db.Ticket.findAll({
    where: { assigned_technician_id: id },
    include: [
      { model: db.Kit, as: 'kit' },
      { model: db.Order, as: 'order' },
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
      { model: db.Order, as: 'order' }, // Include Order
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
    created_by_user_id,
    order_id // Accept order_id
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
    ticket_status: req.body.assigned_technician_id ? 'assigned' : 'created',
    assigned_technician_id: req.body.assigned_technician_id || null,
    order_id: order_id || null // Save order_id
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

  const { ticket_status, assigned_technician_id, log_remarks } = req.body;

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
    let logMessage = `Status changed from ${oldStatus} to ${newStatus}`;
    if (log_remarks) {
      logMessage += `. Remarks: ${log_remarks}`;
    }

    await db.TicketLog.create({
      ticket_id: ticket.id,
      action_taken: 'Status Updated',
      remarks: logMessage
    });
  }

  // AUTOMATED DEPLOYMENT LOGIC
  // Trigger when ticket is assigned OR completed, provided it is an installation ticket
  const incomingStatus = (newStatus || '').toLowerCase();
  const currentTicketType = (ticket.ticket_type || '').toLowerCase();

  // Trigger if (Assigning Tech) OR (Completing Ticket)
  // We relax the check: if technician is present/assigned, we try to sync.
  const hasTech = assigned_technician_id || ticket.assigned_technician_id;
  const isAssignment = hasTech && (incomingStatus === 'assigned' || ticket.ticket_status === 'assigned' || ticket.ticket_status === 'created');
  const isCompletion = incomingStatus === 'completed';

  if ((isAssignment || isCompletion) && currentTicketType.includes('installation')) {
    try {
      console.log(`🚀 Automated Deployment Logic Triggered for Ticket #${ticket.id}`);

      // 1. Fetch Order & Context Data
      const order = await db.Order.findOne({
        where: { kit_id: ticket.kit_id },
        order: [['ordered_at', 'DESC']]
      });

      // 2. Parse Location
      let location = 'Unknown';
      if (ticket.issue_description) {
        const locMatch = ticket.issue_description.match(/Location:\s*(.*?)(\n|$)/);
        if (locMatch) location = locMatch[1].trim();
      }
      if ((!location || location === 'Unknown') && order) {
        location = [order.location, order.city, order.country].filter(Boolean).join(', ') || 'Unknown';
      }

      // 3. Determine User & Technician
      let userId = order ? order.ordered_by_user_id : (ticket.created_by_user_id || 1);

      // Verify User Exists to prevent FK Error
      const userExists = await db.UserProfile.findByPk(userId);
      if (!userExists) {
        console.warn(`[WARN] User ID ${userId} not found for deployment. Defaulting to Admin (1).`);
        userId = 1;
        // Ensure Admin exists, otherwise maybe null if schema allows, or handle error
      }

      // Ensure accurate Technician ID
      const finalTechIdRaw = assigned_technician_id || ticket.assigned_technician_id;
      const finalTechId = finalTechIdRaw ? parseInt(finalTechIdRaw, 10) : null;

      // 4. Check for existing Deployment
      let deployment = await db.Deployment.findOne({
        where: { ticket_id: ticket.id }
      });

      // 4b. Fallback: Check for existing Deployment for this KIT (latest one)
      if (!deployment) {
        deployment = await db.Deployment.findOne({
          where: { kit_id: ticket.kit_id },
          order: [['id', 'DESC']]
        });
      }

      const deploymentPayload = {
        kit_id: parseInt(ticket.kit_id, 10),
        deployed_for_user_id: userId,
        assigned_technician_id: finalTechId,
        ticket_id: ticket.id,
        deployment_location: location,
      };

      console.log(`[DEBUG] Deployment Processing. Payload keys:`, deploymentPayload);
      let actionLog = '';

      // --- SCENARIO A: ASSIGNMENT (Status -> Pending) ---
      if (isAssignment && !isCompletion) {
        const pendingPayload = {
          ...deploymentPayload,
          deployment_status: 'pending'
        };

        if (deployment) {
          await deployment.update(pendingPayload);
          actionLog = `Deployment #${deployment.id} synced with ticket (Pending)`;
        } else {
          deployment = await db.Deployment.create({
            ...pendingPayload,
            installation_date: null
          });
          actionLog = `Deployment #${deployment.id} created (Pending)`;
        }
      }

      // --- SCENARIO B: COMPLETION (Status -> Active) ---
      if (isCompletion) {
        const activePayload = {
          ...deploymentPayload,
          deployment_status: 'active',
          installation_date: new Date()
        };

        if (deployment) {
          await deployment.update(activePayload);
          actionLog = `Deployment #${deployment.id} activated (Completed)`;
        } else {
          deployment = await db.Deployment.create(activePayload);
          actionLog = `Deployment #${deployment.id} created & activated`;
        }

        // Update Kit Status
        await db.Kit.update(
          { kit_status: 'deployed' },
          { where: { id: ticket.kit_id } }
        );

        // Update Order
        if (order && order.current_order_status !== 'delivered') {
          await order.update({ current_order_status: 'delivered', delivered_at: new Date() });
        }
      }

      if (actionLog) console.log(actionLog);

    } catch (depError) {
      console.error("❌ Failed to auto-process deployment logic:", depError);
      // WRITE ERROR TO LOGS
      await db.TicketLog.create({
        ticket_id: ticket.id,
        action_taken: 'System Error',
        remarks: `Auto-Deployment Failed: ${depError.message}`
      });
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
      { model: db.Order, as: 'order' }, // Include Order in response
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
