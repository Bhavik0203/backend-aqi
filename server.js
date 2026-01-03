const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('📝 Please create a .env file with your database credentials.');
  console.log('💡 You can copy env.template to .env and update the values:');
  console.log('   cp env.template .env');
  console.log('\nRequired environment variables:');
  console.log('  - DB_HOST (default: localhost)');
  console.log('  - DB_PORT (default: 5432)');
  console.log('  - DB_NAME (default: pritomatic_aqi)');
  console.log('  - DB_USER (default: postgres)');
  console.log('  - DB_PASSWORD (your PostgreSQL password)');
  process.exit(1);
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./models');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PRITOMATIC-AQI Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      userProfiles: '/api/user-profiles',
      sensorBatches: '/api/sensor-batches',
      kitBatches: '/api/kit-batches',
      kits: '/api/kits',
      orders: '/api/orders',
      deployments: '/api/deployments',
      tickets: '/api/tickets',
      aqiReadings: '/api/aqi-readings',
      alerts: '/api/alerts',
      maintenanceSchedules: '/api/maintenance-schedules',
      deviceHealth: '/api/device-health',
      technicians: '/api/technicians',
      reports: '/api/reports'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync database in development (defaults to true unless SYNC_DB=false)
    const isDev = (process.env.NODE_ENV || 'development') === 'development';
    if (isDev && process.env.SYNC_DB !== 'false') {
      await db.sequelize.sync({ alter: true });
      console.log('✅ Database synchronized.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('\n❌ Unable to start server!\n');

    if (error.name === 'SequelizeConnectionError') {
      console.error('📊 Database Connection Error:');
      console.error('   The server could not connect to PostgreSQL.\n');
      console.error('🔍 Please check:');
      console.error('   1. PostgreSQL is running');
      console.error('   2. Database credentials in .env file are correct');
      console.error('   3. Database "' + (process.env.DB_NAME || 'pritomatic_aqi') + '" exists');
      console.error('   4. User "' + (process.env.DB_USER || 'postgres') + '" has proper permissions\n');
      console.error('💡 To create the database, run:');
      console.error('   createdb ' + (process.env.DB_NAME || 'pritomatic_aqi'));
      console.error('\n📝 Current database configuration:');
      console.error('   Host: ' + (process.env.DB_HOST || 'localhost'));
      console.error('   Port: ' + (process.env.DB_PORT || 5432));
      console.error('   Database: ' + (process.env.DB_NAME || 'pritomatic_aqi'));
      console.error('   User: ' + (process.env.DB_USER || 'postgres'));
      console.error('   Password: ' + (process.env.DB_PASSWORD ? '***' : 'NOT SET') + '\n');
    } else {
      console.error('Error details:', error.message);
    }

    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await db.sequelize.close();
  process.exit(0);
});

module.exports = app;

