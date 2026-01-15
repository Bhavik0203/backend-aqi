const db = require('./models');

const run = async () => {
    try {
        console.log('🔄 Connecting to DB...');
       
        const alert = await db.Alert.create({
            alert_category: 'sla',
            alert_description: 'DEBUG: Verification Alert (Can be deleted)',
            alert_status: 'open',
            kit_id: null
        });
        console.log(`✅ SUCCESS: Alert created with ID ${alert.id}.`);
        console.log(`   (Category: ${alert.alert_category}, KitID: ${alert.kit_id})`);

    } catch (e) {
        console.error('❌ FAILURE: Could not create Alert.', e.message);
        console.error('   Details:', e);
    } finally {
        await db.sequelize.close();
    }
};

run();
