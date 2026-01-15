const db = require('./models');

const seedData = async () => {
    try {
        console.log('🌱 Seeding database...');

        await db.sequelize.authenticate();
        console.log('✅ Connected to database.');

        // 1. Create Kit Batch
        const batch = await db.KitBatch.create({
            kit_batch_code: `BATCH-${Date.now()}`,
            total_kits: 100,
            assembly_status: 'completed',
            allocated_kits: 5,
            remaining_kits: 95
        });
        console.log(`✅ Created Batch: ${batch.kit_batch_code}`);

        // 2. Create Kits (some deployed, some available)
        const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune'];
        const kits = [];

        for (let i = 1; i <= 10; i++) {
            const isDeployed = i <= 6; // 60% deployed
            const location = isDeployed ? locations[i % locations.length] : null;
            const status = isDeployed ? 'deployed' : 'available';

            const kit = await db.Kit.create({
                kit_batch_id: batch.id,
                kit_serial_number: `AQI-KIT-${Date.now()}-${i}`,
                kit_status: status,
                current_location: location,
                deployment_date: isDeployed ? new Date() : null,
                image_available: true
            });
            kits.push(kit);
        }
        console.log(`✅ Created ${kits.length} Kits.`);

        // 3. Create Alerts
        for (let i = 0; i < 5; i++) {
            const deployedKits = kits.filter(k => k.kit_status === 'deployed');
            const randomKit = deployedKits[Math.floor(Math.random() * deployedKits.length)];

            if (randomKit) {
                await db.Alert.create({
                    kit_id: randomKit.id,
                    alert_category: ['repair', 'maintenance', 'sensor_issue'][Math.floor(Math.random() * 3)],
                    alert_description: `Generated alert for ${randomKit.kit_serial_number}`,
                    alert_status: 'open'
                });
            }
        }
        console.log('✅ Created Alerts.');

        // 4. Create Deployments
        const deployedKits = kits.filter(k => k.kit_status === 'deployed');
        for (const kit of deployedKits) {
            await db.Deployment.create({
                kit_id: kit.id,
                deployed_for_user_id: 1, // Dummy User ID
                deployment_location: kit.current_location,
                installation_date: new Date(),
                deployment_status: 'active'
            });
        }
        console.log('✅ Created Deployment logs.');

        console.log('✨ Seeding completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
