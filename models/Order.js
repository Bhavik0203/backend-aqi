module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    ordered_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    kit_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'kits',
        key: 'id'
      }
    },
    current_order_status: {
      type: DataTypes.ENUM('order_confirmed', 'shipped', 'out_for_delivery', 'delivered'),
      allowNull: false,
      defaultValue: 'order_confirmed'
    },
    ordered_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'orders',
    timestamps: false,
    underscored: true
  });

  return Order;
};

