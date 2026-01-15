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

async function addColumns() {
    const queryInterface = sequelize.getQueryInterface();
    const table = 'orders';

    const columnsToAdd = [
        { name: 'state', type: DataTypes.STRING },
        { name: 'pincode', type: DataTypes.STRING }
    ];

    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        for (const col of columnsToAdd) {
            try {
                await queryInterface.addColumn(table, col.name, {
                    type: col.type,
                    allowNull: true
                });
                console.log(`✅ Added column: ${col.name}`);
            } catch (err) {
                if (err.message && err.message.includes('already exists')) {
                    console.log(`ℹ️ Column ${col.name} already exists.`);
                } else {
                    console.error(`❌ Failed to add column ${col.name}:`, err.message);
                }
            }
        }

    } catch (error) {
        console.error("Database connection error:", error);
    } finally {
        await sequelize.close();
    }
}

addColumns();
