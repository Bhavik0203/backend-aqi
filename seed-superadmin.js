const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./models');
const bcrypt = require('bcryptjs');

async function seedSuperAdmin() {
    try {
        await db.sequelize.authenticate();
        console.log('Database connection established.');

        const email = 'admin@pritomatic.com';
        const password = 'Pritomatic@123';

        // Check if role exists
        let adminRole = await db.Role.findOne({ where: { label: 'Administrator' } });
        if (!adminRole) {
            console.log('Creating Administrator role...');
            adminRole = await db.Role.create({ key: 'administrator', label: 'Administrator', description: 'Super Admin' });
        }

        // Check if user exists
        let user = await db.UserProfile.findOne({ where: { email } });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (user) {
            console.log('Updating existing Admin user password...');
            await user.update({
                password: hashedPassword,
                role_id: adminRole.id
            });
        } else {
            console.log('Creating new Admin user...');
            await db.UserProfile.create({
                first_name: 'Super',
                last_name: 'Admin',
                email: email,
                password: hashedPassword,
                role_id: adminRole.id,
                status: 'Available'
            });
        }

        console.log('Super Admin seeded successfully.');
    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        process.exit();
    }
}

seedSuperAdmin();
