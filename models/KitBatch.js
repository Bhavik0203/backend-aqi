module.exports = (sequelize, DataTypes) => {
  const KitBatch = sequelize.define('KitBatch', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    kit_batch_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    total_kits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    assembly_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    assembled_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    assembly_status: {
      type: DataTypes.ENUM('in_progress', 'completed', 'on_hold'),
      allowNull: false,
      defaultValue: 'in_progress'
    },
    allocated_kits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    remaining_kits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'kit_batches',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return KitBatch;
};

