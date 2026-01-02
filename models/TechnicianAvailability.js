module.exports = (sequelize, DataTypes) => {
  const TechnicianAvailability = sequelize.define('TechnicianAvailability', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    technician_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    availability_status: {
      type: DataTypes.ENUM('available', 'on_duty', 'unavailable'),
      allowNull: false,
      defaultValue: 'available'
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'technician_availability',
    timestamps: false,
    underscored: true
  });

  return TechnicianAvailability;
};

