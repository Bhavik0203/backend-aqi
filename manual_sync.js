const db = require('./models');

(async () => {
    try {
        console.log('🔄 Starting manual column addition...');
        await db.sequelize.authenticate();
        console.log('✅ Connected to database.');

        // Raw SQL to add column safely
        // Note: Using simpler syntax compatible with Postgres
        await db.sequelize.query(`
           ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "order_id" INTEGER REFERENCES "orders"("id") ON DELETE SET NULL;
        `);

        console.log('✅ Column order_id ensured in tickets table!');
        process.exit(0);
    } catch (error) {
        console.error('❌ SQL Failed:', error);
        process.exit(1);
    }
})();
