# Database Setup Guide

## Quick Setup Steps

### 1. Create .env File

Copy the template and create your `.env` file:

```bash
cp env.template .env
```

### 2. Update .env with Your PostgreSQL Credentials

Edit the `.env` file and update these values:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pritomatic_aqi
DB_USER=postgres
DB_PASSWORD=your_actual_password_here
```

**Important**: Replace `your_actual_password_here` with your actual PostgreSQL password.

### 3. Create the Database

#### Option A: Using psql (Command Line)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE pritomatic_aqi;

# Exit psql
\q
```

#### Option B: Using createdb Command

```bash
createdb -U postgres pritomatic_aqi
```

#### Option C: Using pgAdmin

1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" > "Database"
4. Name it `pritomatic_aqi`
5. Click "Save"

### 4. Verify Database Connection

Test your connection:

```bash
psql -U postgres -d pritomatic_aqi
```

If you can connect, you're all set!

### 5. Start the Server

```bash
npm run dev
```

The server will automatically:
- Connect to the database
- Create/update tables if `SYNC_DB=true` in `.env`

## Common Issues

### Issue: "password authentication failed"

**Solution**: 
- Check your PostgreSQL password in the `.env` file
- Verify the password is correct (no extra spaces)
- Try resetting your PostgreSQL password if needed

### Issue: "database does not exist"

**Solution**:
- Create the database using one of the methods above
- Verify the database name in `.env` matches the created database

### Issue: "connection refused"

**Solution**:
- Make sure PostgreSQL is running
- Check if PostgreSQL is listening on the correct port (default: 5432)
- Verify `DB_HOST` and `DB_PORT` in `.env`

### Issue: "permission denied"

**Solution**:
- Ensure the PostgreSQL user has proper permissions
- You may need to grant privileges:
  ```sql
  GRANT ALL PRIVILEGES ON DATABASE pritomatic_aqi TO postgres;
  ```

## PostgreSQL Installation

If you don't have PostgreSQL installed:

### Windows
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` user
4. Use that password in your `.env` file

### macOS
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Database Sync Options

### Development (Auto-sync)
Set in `.env`:
```env
SYNC_DB=true
NODE_ENV=development
```

This will automatically create/update tables when the server starts.

### Production (Migrations)
Set in `.env`:
```env
SYNC_DB=false
NODE_ENV=production
```

Use Sequelize migrations instead:
```bash
npx sequelize-cli migration:generate --name create-tables
npm run db:migrate
```

## Testing the Connection

Once everything is set up, you should see:

```
✅ Database connection established successfully.
🚀 Server is running on port 3000
📡 API available at http://localhost:3000/api
```

If you see errors, check the error message for specific guidance.

