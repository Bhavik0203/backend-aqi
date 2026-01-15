const db = require('./models');

async function syncDatabase() {
    try {
        console.log('Syncing Transaction model only...');
        await db.Transaction.sync({ alter: true });
        console.log('✅ Transaction model synchronized.');

        
        const tables = await db.sequelize.getQueryInterface().showAllTables();
        if (tables.includes('transactions')) {
            console.log('Validation: transactions table exists.');
        } else {
            console.error('Validation: transactions table still MISSING.');
        }

    } catch (error) {
        console.error('Error syncing database:', error);
    } finally {
        process.exit();
    }
}

syncDatabase();
