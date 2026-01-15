const db = require('./models');

async function fixNullConstraint() {
    try {
        console.log('Altering tickets table to allow NULL in created_by_user_id...');

         await db.sequelize.query('ALTER TABLE "tickets" ALTER COLUMN "created_by_user_id" DROP NOT NULL;');

        console.log('Successfully dropped NOT NULL constraint from created_by_user_id.');

      
        const tableInfo = await db.sequelize.getQueryInterface().describeTable('tickets');
        console.log('created_by_user_id info:', tableInfo.created_by_user_id);

    } catch (error) {
        console.error('Error altering table:', error);
    } finally {
        process.exit();
    }
}

fixNullConstraint();
