module.exports = (sequelize, DataTypes) => {
  const OrderStatusLog = sequelize.define('OrderStatusLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    order_status: {
      type: DataTypes.ENUM('order_confirmed', 'shipped', 'out_for_delivery', 'delivered'),
      allowNull: false
    },
    status_remarks: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'order_status_logs',
    timestamps: false,
    underscored: true
  });

  return OrderStatusLog;
};

