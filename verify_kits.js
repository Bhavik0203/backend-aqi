const db = require('./models');

async function checkKits() {
    try {
        const kits = await db.Kit.findAll();
        console.log(`Total Kits Found: ${kits.length}`);
        kits.forEach(k => {
            console.log(`- ID: ${k.id}, Serial: ${k.kit_serial_number}, Status: ${k.kit_status}`);
        });
    } catch (error) {
        console.error("Error fetching kits:", error);
    } finally {
        // await db.sequelize.close(); // Keep connection open or close depending on how models are set up
    }
}

checkKits();
