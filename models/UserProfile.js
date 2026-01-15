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
      allowNull: true // Changed to allow null or we can remove it if we don't have Users table
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for existing users momentarily, but ideally false
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // role: {
    //   type: DataTypes.STRING,
    //   defaultValue: 'User'
    // },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Initially nullable for migration, strictly should be false later
      references: {
        model: 'roles',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    status: {
      type: DataTypes.ENUM('On Duty', 'Available', 'On Leave'),
      defaultValue: 'Available'
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

