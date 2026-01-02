module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ticket_type: {
      type: DataTypes.ENUM('installation', 'maintenance'),
      allowNull: false
    },
    kit_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'kits',
        key: 'id'
      }
    },
    created_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    assigned_technician_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ticket_status: {
      type: DataTypes.ENUM('created', 'assigned', 'in_progress', 'completed', 'closed'),
      allowNull: false,
      defaultValue: 'created'
    }
  }, {
    tableName: 'tickets',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Ticket;
};

