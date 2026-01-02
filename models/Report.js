module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    generated_for_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    report_type: {
      type: DataTypes.ENUM('aqi_summary', 'compliance', 'deployment', 'maintenance'),
      allowNull: false
    },
    file_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    generated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'reports',
    timestamps: false,
    underscored: true
  });

  return Report;
};

