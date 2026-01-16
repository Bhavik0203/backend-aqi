const db = require('./models');

(async () => {
    try {
        console.log('🔄 Updating ENUM type for "deployed"...');
        await db.sequelize.authenticate();
        console.log('✅ Connected to database.');

        // Add value to ENUM type if it doesn't exist
        await db.sequelize.query(`
           ALTER TYPE "enum_tickets_ticket_status" ADD VALUE IF NOT EXISTS 'deployed';
        `);

        console.log('✅ Added "deployed" to ticket_status enum!');
        process.exit(0);
    } catch (error) {
        console.error('❌ SQL Failed:', error);
        process.exit(1);
    }
})();
