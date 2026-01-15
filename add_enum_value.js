const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'pritomatic_aqi',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: console.log
    }
);

async function updateEnum() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // Postgres specific command to add value to ENUM
        await sequelize.query("ALTER TYPE \"enum_orders_current_order_status\" ADD VALUE IF NOT EXISTS 'received';");
        console.log("✅ Added 'received' to enum_orders_current_order_status");

    } catch (error) {
        console.error("Error updating ENUM:", error);
    } finally {
        await sequelize.close();
    }
}

updateEnum();
