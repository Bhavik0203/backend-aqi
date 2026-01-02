module.exports = (sequelize, DataTypes) => {
  const DeviceHealthLog = sequelize.define('DeviceHealthLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    kit_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'kits',
        key: 'id'
      }
    },
    health_status: {
      type: DataTypes.ENUM('online', 'offline', 'power_issue', 'sensor_fault'),
      allowNull: false
    },
    recorded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'device_health_logs',
    timestamps: false,
    underscored: true
  });

  return DeviceHealthLog;
};

