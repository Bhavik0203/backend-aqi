const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'pritomatic_aqi',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false
    }
);

async function checkColumns() {
    try {
        await sequelize.authenticate();
        const [results, metadata] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders';");
        console.log("Columns in 'orders' table:");
        results.forEach(r => console.log(`- ${r.column_name} (${r.data_type})`));
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await sequelize.close();
    }
}

checkColumns();
