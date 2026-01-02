module.exports = (sequelize, DataTypes) => {
  const MaintenanceSchedule = sequelize.define('MaintenanceSchedule', {
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
    maintenance_interval_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30
    },
    last_maintenance_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    next_maintenance_due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    schedule_status: {
      type: DataTypes.ENUM('active', 'paused'),
      allowNull: false,
      defaultValue: 'active'
    }
  }, {
    tableName: 'maintenance_schedules',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return MaintenanceSchedule;
};

