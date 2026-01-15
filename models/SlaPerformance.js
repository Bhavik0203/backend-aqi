const firebaseAdmin = require('../config/firebase');

module.exports = (sequelize, DataTypes) => {
  const SlaPerformance = sequelize.define('SlaPerformance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    technicianName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    completedTickets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    pendingTickets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    installationTicketCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    maintenanceTicketCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    performanceScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'sla_performance',
    timestamps: true,
    underscored: true,
    hooks: {
      afterCreate: async (performance, options) => {
        await createPerformanceAlertAndNotify(performance, 'New SLA Metric', `Technician ${performance.technicianName} - Score: ${performance.performanceScore}`, sequelize);
      },
      afterUpdate: async (performance, options) => {
        if (performance.changed('performanceScore')) {
          await createPerformanceAlertAndNotify(performance, 'SLA Score Updated', `Technician ${performance.technicianName} - New Score: ${performance.performanceScore}`, sequelize);
        }
      }
    }
  });

  const createPerformanceAlertAndNotify = async (performance, title, body, sequelize) => {
    try {
      const { Alert } = sequelize.models;
      await Alert.create({
        alert_category: 'sla',
        alert_description: body,
        alert_status: 'open',
        kit_id: null
      });

      const payload = {
        notification: { title, body },
        data: {
          type: 'sla_performance',
          technician: performance.technicianName,
          score: String(performance.performanceScore)
        }
      };
      const TEST_TOKEN = 'dVl3zUSoBu5h0kq9tYDuPe:APA91bEQ2A3yCUyk8vDNcFxGFRuDM9hk6AA_U_8Gp-SPMf5YsG3la1avEA6gw65rCEi9jSye8IxY-KJGi3F_Z_nASRCR9dFG3k03YV4T4v_-3j46N8e948U';

      try {
        if (firebaseAdmin.messaging) {
          await firebaseAdmin.messaging().send({ topic: 'sla_performance', ...payload });
          await firebaseAdmin.messaging().send({ token: TEST_TOKEN, ...payload });
        }
      } catch (fcmError) {
        console.error('FCM Error in SlaPerformance hook:', fcmError.message);
      }
    } catch (e) {
      console.error("Error in SlaPerformance Alert/Notify hook:", e);
    }
  };

  return SlaPerformance;
};
