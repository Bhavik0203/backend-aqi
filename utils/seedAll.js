const db = require('../models');
const bcrypt = require('bcryptjs');

async function seedAll() {
  const summary = {};

  try {
    console.log('🌱 Starting comprehensive database seeding for all modules...');

    // 0. Ensure schema is synchronized safely
    try {
      await db.sequelize.sync();
      console.log('✅ Database schema verified.');
    } catch (syncErr) {
      console.warn('⚠️ Table sync notice (continuing):', syncErr.message);
    }

    // 1. Roles & Permissions
    const roleDefinitions = [
      { key: 'administrator', label: 'Administrator', description: 'Full system super administrator' },
      { key: 'technician', label: 'Technician', description: 'Field service & installation technician' },
      { key: 'business_user', label: 'Business/Government User', description: 'Enterprise and government client' },
      { key: 'public_user', label: 'Public User', description: 'General citizen public user' }
    ];

    const roles = {};
    for (const r of roleDefinitions) {
      const [roleInstance] = await db.Role.findOrCreate({
        where: { key: r.key },
        defaults: r
      });
      roles[r.key] = roleInstance;
    }
    summary.roles = Object.keys(roles).length;
    console.log(`✅ Roles verified (${summary.roles} roles).`);

    // Permissions
    const permissionsList = [
      { key: 'view_dashboard', name: 'Dashboard' },
      { key: 'manage_inventory', name: 'Inventory Management' },
      { key: 'manage_devices', name: 'Device Management' },
      { key: 'manage_orders', name: 'Order Management' },
      { key: 'manage_transactions', name: 'Transaction Management' },
      { key: 'view_analytics', name: 'AQI Data Analytics' },
      { key: 'view_notifications', name: 'Notifications & Alerts' },
      { key: 'manage_staff', name: 'Staff Management' },
      { key: 'manage_rbac', name: 'Access Control' },
      { key: 'manage_deployments', name: 'Deployments' },
      { key: 'manage_maintenance', name: 'Ticket Management' },
      { key: 'view_sla', name: 'SLA Tracking and Performance' },
      { key: 'view_logs', name: 'Customer Activity Logs' }
    ];

    const permissionInstances = [];
    for (const p of permissionsList) {
      const [perm] = await db.Permission.findOrCreate({
        where: { key: p.key },
        defaults: p
      });
      permissionInstances.push(perm);
    }
    summary.permissions = permissionInstances.length;

    // Assign all permissions to Administrator
    await roles.administrator.setPermissions(permissionInstances);

    // Assign specific to Technician
    const techPerms = permissionInstances.filter(p =>
      ['view_dashboard', 'manage_maintenance', 'manage_deployments', 'view_notifications', 'manage_devices'].includes(p.key)
    );
    await roles.technician.setPermissions(techPerms);

    // Assign client permissions
    const clientPerms = permissionInstances.filter(p =>
      ['view_dashboard', 'view_analytics', 'view_notifications', 'manage_orders'].includes(p.key)
    );
    await roles.business_user.setPermissions(clientPerms);
    await roles.public_user.setPermissions(clientPerms);

    // 2. User Profiles (8 diverse users)
    const salt = await bcrypt.genSalt(10);
    const defaultHashedPassword = await bcrypt.hash('Pritomatic@123', salt);

    const userSeedData = [
      {
        first_name: 'Super',
        last_name: 'Admin',
        email: 'admin@pritomatic.com',
        phone_number: '+919876543200',
        password: defaultHashedPassword,
        role_id: roles.administrator.id,
        status: 'Available',
        organization_name: 'Mahatech -AQI HQ',
        address: 'HQ Tower, Pune'
      },
      {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@pritomatic.com',
        phone_number: '+919876543210',
        password: defaultHashedPassword,
        role_id: roles.technician.id,
        status: 'On Duty',
        organization_name: 'Field Operations Pune',
        address: 'Baner, Pune'
      },
      {
        first_name: 'Robert',
        last_name: 'Brown',
        email: 'robert.b@pritomatic.com',
        phone_number: '+919876543212',
        password: defaultHashedPassword,
        role_id: roles.technician.id,
        status: 'Available',
        organization_name: 'Field Operations Mumbai',
        address: 'Andheri East, Mumbai'
      },
      {
        first_name: 'Vikram',
        last_name: 'Singh',
        email: 'vikram.s@pritomatic.com',
        phone_number: '+919876543215',
        password: defaultHashedPassword,
        role_id: roles.technician.id,
        status: 'Available',
        organization_name: 'Field Operations Delhi',
        address: 'Connaught Place, Delhi'
      },
      {
        first_name: 'Emily',
        last_name: 'Davis',
        email: 'emily.d@govt.in',
        phone_number: '+919876543213',
        password: defaultHashedPassword,
        role_id: roles.business_user.id,
        status: 'Available',
        organization_name: 'State Pollution Control Board',
        address: 'Civil Lines, Delhi'
      },
      {
        first_name: 'Rajesh',
        last_name: 'Patil',
        email: 'rajesh.patil@punecorp.gov.in',
        phone_number: '+919876543216',
        password: defaultHashedPassword,
        role_id: roles.business_user.id,
        status: 'Available',
        organization_name: 'Pune Municipal Corporation',
        address: 'Shivajinagar, Pune'
      },
      {
        first_name: 'Michael',
        last_name: 'Wilson',
        email: 'michael.w@public.com',
        phone_number: '+919876543214',
        password: defaultHashedPassword,
        role_id: roles.public_user.id,
        status: 'Available',
        organization_name: 'Public Citizen Bangalore',
        address: 'Indiranagar, Bangalore'
      },
      {
        first_name: 'Sneha',
        last_name: 'Kulkarni',
        email: 'sneha.k@public.com',
        phone_number: '+919876543217',
        password: defaultHashedPassword,
        role_id: roles.public_user.id,
        status: 'Available',
        organization_name: 'Clean Air Volunteer',
        address: 'T. Nagar, Chennai'
      }
    ];

    const users = {};
    for (const u of userSeedData) {
      let user = await db.UserProfile.findOne({ where: { email: u.email } });
      if (user) {
        await user.update({
          password: u.password,
          role_id: u.role_id,
          first_name: u.first_name,
          last_name: u.last_name,
          phone_number: u.phone_number,
          status: u.status,
          organization_name: u.organization_name,
          address: u.address
        });
      } else {
        user = await db.UserProfile.create(u);
      }
      users[u.email] = user;
    }
    summary.users = Object.keys(users).length;
    console.log(`✅ Users seeded (${summary.users} users).`);

    // Technician Availability
    const techs = [
      { id: users['john.doe@pritomatic.com']?.id, status: 'busy' },
      { id: users['robert.b@pritomatic.com']?.id, status: 'available' },
      { id: users['vikram.s@pritomatic.com']?.id, status: 'available' }
    ];
    for (const t of techs) {
      if (t.id) {
        await db.TechnicianAvailability.findOrCreate({
          where: { technician_id: t.id },
          defaults: { availability_status: t.status, last_updated: new Date() }
        });
      }
    }

    // 3. Sensor Batches & Items
    const sensorBatchConfigs = [
      { code: 'SBATCH-2026-001', supplier: 'AeroSense Technologies', total: 100, reqDate: '2026-01-10', recDate: '2026-01-20', alloc: 40, rem: 60, status: 'partially_allocated' },
      { code: 'SBATCH-2026-002', supplier: 'Sensirion AG Switzerland', total: 80, reqDate: '2026-01-15', recDate: '2026-01-25', alloc: 80, rem: 0, status: 'fully_allocated' },
      { code: 'SBATCH-2026-003', supplier: 'Bosch Sensortec Germany', total: 50, reqDate: '2026-02-01', recDate: null, alloc: 0, rem: 50, status: 'pending' }
    ];

    const sensorBatches = {};
    for (const sb of sensorBatchConfigs) {
      const [batch] = await db.SensorBatch.findOrCreate({
        where: { sensor_batch_code: sb.code },
        defaults: {
          sensor_batch_code: sb.code,
          supplier_name: sb.supplier,
          total_quantity: sb.total,
          requested_date: sb.reqDate,
          received_date: sb.recDate,
          allocated_for_assembly: sb.alloc,
          remaining_quantity: sb.rem,
          batch_status: sb.status
        }
      });
      sensorBatches[sb.code] = batch;
    }
    summary.sensorBatches = Object.keys(sensorBatches).length;

    // Sensor Items
    for (let i = 1; i <= 15; i++) {
      const isAllocated = i <= 10;
      const itemCode = `SN-OPT-00${i < 10 ? '0' + i : i}`;
      await db.SensorBatchItem.findOrCreate({
        where: { sensor_item_code: itemCode },
        defaults: {
          sensor_batch_id: sensorBatches['SBATCH-2026-001'].id,
          sensor_item_code: itemCode,
          item_status: isAllocated ? 'allocated' : 'available',
          received_date: '2026-01-20',
          allocated_date: isAllocated ? '2026-02-01' : null,
          current_location: isAllocated ? 'Assembly Line 1' : 'Central Warehouse Pune'
        }
      });
    }

    // 4. Kit Batches & Kits
    const kitBatchConfigs = [
      { code: 'KBATCH-2026-001', total: 50, date: '2026-02-01', status: 'completed', alloc: 15, rem: 35, remarks: 'High accuracy ambient pole monitors' },
      { code: 'KBATCH-2026-002', total: 50, date: '2026-02-10', status: 'in_progress', alloc: 10, rem: 40, remarks: 'Transit bus roof-mounted monitors' }
    ];

    const kitBatches = {};
    for (const kb of kitBatchConfigs) {
      const [batch] = await db.KitBatch.findOrCreate({
        where: { kit_batch_code: kb.code },
        defaults: {
          kit_batch_code: kb.code,
          total_kits: kb.total,
          assembly_date: kb.date,
          assembled_by_user_id: users['john.doe@pritomatic.com']?.id || 1,
          assembly_status: kb.status,
          allocated_kits: kb.alloc,
          remaining_kits: kb.rem,
          remarks: kb.remarks
        }
      });
      kitBatches[kb.code] = batch;
    }
    summary.kitBatches = Object.keys(kitBatches).length;

    // 15 Kits
    const kitSpecs = [
      { serial: 'AQI-KIT-101', status: 'deployed', location: 'Pune - Shivajinagar', customer: 'Pune Municipal Corporation', batch: 'KBATCH-2026-001' },
      { serial: 'AQI-KIT-102', status: 'deployed', location: 'Pune - Baner High Street', customer: 'Pune Smart City', batch: 'KBATCH-2026-001' },
      { serial: 'AQI-KIT-103', status: 'deployed', location: 'Pune - Kothrud Depot', customer: 'PMPML Transit', batch: 'KBATCH-2026-002' },
      { serial: 'AQI-KIT-104', status: 'deployed', location: 'Mumbai - Bandra Kurla Complex', customer: 'Maharashtra Pollution Board', batch: 'KBATCH-2026-001' },
      { serial: 'AQI-KIT-105', status: 'deployed', location: 'Mumbai - Andheri Station', customer: 'BEST Transport Corp', batch: 'KBATCH-2026-002' },
      { serial: 'AQI-KIT-106', status: 'deployed', location: 'Delhi - Connaught Place', customer: 'State Pollution Control Board', batch: 'KBATCH-2026-001' },
      { serial: 'AQI-KIT-107', status: 'deployed', location: 'Delhi - Anand Vihar ISBT', customer: 'Delhi Clean Air Corp', batch: 'KBATCH-2026-002' },
      { serial: 'AQI-KIT-108', status: 'deployed', location: 'Bangalore - Whitefield ITPL', customer: 'BBMP Smart City', batch: 'KBATCH-2026-001' },
      { serial: 'AQI-KIT-109', status: 'available', location: 'Central Warehouse Pune', customer: null, batch: 'KBATCH-2026-001' },
      { serial: 'AQI-KIT-110', status: 'available', location: 'Central Warehouse Pune', customer: null, batch: 'KBATCH-2026-001' },
      { serial: 'AQI-KIT-111', status: 'available', location: 'Mumbai Logistics Hub', customer: null, batch: 'KBATCH-2026-002' },
      { serial: 'AQI-KIT-112', status: 'available', location: 'Delhi Regional Hub', customer: null, batch: 'KBATCH-2026-002' },
      { serial: 'AQI-KIT-113', status: 'reserved', location: 'Central Warehouse Pune', customer: 'Gujarat Pollution Board', batch: 'KBATCH-2026-001' },
      { serial: 'AQI-KIT-114', status: 'reserved', location: 'Central Warehouse Pune', customer: 'Hyderabad Metro Corp', batch: 'KBATCH-2026-001' },
      { serial: 'AQI-KIT-115', status: 'reserved', location: 'Central Warehouse Pune', customer: 'Chennai Port Authority', batch: 'KBATCH-2026-002' }
    ];

    const createdKits = [];
    for (const ks of kitSpecs) {
      const [kit] = await db.Kit.findOrCreate({
        where: { kit_serial_number: ks.serial },
        defaults: {
          kit_batch_id: kitBatches[ks.batch].id,
          kit_serial_number: ks.serial,
          kit_status: ks.status,
          image_available: true,
          customer_name: ks.customer,
          current_location: ks.location,
          deployment_date: ks.status === 'deployed' ? '2026-02-15' : null
        }
      });
      createdKits.push(kit);
    }
    summary.kits = createdKits.length;
    console.log(`✅ Kits seeded (${summary.kits} kits).`);

    // 5. Deployments
    const deployedKits = createdKits.filter(k => k.kit_status === 'deployed');
    const techUser1 = users['john.doe@pritomatic.com']?.id || 1;
    const techUser2 = users['robert.b@pritomatic.com']?.id || 1;
    const techUser3 = users['vikram.s@pritomatic.com']?.id || 1;
    const clientUser1 = users['emily.d@govt.in']?.id || 1;
    const clientUser2 = users['rajesh.patil@punecorp.gov.in']?.id || 1;

    for (let i = 0; i < deployedKits.length; i++) {
      const kit = deployedKits[i];
      const assignedTech = i % 3 === 0 ? techUser1 : (i % 3 === 1 ? techUser2 : techUser3);
      const client = i % 2 === 0 ? clientUser1 : clientUser2;

      await db.Deployment.findOrCreate({
        where: { kit_id: kit.id },
        defaults: {
          kit_id: kit.id,
          deployed_for_user_id: client,
          assigned_technician_id: assignedTech,
          deployment_location: kit.current_location,
          installation_date: new Date('2026-02-15'),
          deployment_status: i === 6 ? 'maintenance' : 'active'
        }
      });
    }
    summary.deployments = deployedKits.length;

    // 6. Orders & Order Status Logs
    const orderConfigs = [
      { num: 'ORD-2026-001', kitIdx: 0, user: clientUser1, status: 'delivered', customer: 'Dr. Emily Davis', company: 'State Pollution Control Board', incharge: 'K. S. Verma', address: 'Civil Lines, Delhi' },
      { num: 'ORD-2026-002', kitIdx: 1, user: clientUser2, status: 'delivered', customer: 'Rajesh Patil', company: 'Pune Municipal Corporation', incharge: 'S. Kulkarni', address: 'Shivajinagar, Pune' },
      { num: 'ORD-2026-003', kitIdx: 2, user: clientUser2, status: 'shipped', customer: 'Rajesh Patil', company: 'Pune Municipal Corporation', incharge: 'A. Joshi', address: 'Kothrud, Pune' },
      { num: 'ORD-2026-004', kitIdx: 3, user: clientUser1, status: 'out_for_delivery', customer: 'Dr. Emily Davis', company: 'Maharashtra Pollution Board', incharge: 'M. Shinde', address: 'BKC, Mumbai' },
      { num: 'ORD-2026-005', kitIdx: 4, user: clientUser1, status: 'order_confirmed', customer: 'Dr. Emily Davis', company: 'BEST Transport Corp', incharge: 'P. Tawde', address: 'Andheri, Mumbai' },
      { num: 'ORD-2026-006', kitIdx: 5, user: clientUser1, status: 'received', customer: 'Dr. Emily Davis', company: 'State Pollution Control Board', incharge: 'N. Tyagi', address: 'Connaught Place, Delhi' }
    ];

    const createdOrders = [];
    for (const oc of orderConfigs) {
      const kit = createdKits[oc.kitIdx];
      const [order] = await db.Order.findOrCreate({
        where: { order_number: oc.num },
        defaults: {
          order_number: oc.num,
          ordered_by_user_id: oc.user,
          kit_id: kit.id,
          current_order_status: oc.status,
          customer_name: oc.customer,
          company: oc.company,
          office_incharge: oc.incharge,
          shipping_address: oc.address,
          ordered_at: new Date('2026-02-01'),
          delivered_at: oc.status === 'delivered' ? new Date('2026-02-15') : null
        }
      });
      createdOrders.push(order);

      // Status logs
      await db.OrderStatusLog.findOrCreate({
        where: { order_id: order.id, order_status: oc.status },
        defaults: {
          order_id: order.id,
          order_status: oc.status,
          status_remarks: `Order transitioned to ${oc.status}`,
          status_updated_at: new Date()
        }
      });
    }
    summary.orders = createdOrders.length;

    // 7. Transactions
    const txMethods = ['Bank Transfer', 'UPI', 'Credit Card', 'NEFT', 'Bank Transfer', 'UPI'];
    const txAmounts = [45000.00, 45000.00, 38000.00, 42000.00, 45000.00, 40000.00];

    for (let i = 0; i < createdOrders.length; i++) {
      const ord = createdOrders[i];
      const isPaid = i < 4;
      await db.Transaction.findOrCreate({
        where: { order_id: ord.id },
        defaults: {
          order_id: ord.id,
          transaction_id: `TXN-2026-00${i + 1}`,
          utr_no: `UTR9876543200${i + 1}`,
          customer_name: ord.customer_name,
          amount: txAmounts[i],
          currency: 'INR',
          payment_status: isPaid ? 'completed' : 'pending',
          payment_method: txMethods[i],
          transaction_date: new Date('2026-02-02')
        }
      });
    }
    summary.transactions = createdOrders.length;

    // 8. Tickets (8 tickets)
    const ticketConfigs = [
      { kitIdx: 0, type: 'installation', status: 'completed', prio: 'High', desc: 'Pole mounting & sensor telemetry calibration', remarks: 'Calibrated baseline OK', tech: techUser1 },
      { kitIdx: 1, type: 'installation', status: 'completed', prio: 'Medium', desc: 'Solar battery & inverter hookup', remarks: 'Power stability verified', tech: techUser1 },
      { kitIdx: 2, type: 'installation', status: 'deployed', prio: 'Medium', desc: 'Transit roof rack mounting', remarks: 'Vehicle vibration test passed', tech: techUser2 },
      { kitIdx: 3, type: 'maintenance', status: 'in_progress', prio: 'High', desc: 'Laser PM2.5 sensor optic cleaning', remarks: 'Technician on-site', tech: techUser2 },
      { kitIdx: 4, type: 'maintenance', status: 'assigned', prio: 'Medium', desc: 'Routine 30-day filter check', remarks: 'Scheduled for tomorrow', tech: techUser2 },
      { kitIdx: 5, type: 'installation', status: 'completed', prio: 'High', desc: 'Central Delhi pole mount', remarks: 'GPS and cellular lock established', tech: techUser3 },
      { kitIdx: 6, type: 'maintenance', status: 'in_progress', prio: 'High', desc: 'CO2 zero-point recalibration', remarks: 'Zero-gas test in progress', tech: techUser3 },
      { kitIdx: 7, type: 'maintenance', status: 'closed', prio: 'Low', desc: 'Weather shield bolt tightening', remarks: 'Resolved and closed', tech: techUser1 }
    ];

    const createdTickets = [];
    for (let i = 0; i < ticketConfigs.length; i++) {
      const tc = ticketConfigs[i];
      const kit = createdKits[tc.kitIdx];
      const ord = createdOrders[i % createdOrders.length];

      const [ticket] = await db.Ticket.findOrCreate({
        where: { kit_id: kit.id, issue_description: tc.desc },
        defaults: {
          ticket_type: tc.type,
          kit_id: kit.id,
          created_by_user_id: users['admin@pritomatic.com']?.id || 1,
          assigned_technician_id: tc.tech,
          order_id: ord.id,
          ticket_status: tc.status,
          issue_description: tc.desc,
          closing_remarks: tc.remarks,
          priority: tc.prio
        }
      });
      createdTickets.push(ticket);

      // Ticket logs
      await db.TicketLog.findOrCreate({
        where: { ticket_id: ticket.id, action_taken: 'Inspection performed' },
        defaults: {
          ticket_id: ticket.id,
          action_taken: 'Inspection performed',
          remarks: tc.remarks,
          logged_by_user_id: tc.tech
        }
      });

      // Ticket Image proof
      await db.TicketImage.findOrCreate({
        where: { ticket_id: ticket.id },
        defaults: {
          ticket_id: ticket.id,
          image_url: `/uploads/proof-${(i % 3) + 1}.jpg`,
          uploaded_at: new Date()
        }
      });
    }
    summary.tickets = createdTickets.length;

    // 9. Maintenance Schedules
    for (let i = 0; i < deployedKits.length; i++) {
      const kit = deployedKits[i];
      await db.MaintenanceSchedule.findOrCreate({
        where: { kit_id: kit.id },
        defaults: {
          kit_id: kit.id,
          maintenance_interval_days: 30,
          last_maintenance_date: '2026-02-15',
          next_maintenance_due_date: '2026-03-15',
          schedule_status: i === 6 ? 'paused' : 'active'
        }
      });
    }

    // 10. Device Health Logs
    const healthStatuses = ['online', 'online', 'online', 'online', 'sensor_fault', 'online', 'online', 'online'];
    for (let i = 0; i < deployedKits.length; i++) {
      await db.DeviceHealthLog.create({
        kit_id: deployedKits[i].id,
        health_status: healthStatuses[i],
        recorded_at: new Date()
      });
    }

    // 11. Alerts (10 diverse alerts)
    const alertConfigs = [
      { kitIdx: 3, cat: 'sensor_issue', desc: 'PM2.5 optic chamber high dust warning on BKC Kit', status: 'open' },
      { kitIdx: 6, cat: 'maintenance', desc: 'Scheduled calibration due for Anand Vihar ISBT Kit', status: 'open' },
      { kitIdx: 0, cat: 'sla', desc: 'Installation SLA achieved on-time for Shivajinagar Pole', status: 'resolved' },
      { kitIdx: 1, cat: 'order', desc: 'Order ORD-2026-002 dispatched to Pune Municipal Corp', status: 'resolved' },
      { kitIdx: 2, cat: 'repair', desc: 'Vibration dampener replaced on transit bus roof unit', status: 'resolved' },
      { kitIdx: 4, cat: 'ticket', desc: 'Maintenance ticket created for BEST Andheri depot inspection', status: 'open' },
      { kitIdx: 5, cat: 'inventory', desc: 'Sensor batch SBATCH-2026-001 allocated 40 units', status: 'resolved' },
      { kitIdx: 7, cat: 'maintenance', desc: 'Routine preventative check completed for Whitefield ITPL', status: 'resolved' }
    ];

    for (const ac of alertConfigs) {
      const kit = createdKits[ac.kitIdx];
      await db.Alert.findOrCreate({
        where: { kit_id: kit.id, alert_description: ac.desc },
        defaults: {
          kit_id: kit.id,
          alert_category: ac.cat,
          alert_description: ac.desc,
          alert_status: ac.status
        }
      });
    }
    summary.alerts = alertConfigs.length;

    // 12. AQI Readings (Hourly history for all deployed kits)
    let readingCount = 0;
    const now = Date.now();
    for (const kit of deployedKits) {
      const readings = [];
      const isDelhi = kit.current_location.includes('Delhi');
      const isMumbai = kit.current_location.includes('Mumbai');
      const basePM25 = isDelhi ? 130 : (isMumbai ? 85 : 55);

      for (let h = 0; h < 16; h++) {
        const time = new Date(now - h * 3600 * 1000);
        const pm25 = Math.max(15, Math.round(basePM25 + Math.sin(h / 2) * 25 + (Math.random() * 15 - 7)));
        const pm10 = Math.round(pm25 * 1.6);
        const aqi = Math.round(pm25 * 1.25);

        readings.push({
          kit_id: kit.id,
          pm25: pm25,
          pm10: pm10,
          co: parseFloat((0.5 + Math.random() * 0.5).toFixed(2)),
          no2: parseFloat((20 + Math.random() * 20).toFixed(1)),
          o3: parseFloat((10 + Math.random() * 15).toFixed(1)),
          calculated_aqi: aqi,
          recorded_at: time
        });
      }
      await db.AQIReading.bulkCreate(readings);
      readingCount += readings.length;
    }
    summary.readings = readingCount;

    // 13. SLA Tracking & Performance
    const slaConfigs = [
      { ticket: createdTickets[0], tech: 'John Doe', status: 'Completed', type: 'Installation' },
      { ticket: createdTickets[1], tech: 'John Doe', status: 'Completed', type: 'Installation' },
      { ticket: createdTickets[2], tech: 'Robert Brown', status: 'Completed', type: 'Installation' },
      { ticket: createdTickets[3], tech: 'Robert Brown', status: 'On Track', type: 'Maintenance' },
      { ticket: createdTickets[4], tech: 'Robert Brown', status: 'On Track', type: 'Maintenance' },
      { ticket: createdTickets[5], tech: 'Vikram Singh', status: 'Completed', type: 'Installation' },
      { ticket: createdTickets[6], tech: 'Vikram Singh', status: 'Breach', type: 'Maintenance' }
    ];

    for (const sc of slaConfigs) {
      await db.SlaTracking.findOrCreate({
        where: { ticketId: String(sc.ticket.id) },
        defaults: {
          ticketId: String(sc.ticket.id),
          assigned: 'Admin Operations',
          assignedTo: sc.tech,
          assignedDate: '2026-02-15',
          estimatedCompletionDate: '2026-02-18',
          status: sc.status,
          ticketType: sc.type
        }
      });
    }

    // SLA Performance
    const techScores = [
      { name: 'John Doe', comp: 18, pend: 2, install: 12, maint: 8, score: 95 },
      { name: 'Robert Brown', comp: 14, pend: 3, install: 9, maint: 8, score: 88 },
      { name: 'Vikram Singh', comp: 16, pend: 1, install: 10, maint: 7, score: 92 }
    ];

    for (const ts of techScores) {
      await db.SlaPerformance.findOrCreate({
        where: { technicianName: ts.name },
        defaults: {
          technicianName: ts.name,
          completedTickets: ts.comp,
          pendingTickets: ts.pend,
          installationTicketCount: ts.install,
          maintenanceTicketCount: ts.maint,
          performanceScore: ts.score
        }
      });
    }

    // 14. Reports
    const reportConfigs = [
      { user: clientUser1, type: 'aqi_summary', url: '/reports/monthly-aqi-summary-feb2026.pdf' },
      { user: clientUser1, type: 'compliance', url: '/reports/cpcb-compliance-q1-2026.pdf' },
      { user: clientUser2, type: 'deployment', url: '/reports/pmc-deployment-audit.pdf' },
      { user: clientUser2, type: 'maintenance', url: '/reports/maintenance-log-feb2026.pdf' }
    ];

    for (const rc of reportConfigs) {
      await db.Report.findOrCreate({
        where: { file_url: rc.url },
        defaults: {
          generated_for_user_id: rc.user,
          report_type: rc.type,
          file_url: rc.url,
          generated_at: new Date()
        }
      });
    }
    summary.reports = reportConfigs.length;

    console.log('✨ Comprehensive dummy data for all modules seeded successfully!');
    return { success: true, summary };
  } catch (err) {
    console.error('❌ Error during database seeding:', err);
    throw err;
  }
}

module.exports = { seedAll };
