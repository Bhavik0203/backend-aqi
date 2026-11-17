const fs = require('fs');
const path = require('path');

// Only require a physical .env file locally. On Render, variables come from the dashboard.
const envPath = path.join(__dirname, '.env');
if (process.env.NODE_ENV !== 'production' && !fs.existsSync(envPath)) {
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
require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Mahatech -AQI Platform API',
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
      reports: '/api/reports',
      slaTracking: '/api/sla/tracking',
      slaPerformance: '/api/sla/performance'
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

    // Set SYNC_DB=true to create/update tables (use for the first deploy, then set to false)
    if (process.env.SYNC_DB === 'true') {
      await db.sequelize.sync({ alter: true });
      console.log('✅ Database synchronized.');
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 API available at /api`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error('\n❌ Port already in use!\n');
        console.error(`   Port ${PORT} is already being used by another process.\n`);
        console.error('🔍 To fix this, you can:');
        console.error('   1. Stop the other process using port ' + PORT);
        console.error('   2. Use a different port by setting PORT environment variable');
        console.error('   3. On Windows, find and kill the process:');
        console.error('      netstat -ano | findstr :' + PORT);
        console.error('      taskkill /PID <PID> /F');
        console.error('   4. On Linux/Mac, find and kill the process:');
        console.error('      lsof -ti:' + PORT + ' | xargs kill -9\n');
        process.exit(1);
      } else {
        throw error;
      }
    });
  } catch (error) {
    console.error('\n❌ Unable to start server!\n');

    if (error.name === 'SequelizeConnectionError') {
      console.error('📊 Database Connection Error:');
      console.error('   The server could not connect to PostgreSQL.\n');
      console.error('🔍 Please check:');
      console.error('   1. PostgreSQL is running');
      console.error('   2. Database credentials in environment variables are correct');
      console.error('   3. Database "' + (process.env.DB_NAME || 'pritomatic_aqi') + '" exists');
      console.error('   4. User "' + (process.env.DB_USER || 'postgres') + '" has proper permissions\n');
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
