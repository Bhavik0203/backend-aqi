const db = require('./models');
const { Op } = require('sequelize');

const seedReadings = async () => {
    try {
        await db.sequelize.sync({ alter: true }); 

        const kits = await db.Kit.findAll();
        if (kits.length === 0) {
            console.log("No kits found. Please run seed-data.js first.");
            return;
        }

        console.log(`Found ${kits.length} kits. Generating readings...`);

        const readings = [];
        const endDate = new Date();
        const locations = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai'];

        for (const kit of kits) {
          
            const location = kit.current_location || locations[Math.floor(Math.random() * locations.length)];
            let basePM25 = 50;
            if (location.includes('Delhi')) basePM25 = 180;
            else if (location.includes('Mumbai')) basePM25 = 120;
            else if (location.includes('Pune')) basePM25 = 80;

       
            for (let i = 0; i < 20; i++) {
                const date = new Date(endDate);
                date.setHours(date.getHours() - (i * 3)); 

              
                const variance = (Math.random() * 40) - 20;
                const pm25 = Math.max(10, basePM25 + variance);
                const pm10 = pm25 * 1.5; 

                readings.push({
                    kit_id: kit.id,
                    pm25: parseFloat(pm25.toFixed(2)),
                    pm10: parseFloat(pm10.toFixed(2)),
                    co2: 400 + Math.random() * 100,
                    humidity: 40 + Math.random() * 40,
                    temperature: 20 + Math.random() * 15,
                    recorded_at: date
                });
            }
        }

        console.log(`Creating ${readings.length} readings...`);
        // Bulk create in chunks to avoid overwhelming
        const chunkSize = 100;
        for (let i = 0; i < readings.length; i += chunkSize) {
            await db.AQIReading.bulkCreate(readings.slice(i, i + chunkSize));
        }

        console.log("Readings seeding completed!");
        process.exit();

    } catch (error) {
        console.error("Error seeding readings:", error);
        process.exit(1);
    }
};

seedReadings();
