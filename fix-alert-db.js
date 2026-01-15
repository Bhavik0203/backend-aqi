const db = require('./models');

const fixSchema = async () => {
    try {
        console.log('🔄 Connecting to database...');
        await db.sequelize.authenticate();
        console.log('✅ Connected.');

        console.log('🛠️ Atempting to DROP NOT NULL constraint on alerts.kit_id...');

        await db.sequelize.query('ALTER TABLE alerts ALTER COLUMN kit_id DROP NOT NULL;');

        console.log('✅ Successfully altered table schema. "kit_id" should now accept NULL.');
    } catch (error) {
        console.error('❌ Error updating schema:', error.message);
        console.error('   (If the error says "column cannot be cast", ignore it. If it says "relation does not exist", check table names.)');
    } finally {
        await db.sequelize.close();
    }
};

fixSchema();
