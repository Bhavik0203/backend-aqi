const firebaseAdmin = require('../config/firebase');

module.exports = (sequelize, DataTypes) => {
  const SlaTracking = sequelize.define('SlaTracking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ticketId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    assigned: {
      type: DataTypes.STRING,
      allowNull: true // Changed to allow null/empty if not provided
    },
    assignedTo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    assignedDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    estimatedCompletionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('On Track', 'Breach', 'Completed'),
      defaultValue: 'On Track'
    },
    ticketType: {
      type: DataTypes.ENUM('Installation', 'Maintenance'),
      defaultValue: 'Installation'
    }
  }, {
    tableName: 'sla_tracking',
    timestamps: true,
    underscored: true,
    hooks: {
      afterCreate: async (tracking, options) => {
        await updateTechnicianPerformance(tracking.assignedTo, sequelize, options);
        await createAlertAndNotify(tracking, 'New SLA Ticket', `New Ticket #${tracking.ticketId} created. Status: ${tracking.status}`, sequelize);
      },
      afterUpdate: async (tracking, options) => {
        if (tracking.changed('status') || tracking.changed('assignedTo')) {
          if (tracking.changed('assignedTo')) {
            // Update previous technician as well
            await updateTechnicianPerformance(tracking.previous('assignedTo'), sequelize, options);
          }
          await updateTechnicianPerformance(tracking.assignedTo, sequelize, options);
        }
        await createAlertAndNotify(tracking, 'SLA Update', `Ticket #${tracking.ticketId} updated. Status: ${tracking.status}`, sequelize);
      }
    }
  });

  const updateTechnicianPerformance = async (technicianName, sequelize, options) => {
    if (!technicianName || technicianName === 'Unassigned') return;

    try {
      const { SlaTracking, SlaPerformance } = sequelize.models;

      const allTracks = await SlaTracking.findAll({
        where: { assignedTo: technicianName },
        transaction: options.transaction
      });

      const completed = allTracks.filter(t => t.status === 'Completed').length;
      const pending = allTracks.filter(t => t.status !== 'Completed').length;
      const installation = allTracks.filter(t => t.ticketType === 'Installation').length;
      const maintenance = allTracks.filter(t => t.ticketType === 'Maintenance').length;

      const total = completed + pending;
      let score = 0;
      if (total > 0) {
        const rate = (completed / total) * 100;
        const penalty = pending * 2;
        score = Math.max(0, Math.min(100, rate - penalty));
      }

      let perf = await SlaPerformance.findOne({ where: { technicianName }, transaction: options.transaction });
      if (!perf) {
        perf = await SlaPerformance.create({
          technicianName,
          completedTickets: completed,
          pendingTickets: pending,
          installationTicketCount: installation,
          maintenanceTicketCount: maintenance,
          performanceScore: Math.round(score)
        }, { transaction: options.transaction });
      } else {
        await perf.update({
          completedTickets: completed,
          pendingTickets: pending,
          installationTicketCount: installation,
          maintenanceTicketCount: maintenance,
          performanceScore: Math.round(score)
        }, { transaction: options.transaction });
      }
    } catch (e) {
      console.error("Error updating SLA performance:", e);
    }
  };

  const createAlertAndNotify = async (tracking, title, body, sequelize) => {
    try {
      const { Alert } = sequelize.models;
      // create alert
      await Alert.create({
        alert_category: 'sla',
        alert_description: body,
        alert_status: 'open',
        kit_id: null
      });

      // FCM
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
        if (firebaseAdmin.messaging) {
          await firebaseAdmin.messaging().send({ topic: 'sla', ...payload });
          await firebaseAdmin.messaging().send({ token: TEST_TOKEN, ...payload });
        }
      } catch (fcmError) {
        console.error('FCM Error in SlaTracking hook:', fcmError.message);
      }

    } catch (e) {
      console.error("Error in SlaTracking Alert/Notify hook:", e);
    }
  };
  return SlaTracking;
};
