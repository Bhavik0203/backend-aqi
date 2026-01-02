const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

// Import all models
const UserProfile = require('./UserProfile')(sequelize, DataTypes);
const SensorBatch = require('./SensorBatch')(sequelize, DataTypes);
const SensorBatchItem = require('./SensorBatchItem')(sequelize, DataTypes);
const KitBatch = require('./KitBatch')(sequelize, DataTypes);
const Kit = require('./Kit')(sequelize, DataTypes);
const Order = require('./Order')(sequelize, DataTypes);
const OrderStatusLog = require('./OrderStatusLog')(sequelize, DataTypes);
const Deployment = require('./Deployment')(sequelize, DataTypes);
const MaintenanceSchedule = require('./MaintenanceSchedule')(sequelize, DataTypes);
const TechnicianAvailability = require('./TechnicianAvailability')(sequelize, DataTypes);
const DeviceHealthLog = require('./DeviceHealthLog')(sequelize, DataTypes);
const Ticket = require('./Ticket')(sequelize, DataTypes);
const TicketLog = require('./TicketLog')(sequelize, DataTypes);
const TicketImage = require('./TicketImage')(sequelize, DataTypes);
const Alert = require('./Alert')(sequelize, DataTypes);
const AQIReading = require('./AQIReading')(sequelize, DataTypes);
const Report = require('./Report')(sequelize, DataTypes);

// Define relationships
// Sensor Batches
SensorBatch.hasMany(SensorBatchItem, { foreignKey: 'sensor_batch_id', as: 'items' });
SensorBatchItem.belongsTo(SensorBatch, { foreignKey: 'sensor_batch_id', as: 'batch' });

// Kit Batches
KitBatch.hasMany(Kit, { foreignKey: 'kit_batch_id', as: 'kits' });
Kit.belongsTo(KitBatch, { foreignKey: 'kit_batch_id', as: 'batch' });

// Orders
Kit.hasMany(Order, { foreignKey: 'kit_id', as: 'orders' });
Order.belongsTo(Kit, { foreignKey: 'kit_id', as: 'kit' });

Order.hasMany(OrderStatusLog, { foreignKey: 'order_id', as: 'statusLogs' });
OrderStatusLog.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Deployments
Kit.hasMany(Deployment, { foreignKey: 'kit_id', as: 'deployments' });
Deployment.belongsTo(Kit, { foreignKey: 'kit_id', as: 'kit' });

// Maintenance Schedules
Kit.hasMany(MaintenanceSchedule, { foreignKey: 'kit_id', as: 'maintenanceSchedules' });
MaintenanceSchedule.belongsTo(Kit, { foreignKey: 'kit_id', as: 'kit' });

// Device Health Logs
Kit.hasMany(DeviceHealthLog, { foreignKey: 'kit_id', as: 'healthLogs' });
DeviceHealthLog.belongsTo(Kit, { foreignKey: 'kit_id', as: 'kit' });

// Tickets
Kit.hasMany(Ticket, { foreignKey: 'kit_id', as: 'tickets' });
Ticket.belongsTo(Kit, { foreignKey: 'kit_id', as: 'kit' });

Ticket.hasMany(TicketLog, { foreignKey: 'ticket_id', as: 'logs' });
TicketLog.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

Ticket.hasMany(TicketImage, { foreignKey: 'ticket_id', as: 'images' });
TicketImage.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

// Alerts
Kit.hasMany(Alert, { foreignKey: 'kit_id', as: 'alerts' });
Alert.belongsTo(Kit, { foreignKey: 'kit_id', as: 'kit' });

// AQI Readings
Kit.hasMany(AQIReading, { foreignKey: 'kit_id', as: 'readings' });
AQIReading.belongsTo(Kit, { foreignKey: 'kit_id', as: 'kit' });

const db = {
  sequelize,
  Sequelize: require('sequelize'),
  UserProfile,
  SensorBatch,
  SensorBatchItem,
  KitBatch,
  Kit,
  Order,
  OrderStatusLog,
  Deployment,
  MaintenanceSchedule,
  TechnicianAvailability,
  DeviceHealthLog,
  Ticket,
  TicketLog,
  TicketImage,
  Alert,
  AQIReading,
  Report
};

module.exports = db;

