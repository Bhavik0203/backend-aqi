const db = require('./models');

const syncDatabase = async () => {
    try {
        console.log('Attempting to sync database...');
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

        // Check connection first
        await db.sequelize.authenticate();
        console.log('✅ Database connection successful.');

        // Sync all models
        // alter: true will match the database state to the models
        await db.sequelize.sync({ alter: true });
        console.log('✅ Database tables created/synchronized successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error syncing database:', error);
        process.exit(1);
    }
};

syncDatabase();
