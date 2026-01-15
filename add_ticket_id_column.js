require('dotenv').config();
const { sequelize } = require('./models');

const run = async () => {
    try {
        console.log("Adding ticket_id column...");
        await sequelize.query(`
            ALTER TABLE deployments 
            ADD COLUMN IF NOT EXISTS ticket_id INTEGER;
        `);
        console.log("Added ticket_id column.");

        console.log("Adding foreign key constraint...");
       
        try {
            await sequelize.query(`
                ALTER TABLE deployments 
                ADD CONSTRAINT deployments_ticket_id_fkey 
                FOREIGN KEY (ticket_id) 
                REFERENCES tickets (id)
                ON UPDATE CASCADE 
                ON DELETE SET NULL;
            `);
            console.log("Added foreign key constraint.");
        } catch (err) {
            if (err.parent && err.parent.code === '42710') { // duplicate_object
                console.log("Constraint deployments_ticket_id_fkey already exists.");
            } else {
                throw err;
            }
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
};

run();
