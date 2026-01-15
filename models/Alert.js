module.exports = (sequelize, DataTypes) => {
  const Alert = sequelize.define('Alert', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    kit_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'kits',
        key: 'id'
      }
    },
    alert_category: {
      type: DataTypes.ENUM('repair', 'maintenance', 'sensor_issue', 'order', 'ticket', 'user', 'inventory', 'deployment', 'sla'),
      allowNull: false
    },
    alert_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    alert_status: {
      type: DataTypes.ENUM('open', 'resolved'),
      allowNull: false,
      defaultValue: 'open'
    }
  }, {
    tableName: 'alerts',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Alert;
};

