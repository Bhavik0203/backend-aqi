const db = require('../models');

const backfillSlaAlerts = async () => {
    try {
        console.log('Starting SLA Alert backfill...');

        // 1. Backfill SLA Tracking Alerts
        const trackings = await db.SlaTracking.findAll();
        console.log(`Found ${trackings.length} SLA Tracking records.`);

        for (const tracking of trackings) {
            const description = `Backfilled: Ticket #${tracking.ticketId} (${tracking.ticketType}) - ${tracking.status}`;

            // Check for existing to avoid duplicates (approximate match)
            const exists = await db.Alert.findOne({
                where: {
                    alert_category: 'sla',
                    alert_description: description
                }
            });

            if (!exists) {
                await db.Alert.create({
                    alert_category: 'sla',
                    alert_description: description,
                    alert_status: tracking.status === 'Completed' ? 'resolved' : 'open',
                    kit_id: null,
                    created_at: tracking.createdAt // Maintain historical timestamp
                });
                console.log(`Created Alert for Ticket ${tracking.ticketId}`);
            }
        }

        // 2. Backfill SLA Performance Alerts
        const performances = await db.SlaPerformance.findAll();
        console.log(`Found ${performances.length} SLA Performance records.`);

        for (const perf of performances) {
            const description = `Backfilled: SLA Performance for ${perf.technicianName} - Score: ${perf.performanceScore}`;

            const exists = await db.Alert.findOne({
                where: {
                    alert_category: 'sla',
                    alert_description: description
                }
            });

            if (!exists) {
                await db.Alert.create({
                    alert_category: 'sla',
                    alert_description: description,
                    alert_status: 'open',
                    kit_id: null,
                    created_at: perf.createdAt
                });
                console.log(`Created Alert for Technician ${perf.technicianName}`);
            }
        }

        console.log('Backfill complete.');
        process.exit(0);
    } catch (error) {
        console.error('Backfill failed:', error);
        process.exit(1);
    }
};

backfillSlaAlerts();
