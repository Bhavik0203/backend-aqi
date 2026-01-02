# PRITOMATIC-AQI Platform Backend API

A comprehensive RESTful API backend for the PRITOMATIC-AQI Platform built with Node.js, Express.js, and Sequelize ORM.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Sequelize
- **Database**: PostgreSQL
- **Architecture**: RESTful APIs

## Features

- Complete CRUD operations for all entities
- Sensor batch and kit management
- Order processing and tracking
- Deployment management
- Ticket system for installations and maintenance
- AQI data collection and readings
- Alert management
- Maintenance scheduling
- Device health monitoring
- Technician availability tracking
- Report generation

## Project Structure

```
backend/
├── config/
│   ├── database.js          # Database configuration
│   └── sequelize.js         # Sequelize instance
├── controllers/             # Business logic controllers
│   ├── userProfileController.js
│   ├── sensorBatchController.js
│   ├── kitBatchController.js
│   ├── kitController.js
│   ├── orderController.js
│   ├── deploymentController.js
│   ├── ticketController.js
│   ├── aqiReadingController.js
│   ├── alertController.js
│   ├── maintenanceController.js
│   ├── deviceHealthController.js
│   ├── technicianController.js
│   └── reportController.js
├── middleware/
│   ├── errorHandler.js      # Global error handler
│   └── asyncHandler.js      # Async error wrapper
├── models/                  # Sequelize models
│   ├── index.js            # Model relationships
│   ├── UserProfile.js
│   ├── SensorBatch.js
│   ├── SensorBatchItem.js
│   ├── KitBatch.js
│   ├── Kit.js
│   ├── Order.js
│   ├── OrderStatusLog.js
│   ├── Deployment.js
│   ├── MaintenanceSchedule.js
│   ├── TechnicianAvailability.js
│   ├── DeviceHealthLog.js
│   ├── Ticket.js
│   ├── TicketLog.js
│   ├── TicketImage.js
│   ├── Alert.js
│   ├── AQIReading.js
│   └── Report.js
├── routes/                  # API routes
│   ├── index.js            # Route aggregator
│   └── [entity]Routes.js   # Individual route files
├── server.js                # Main application file
├── package.json
└── .env.example
```

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and configuration.

4. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE pritomatic_aqi;
   ```

5. **Run the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## Database Setup

### Option 1: Auto-sync (Development Only)

Set `SYNC_DB=true` in your `.env` file. This will automatically create/alter tables on server start.

**⚠️ Warning**: Only use this in development. For production, use migrations.

### Option 2: Manual Migration (Recommended)

Use Sequelize CLI to create and run migrations:

```bash
# Install Sequelize CLI globally (if not already installed)
npm install -g sequelize-cli

# Create migration
npx sequelize-cli migration:generate --name create-tables

# Run migrations
npm run db:migrate
```

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Available Endpoints

#### User Profiles
- `GET /api/user-profiles` - Get all profiles
- `GET /api/user-profiles/:id` - Get profile by ID
- `GET /api/user-profiles/user/:userId` - Get profile by user_id
- `POST /api/user-profiles` - Create profile
- `PUT /api/user-profiles/:id` - Update profile
- `DELETE /api/user-profiles/:id` - Delete profile

#### Sensor Batches
- `GET /api/sensor-batches` - Get all batches
- `GET /api/sensor-batches/:id` - Get batch by ID
- `POST /api/sensor-batches` - Create batch
- `PUT /api/sensor-batches/:id` - Update batch
- `DELETE /api/sensor-batches/:id` - Delete batch
- `POST /api/sensor-batches/:id/items` - Add items to batch

#### Kit Batches
- `GET /api/kit-batches` - Get all batches
- `GET /api/kit-batches/:id` - Get batch by ID
- `POST /api/kit-batches` - Create batch
- `PUT /api/kit-batches/:id` - Update batch
- `DELETE /api/kit-batches/:id` - Delete batch

#### Kits
- `GET /api/kits` - Get all kits (query: `?status=available&batch_id=1`)
- `GET /api/kits/:id` - Get kit by ID
- `POST /api/kits` - Create kit
- `PUT /api/kits/:id` - Update kit
- `DELETE /api/kits/:id` - Delete kit

#### Orders
- `GET /api/orders` - Get all orders (query: `?status=delivered&user_id=1`)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

#### Deployments
- `GET /api/deployments` - Get all deployments (query: `?status=active&kit_id=1`)
- `GET /api/deployments/:id` - Get deployment by ID
- `POST /api/deployments` - Create deployment
- `PUT /api/deployments/:id` - Update deployment
- `DELETE /api/deployments/:id` - Delete deployment

#### Tickets
- `GET /api/tickets` - Get all tickets (query: `?status=open&type=maintenance`)
- `GET /api/tickets/:id` - Get ticket by ID
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/logs` - Add log to ticket
- `POST /api/tickets/:id/images` - Add image to ticket
- `DELETE /api/tickets/:id` - Delete ticket

#### AQI Readings
- `GET /api/aqi-readings` - Get all readings (query: `?kit_id=1&start_date=2024-01-01&limit=100`)
- `GET /api/aqi-readings/:id` - Get reading by ID
- `GET /api/aqi-readings/kit/:kitId/latest` - Get latest reading for kit
- `POST /api/aqi-readings` - Create reading
- `POST /api/aqi-readings/bulk` - Bulk create readings
- `DELETE /api/aqi-readings/:id` - Delete reading

#### Alerts
- `GET /api/alerts` - Get all alerts (query: `?status=open&category=maintenance`)
- `GET /api/alerts/:id` - Get alert by ID
- `POST /api/alerts` - Create alert
- `PUT /api/alerts/:id` - Update alert
- `PUT /api/alerts/:id/resolve` - Resolve alert
- `DELETE /api/alerts/:id` - Delete alert

#### Maintenance Schedules
- `GET /api/maintenance-schedules` - Get all schedules
- `GET /api/maintenance-schedules/:id` - Get schedule by ID
- `POST /api/maintenance-schedules` - Create schedule
- `PUT /api/maintenance-schedules/:id` - Update schedule
- `DELETE /api/maintenance-schedules/:id` - Delete schedule

#### Device Health
- `GET /api/device-health` - Get all health logs (query: `?kit_id=1&status=online`)
- `GET /api/device-health/kit/:kitId/latest` - Get latest health status
- `POST /api/device-health` - Create health log
- `DELETE /api/device-health/:id` - Delete health log

#### Technicians
- `GET /api/technicians` - Get all technicians (query: `?status=available`)
- `GET /api/technicians/:id` - Get technician by ID
- `PUT /api/technicians/:id/availability` - Update availability
- `DELETE /api/technicians/:id` - Delete technician record

#### Reports
- `GET /api/reports` - Get all reports (query: `?user_id=1&report_type=aqi_summary`)
- `GET /api/reports/:id` - Get report by ID
- `POST /api/reports` - Create report
- `DELETE /api/reports/:id` - Delete report

#### Health Check
- `GET /api/health` - API health check

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }
}
```

## Example Requests

### Create a Kit Batch
```bash
POST /api/kit-batches
Content-Type: application/json

{
  "kit_batch_code": "BATCH-001",
  "total_kits": 50,
  "assembly_date": "2024-01-15",
  "assembled_by_user_id": 1,
  "assembly_status": "completed"
}
```

### Create an Order
```bash
POST /api/orders
Content-Type: application/json

{
  "order_number": "ORD-001",
  "ordered_by_user_id": 1,
  "kit_id": 1,
  "current_order_status": "order_confirmed"
}
```

### Create AQI Reading
```bash
POST /api/aqi-readings
Content-Type: application/json

{
  "kit_id": 1,
  "pm25": 45.5,
  "pm10": 78.2,
  "co": 1.2,
  "no2": 35.8,
  "o3": 120.5,
  "calculated_aqi": 156
}
```

## Database Schema

The API implements the complete ERD with the following main entities:

- **User Profiles** - User information and organization details
- **Sensor Batches** - Third-party sensor procurement tracking
- **Kit Batches** - In-house kit assembly management
- **Kits** - Individual device kits
- **Orders** - Order management and tracking
- **Deployments** - Device deployment and lifecycle
- **Tickets** - Installation and maintenance tickets
- **AQI Readings** - Air quality data collection
- **Alerts** - System alerts and notifications
- **Maintenance Schedules** - Automated maintenance scheduling
- **Device Health Logs** - Device connectivity and health monitoring
- **Technician Availability** - Technician status tracking
- **Reports** - Generated reports for compliance and analysis

## Development

### Running in Development Mode
```bash
npm run dev
```

### Database Synchronization
For development, you can enable auto-sync by setting `SYNC_DB=true` in `.env`. This will automatically create/update tables based on your models.

### Code Structure
- **Controllers**: Handle business logic and database operations
- **Routes**: Define API endpoints and map to controllers
- **Models**: Define database schema and relationships
- **Middleware**: Error handling and request processing

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use database migrations instead of auto-sync
3. Set up proper database connection pooling
4. Configure CORS for your frontend domain
5. Use environment variables for all sensitive data
6. Set up proper logging and monitoring

## License

ISC

## Support

For issues and questions, please contact the development team.

