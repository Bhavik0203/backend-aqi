const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./models');

async function addClosingRemarksColumn() {
    try {
        await db.sequelize.authenticate();
        console.log('Database connection hash been established successfully.');

       
        await db.sequelize.query(`
      ALTER TABLE tickets
      ADD COLUMN IF NOT EXISTS closing_remarks TEXT;
    `);

        console.log('Added closing_remarks column to tickets table.');
    } catch (error) {
        console.error('Unable to update database:', error);
    } finally {
        process.exit();
    }
}

addClosingRemarksColumn();
