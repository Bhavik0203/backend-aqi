module.exports = (sequelize, DataTypes) => {
  const TicketLog = sequelize.define('TicketLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tickets',
        key: 'id'
      }
    },
    action_taken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    logged_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'ticket_logs',
    timestamps: false,
    underscored: true
  });

  return TicketLog;
};

