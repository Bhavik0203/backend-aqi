module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'orders',
                key: 'id'
            }
        },
        transaction_id: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        utr_no: {
            type: DataTypes.STRING,
            allowNull: true
        },
        customer_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING(3),
            allowNull: false,
            defaultValue: 'INR'
        },
        payment_status: {
            type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
            allowNull: false,
            defaultValue: 'pending'
        },
        payment_method: {
            type: DataTypes.STRING,
            allowNull: true // e.g., 'Bank Transfer', 'UPI', 'Credit Card'
        },
        transaction_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        demo1: {
            type: DataTypes.STRING,
            allowNull: true
        },
        demo2: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'transactions',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Transaction;
};
