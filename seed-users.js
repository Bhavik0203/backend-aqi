const db = require('./models');

const syncAndSeed = async () => {
    try {
        console.log("Forcing database sync to apply new schema...");
        await db.sequelize.sync({ alter: true }); 

        console.log("Seeding user profiles...");

       
        const users = [
            {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@pritomatic.com',
                phone_number: '+919876jjj543210',
                role: 'Technician',
              
            },
            {
                first_name: 'Jane',
                last_name: 'Smith',
                email: 'jane.smith@pritomatic.com',
                phone_number: '+919876543211',
                role: 'Administrator',
              
            },
            {
                first_name: 'Robert',
                last_name: 'Brown',
                email: 'robert.b@pritomatic.com',
                phone_number: '+919876543212',
                role: 'Technician',
               
            },
            {
                first_name: 'Emily',
                last_name: 'Davis',
                email: 'emily.d@govt.in',
                phone_number: '+919876543213',
                role: 'Business/Government User',
             
            },
            {
                first_name: 'Michael',
                last_name: 'Wilson',
                email: 'michael.w@public.com',
                phone_number: '+919876543214',
                role: 'Public User',
               
            }
        ];

        for (const user of users) {
          
            const exists = await db.UserProfile.findOne({ where: { email: user.email } });
            if (!exists) {
                await db.UserProfile.create(user);
            }
        }

        console.log("User profiles seeded successfully!");
        process.exit();

    } catch (error) {
        console.error("Error seeding user profiles:", error);
        process.exit(1);
    }
};

syncAndSeed();
