module.exports = (sequelize, DataTypes) => {
  const SensorBatchItem = sequelize.define('SensorBatchItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sensor_batch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sensor_batches',
        key: 'id'
      }
    },
    sensor_item_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    item_status: {
      type: DataTypes.ENUM('available', 'allocated'),
      allowNull: false,
      defaultValue: 'available'
    },
    received_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    allocated_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    current_location: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'sensor_batch_items',
    timestamps: false,
    underscored: true
  });

  return SensorBatchItem;
};

