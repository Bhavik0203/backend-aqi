require('dotenv').config();
const db = require('./models');

const updateSchema = async () => {
    try {
        console.log("Updating enum types...");
        try {
            await db.sequelize.query(`ALTER TYPE "enum_deployments_deployment_status" ADD VALUE 'pending';`);
            console.log("Added 'pending' to enum.");
        } catch (e) {
            console.log("'pending' might already exist or error:", e.message);
        }

        try {
            await db.sequelize.query(`ALTER TYPE "enum_deployments_deployment_status" ADD VALUE 'failure';`);
            console.log("Added 'failure' to enum.");
        } catch (e) {
            console.log("'failure' might already exist or error:", e.message);
        }

        console.log("Syncing models...");
        await db.sequelize.sync({ alter: true });
        console.log("Schema updated successfully.");
        process.exit(0);

    } catch (error) {
        console.error("Error updating schema:", error);
        process.exit(1);
    }
};

updateSchema();
