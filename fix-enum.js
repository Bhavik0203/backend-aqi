const db = require('./models');

const fixEnumAndSchema = async () => {
    try {
        console.log('🔄 Connecting to adjust Enums/Schema...');
        await db.sequelize.authenticate();

       
        const addEnum = async (val) => {
            try {
             
                console.log(`Adding '${val}' to enum...`);
                await db.sequelize.query(`ALTER TYPE "enum_alerts_alert_category" ADD VALUE '${val}'`);
                console.log(`✅ Added '${val}'`);
            } catch (e) {
                console.log(`ℹ️ '${val}': ${e.message} (Likely already exists)`);
            }
        };

        const newValues = ['sla', 'inventory', 'user', 'deployment'];
        for (const v of newValues) {
            await addEnum(v);
        }

        
        console.log("Ensuring kit_id allows NULL...");
        try {
          
            await db.sequelize.query('ALTER TABLE alerts ALTER COLUMN kit_id DROP NOT NULL');
            console.log("✅ kit_id constraint dropped.");
        } catch (e) {
            console.error("⚠️ Failed to drop constraint:", e.message);
        }

    } catch (e) {
        console.error('❌ General Error', e);
    } finally {
        await db.sequelize.close();
    }
};

fixEnumAndSchema();
