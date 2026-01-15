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
      type: DataTypes.ENUM('received', 'order_confirmed', 'shipped', 'out_for_delivery', 'delivered'),
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
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true
    },
    office_incharge: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contact_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'orders',
    timestamps: false,
    underscored: true
  });

  return Order;
};

