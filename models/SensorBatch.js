module.exports = (sequelize, DataTypes) => {
  const SensorBatch = sequelize.define('SensorBatch', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sensor_batch_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    supplier_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    total_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    requested_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    received_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    allocated_for_assembly: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    remaining_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    batch_status: {
      type: DataTypes.ENUM('pending', 'received', 'partially_allocated', 'fully_allocated'),
      allowNull: false,
      defaultValue: 'pending'
    }
  }, {
    tableName: 'sensor_batches',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return SensorBatch;
};

