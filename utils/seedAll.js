const db = require('../models');
const bcrypt = require('bcryptjs');

async function seedAll() {
  const summary = {};

  try {
    console.log('🌱 Starting comprehensive database seeding...');

    // 0. Ensure schema is synchronized
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

    console.log('✅ Permissions assigned to roles.');

    // 2. User Profiles
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
        organization_name: 'Field Operations',
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
        organization_name: 'Field Operations',
        address: 'Andheri East, Mumbai'
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
        first_name: 'Michael',
        last_name: 'Wilson',
        email: 'michael.w@public.com',
        phone_number: '+919876543214',
        password: defaultHashedPassword,
        role_id: roles.public_user.id,
        status: 'Available',
        organization_name: 'Public Citizen',
        address: 'Indiranagar, Bangalore'
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
          organization_name: u.organization_name
        });
      } else {
        user = await db.UserProfile.create(u);
      }
      users[u.email] = user;
    }
    summary.users = Object.keys(users).length;
    console.log(`✅ Users seeded (${summary.users} users). Admin: admin@pritomatic.com / Pritomatic@123`);

    // Technician Availability
    if (users['john.doe@pritomatic.com']) {
      await db.TechnicianAvailability.findOrCreate({
        where: { technician_id: users['john.doe@pritomatic.com'].id },
        defaults: {
          availability_status: 'busy',
          last_updated: new Date()
        }
      });
    }
    if (users['robert.b@pritomatic.com']) {
      await db.TechnicianAvailability.findOrCreate({
        where: { technician_id: users['robert.b@pritomatic.com'].id },
        defaults: {
          availability_status: 'available',
          last_updated: new Date()
        }
      });
    }

    // 3. Sensor Batch & Items
    const [sensorBatch] = await db.SensorBatch.findOrCreate({
      where: { sensor_batch_code: 'SBATCH-2026-001' },
      defaults: {
        sensor_batch_code: 'SBATCH-2026-001',
        supplier_name: 'AeroSense Technologies',
        total_quantity: 50,
        requested_date: '2026-01-10',
        received_date: '2026-01-20',
        allocated_for_assembly: 20,
        remaining_quantity: 30,
        batch_status: 'partially_allocated'
      }
    });

    for (let i = 1; i <= 5; i++) {
      await db.SensorBatchItem.findOrCreate({
        where: { sensor_item_code: `SN-ITEM-00${i}` },
        defaults: {
          sensor_batch_id: sensorBatch.id,
          sensor_item_code: `SN-ITEM-00${i}`,
          item_status: i <= 3 ? 'allocated' : 'available',
          received_date: '2026-01-20',
          current_location: 'Central Warehouse Pune'
        }
      });
    }

    // 4. Kit Batch & Kits
    const [kitBatch] = await db.KitBatch.findOrCreate({
      where: { kit_batch_code: 'KBATCH-2026-001' },
      defaults: {
        kit_batch_code: 'KBATCH-2026-001',
        total_kits: 50,
        assembly_date: '2026-02-01',
        assembled_by_user_id: users['john.doe@pritomatic.com']?.id || 1,
        assembly_status: 'completed',
        allocated_kits: 10,
        remaining_kits: 40,
        remarks: 'Batch passed QA check 100%'
      }
    });

    const kitLocations = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai'];
    const createdKits = [];

    for (let i = 1; i <= 10; i++) {
      const serial = `AQI-KIT-10${i}`;
      const isDeployed = i <= 6;
      const status = isDeployed ? 'deployed' : (i === 10 ? 'reserved' : 'available');
      const location = kitLocations[i % kitLocations.length];

      const [kit] = await db.Kit.findOrCreate({
        where: { kit_serial_number: serial },
        defaults: {
          kit_batch_id: kitBatch.id,
          kit_serial_number: serial,
          kit_status: status,
          image_available: true,
          customer_name: isDeployed ? 'Govt Pollution Control' : null,
          current_location: location,
          deployment_date: isDeployed ? '2026-02-15' : null
        }
      });
      createdKits.push(kit);
    }
    summary.kits = createdKits.length;
    console.log(`✅ Kits seeded (${summary.kits} kits).`);

    // 5. Deployments
    const techId = users['john.doe@pritomatic.com']?.id || 1;
    const clientUserId = users['emily.d@govt.in']?.id || 1;
    const deployedKits = createdKits.filter(k => k.kit_status === 'deployed');

    for (const kit of deployedKits) {
      await db.Deployment.findOrCreate({
        where: { kit_id: kit.id },
        defaults: {
          kit_id: kit.id,
          deployed_for_user_id: clientUserId,
          assigned_technician_id: techId,
          deployment_location: `${kit.current_location} Central Junction`,
          installation_date: new Date('2026-02-15'),
          deployment_status: 'active'
        }
      });
    }

    // 6. Orders
    const sampleKit = createdKits[0];
    const [sampleOrder] = await db.Order.findOrCreate({
      where: { order_number: 'ORD-2026-001' },
      defaults: {
        order_number: 'ORD-2026-001',
        ordered_by_user_id: clientUserId,
        kit_id: sampleKit.id,
        current_order_status: 'delivered',
        customer_name: 'Emily Davis',
        company: 'Govt Pollution Control',
        office_incharge: 'Dr. Sharma',
        shipping_address: 'Civil Lines, Delhi',
        ordered_at: new Date('2026-02-01'),
        delivered_at: new Date('2026-02-15')
      }
    });

    await db.OrderStatusLog.findOrCreate({
      where: { order_id: sampleOrder.id, status: 'delivered' },
      defaults: {
        order_id: sampleOrder.id,
        status: 'delivered',
        changed_by_user_id: users['admin@pritomatic.com']?.id || 1,
        remarks: 'Order delivered and verified at site.'
      }
    });

    // 7. Transactions
    await db.Transaction.findOrCreate({
      where: { order_id: sampleOrder.id },
      defaults: {
        order_id: sampleOrder.id,
        transaction_id: 'TXN-2026-001',
        utr_no: 'UTR98765432101',
        customer_name: 'Emily Davis',
        amount: 35000.00,
        currency: 'INR',
        payment_status: 'completed',
        payment_method: 'Bank Transfer',
        transaction_date: new Date('2026-02-02')
      }
    });

    // 8. Tickets
    const [sampleTicket] = await db.Ticket.findOrCreate({
      where: { kit_id: sampleKit.id, ticket_type: 'installation' },
      defaults: {
        ticket_type: 'installation',
        kit_id: sampleKit.id,
        created_by_user_id: users['admin@pritomatic.com']?.id || 1,
        assigned_technician_id: techId,
        order_id: sampleOrder.id,
        ticket_status: 'completed',
        issue_description: 'Initial site setup and kit calibration',
        closing_remarks: 'Calibrated successfully with PM2.5 baseline.',
        priority: 'Medium'
      }
    });

    await db.TicketLog.findOrCreate({
      where: { ticket_id: sampleTicket.id, action_taken: 'Initial deployment' },
      defaults: {
        ticket_id: sampleTicket.id,
        action_taken: 'Initial deployment',
        logged_by_user_id: techId,
        remarks: 'Installed on pole mount at 3.5m height.'
      }
    });

    // 9. Maintenance Schedules
    await db.MaintenanceSchedule.findOrCreate({
      where: { kit_id: sampleKit.id },
      defaults: {
        kit_id: sampleKit.id,
        maintenance_interval_days: 30,
        last_maintenance_date: '2026-02-15',
        next_maintenance_due_date: '2026-03-15',
        schedule_status: 'active'
      }
    });

    // 10. Device Health Logs
    for (const kit of deployedKits) {
      await db.DeviceHealthLog.create({
        kit_id: kit.id,
        health_status: 'online',
        recorded_at: new Date()
      });
    }

    // 11. Alerts
    await db.Alert.findOrCreate({
      where: { kit_id: sampleKit.id, alert_category: 'maintenance' },
      defaults: {
        kit_id: sampleKit.id,
        alert_category: 'maintenance',
        alert_description: `Routine sensor calibration scheduled for ${sampleKit.kit_serial_number}`,
        alert_status: 'open'
      }
    });

    // 12. AQI Readings (Hourly history for deployed kits)
    let readingCount = 0;
    const now = Date.now();
    for (const kit of deployedKits) {
      const readings = [];
      for (let h = 0; h < 12; h++) {
        const time = new Date(now - h * 3600 * 1000);
        const basePM25 = kit.current_location === 'Delhi' ? 140 : (kit.current_location === 'Mumbai' ? 95 : 65);
        const pm25 = Math.round(basePM25 + (Math.random() * 20 - 10));
        const pm10 = Math.round(pm25 * 1.6);
        const aqi = Math.round(pm25 * 1.25);

        readings.push({
          kit_id: kit.id,
          pm25: pm25,
          pm10: pm10,
          co: 0.8 + Math.random() * 0.4,
          no2: 25 + Math.random() * 15,
          o3: 15 + Math.random() * 10,
          calculated_aqi: aqi,
          recorded_at: time
        });
      }
      await db.AQIReading.bulkCreate(readings);
      readingCount += readings.length;
    }
    summary.readings = readingCount;

    // 13. SLA Tracking
    await db.SlaTracking.findOrCreate({
      where: { ticketId: String(sampleTicket.id) },
      defaults: {
        ticketId: String(sampleTicket.id),
        assigned: 'Admin',
        assignedTo: 'John Doe',
        assignedDate: '2026-02-15',
        estimatedCompletionDate: '2026-02-17',
        status: 'Completed',
        ticketType: 'Installation'
      }
    });

    console.log('✨ All dummy data seeded successfully!');
    return { success: true, summary };
  } catch (err) {
    console.error('❌ Error during database seeding:', err);
    throw err;
  }
}

module.exports = { seedAll };
