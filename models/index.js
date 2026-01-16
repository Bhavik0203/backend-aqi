const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

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
const Role = require('./Role')(sequelize, DataTypes);
const Permission = require('./Permission')(sequelize, DataTypes);
const RolePermission = require('./RolePermission')(sequelize, DataTypes);
const SlaTracking = require('./SlaTracking')(sequelize, DataTypes);
const SlaPerformance = require('./SlaPerformance')(sequelize, DataTypes);
const Transaction = require('./Transaction')(sequelize, DataTypes);

// RBAC Associations
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id', as: 'permissions' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id', as: 'roles' });

Role.hasMany(UserProfile, { foreignKey: 'role_id', as: 'users' });
UserProfile.belongsTo(Role, { foreignKey: 'role_id', as: 'roleData' }); // roleData to avoid conflict if 'role' field exists

SensorBatch.hasMany(SensorBatchItem, { foreignKey: 'sensor_batch_id', as: 'items' });
SensorBatchItem.belongsTo(SensorBatch, { foreignKey: 'sensor_batch_id', as: 'batch' });

KitBatch.hasMany(Kit, { foreignKey: 'kit_batch_id', as: 'kits' });
Kit.belongsTo(KitBatch, { foreignKey: 'kit_batch_id', as: 'batch' });

Kit.hasMany(Order, { foreignKey: 'kit_id', as: 'orders' });
Order.belongsTo(Kit, { foreignKey: 'kit_id', as: 'kit' });

Order.hasMany(OrderStatusLog, { foreignKey: 'order_id', as: 'statusLogs' });
OrderStatusLog.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Order.hasMany(Transaction, { foreignKey: 'order_id', as: 'transactions' });
Transaction.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Kit.hasMany(Deployment, { foreignKey: 'kit_id', as: 'deployments' });
Deployment.belongsTo(Kit, { foreignKey: 'kit_id', as: 'kit' });
Deployment.belongsTo(UserProfile, { foreignKey: 'deployed_for_user_id', as: 'User' });
Deployment.belongsTo(UserProfile, { foreignKey: 'assigned_technician_id', as: 'technician' });
Deployment.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
Ticket.hasOne(Deployment, { foreignKey: 'ticket_id', as: 'deployment' });

Kit.hasMany(MaintenanceSchedule, { foreignKey: 'kit_id', as: 'maintenanceSchedules' });
MaintenanceSchedule.belongsTo(Kit, { foreignKey: 'kit_id', as: 'kit' });

Kit.hasMany(DeviceHealthLog, { foreignKey: 'kit_id', as: 'healthLogs' });
DeviceHealthLog.belongsTo(Kit, { foreignKey: 'kit_id', as: 'kit' });

Kit.hasMany(Ticket, { foreignKey: 'kit_id', as: 'tickets' });
Ticket.belongsTo(Kit, { foreignKey: 'kit_id', as: 'kit' });

Ticket.hasMany(TicketLog, { foreignKey: 'ticket_id', as: 'logs' });
TicketLog.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

Ticket.belongsTo(UserProfile, { foreignKey: 'created_by_user_id', as: 'creator' });
Ticket.belongsTo(UserProfile, { foreignKey: 'assigned_technician_id', as: 'technician' });


Ticket.hasMany(TicketImage, { foreignKey: 'ticket_id', as: 'images' });
TicketImage.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

Ticket.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Order.hasMany(Ticket, { foreignKey: 'order_id', as: 'tickets' });


Kit.hasMany(Alert, { foreignKey: 'kit_id', as: 'alerts' });
Alert.belongsTo(Kit, { foreignKey: 'kit_id', as: 'kit' });

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
  Report,
  Role,
  Permission,
  RolePermission,
  SlaTracking,
  SlaPerformance,
  Transaction,
};

module.exports = db;

