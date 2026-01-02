module.exports = (sequelize, DataTypes) => {
  const TicketImage = sequelize.define('TicketImage', {
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
    image_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uploaded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'ticket_images',
    timestamps: false,
    underscored: true
  });

  return TicketImage;
};

