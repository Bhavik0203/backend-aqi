const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./models');

async function addPasswordColumn() {
    try {
        await db.sequelize.authenticate();
        console.log('Database connection established.');

        await db.sequelize.query(`
      ALTER TABLE user_profiles
      ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    `);

        console.log('Added password column to user_profiles table.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

addPasswordColumn();
