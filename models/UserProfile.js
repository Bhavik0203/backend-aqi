module.exports = (sequelize, DataTypes) => {
  const UserProfile = sequelize.define('UserProfile', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false
    },
    profile_image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    organization_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    organization_type: {
      type: DataTypes.ENUM('government', 'private', 'individual'),
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
    country: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'user_profiles',
    timestamps: true,
    underscored: true
  });

  return UserProfile;
};

