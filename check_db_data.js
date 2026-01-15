const db = require('./models');

async function checkData() {
    try {
        const kits = await db.Kit.findAll({ limit: 5 });
        console.log('Kits:', kits.map(k => ({ id: k.id, serial: k.kit_serial_number })));

        const users = await db.UserProfile.findAll({ limit: 5 });
        console.log('Users:', users.map(u => ({ id: u.id, name: u.first_name })));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkData();
