module.exports = (sequelize, DataTypes) => {
  const AQIReading = sequelize.define('AQIReading', {
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
    pm25: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    pm10: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    co: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    no2: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    o3: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    calculated_aqi: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    recorded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'aqi_readings',
    timestamps: false,
    underscored: true
  });

  return AQIReading;
};

