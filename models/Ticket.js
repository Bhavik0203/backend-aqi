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
      allowNull: true
    },
    assigned_technician_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ticket_status: {
      type: DataTypes.ENUM('created', 'assigned', 'in_progress', 'completed', 'closed'),
      allowNull: false,
      defaultValue: 'created'
    },
    issue_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    closing_remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High'),
      allowNull: false,
      defaultValue: 'Medium'
    },
    source: {
      type: DataTypes.ENUM('Manual', 'System'),
      allowNull: false,
      defaultValue: 'Manual'
    },
    scheduled_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tickets',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
    hooks: {
      afterCreate: async (ticket, options) => {
        try {
          const { SlaTracking, UserProfile } = sequelize.models;

          let techName = "Unassigned";
          if (ticket.assigned_technician_id) {
            const tech = await UserProfile.findOne({ where: { id: ticket.assigned_technician_id } }); // Note: Using id based on UserProfile definition
            if (tech) techName = `${tech.first_name || ''} ${tech.last_name || ''}`.trim();
          }

          let creatorName = "System";
          if (ticket.created_by_user_id) {
            const creator = await UserProfile.findOne({ where: { id: ticket.created_by_user_id } });
            if (creator) creatorName = `${creator.first_name || ''} ${creator.last_name || ''}`.trim();
          }

          const priorityDays = { 'High': 1, 'Medium': 2, 'Low': 3 };
          const days = priorityDays[ticket.priority] || 3;
          const estimatedDate = new Date();
          estimatedDate.setDate(estimatedDate.getDate() + days);

          await SlaTracking.create({
            ticketId: `TKT-${ticket.id}`,
            assigned: creatorName,
            assignedTo: techName,
            assignedDate: new Date(),
            estimatedCompletionDate: estimatedDate,
            status: 'On Track',
            ticketType: ticket.ticket_type === 'installation' ? 'Installation' : 'Maintenance'
          }, { transaction: options.transaction });
        } catch (error) {
          console.error("Error in Ticket afterCreate hook:", error);
        }
      },
      afterUpdate: async (ticket, options) => {
        try {
          const { SlaTracking, UserProfile } = sequelize.models;
          const tracking = await SlaTracking.findOne({ where: { ticketId: `TKT-${ticket.id}` } });

          if (tracking) {
            const updates = {};

            // Sync Status
            if (['completed', 'closed'].includes(ticket.ticket_status)) {
              updates.status = 'Completed';
            } else if (tracking.status === 'Completed') {
              updates.status = 'On Track';
            }

            // Sync Ticket Type
            if (ticket.changed('ticket_type')) {
              updates.ticketType = ticket.ticket_type === 'installation' ? 'Installation' : 'Maintenance';
            }

            // Sync Priority (Update Estimated Date)
            if (ticket.changed('priority')) {
              const priorityDays = { 'High': 1, 'Medium': 2, 'Low': 3 };
              const days = priorityDays[ticket.priority] || 3;

              // Use created_at if available to keep original timeline, else use now
              const baseDate = ticket.created_at ? new Date(ticket.created_at) : new Date();
              baseDate.setDate(baseDate.getDate() + days);
              updates.estimatedCompletionDate = baseDate;
            }

            // Sync Technician if changed
            if (ticket.changed('assigned_technician_id')) {
              let techName = "Unassigned";
              if (ticket.assigned_technician_id) {
                const tech = await UserProfile.findOne({ where: { id: ticket.assigned_technician_id } });
                if (tech) techName = `${tech.first_name || ''} ${tech.last_name || ''}`.trim();
              }
              updates.assignedTo = techName;
            }

            if (Object.keys(updates).length > 0) {
              await tracking.update(updates, { transaction: options.transaction });
            }
          }
        } catch (error) {
          console.error("Error in Ticket afterUpdate hook:", error);
        }
      }
    }
  });

  return Ticket;
};

