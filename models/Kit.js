module.exports = (sequelize, DataTypes) => {
  const Kit = sequelize.define('Kit', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    kit_batch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'kit_batches',
        key: 'id'
      }
    },
    kit_serial_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    kit_status: {
      type: DataTypes.ENUM('available', 'reserved', 'deployed'),
      allowNull: false,
      defaultValue: 'available'
    },
    image_available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    image_missing_reason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    current_location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    deployment_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    tableName: 'kits',
    timestamps: false,
    underscored: true
  });

  return Kit;
};

