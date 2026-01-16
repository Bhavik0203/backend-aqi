const db = require('./models');

(async () => {
    try {
        console.log('🔄 Updating ENUM type...');
        await db.sequelize.authenticate();
        console.log('✅ Connected to database.');

        // Add value to ENUM type if it doesn't exist
        await db.sequelize.query(`
           ALTER TYPE "enum_tickets_ticket_status" ADD VALUE IF NOT EXISTS 'rejected';
        `);

        console.log('✅ Added "rejected" to ticket_status enum!');
        process.exit(0);
    } catch (error) {
        console.error('❌ SQL Failed:', error);
        process.exit(1);
    }
})();
