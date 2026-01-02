module.exports = (sequelize, DataTypes) => {
  const Deployment = sequelize.define('Deployment', {
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
    deployed_for_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    assigned_technician_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deployment_location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    installation_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deployment_status: {
      type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
      allowNull: false,
      defaultValue: 'active'
    }
  }, {
    tableName: 'deployments',
    timestamps: false,
    underscored: true
  });

  return Deployment;
};

