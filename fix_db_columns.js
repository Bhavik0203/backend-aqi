const db = require('./models');

async function checkColumns() {
    try {
        const tableInfo = await db.sequelize.getQueryInterface().describeTable('tickets');
        console.log('Columns in tickets table:', Object.keys(tableInfo));

        const missingColumns = [];
        const requiredColumns = ['issue_description', 'priority', 'source', 'scheduled_date'];

        requiredColumns.forEach(col => {
            if (!tableInfo[col]) missingColumns.push(col);
        });

        if (missingColumns.length > 0) {
            console.log('Missing columns:', missingColumns);
            // Alter table to add missing columns
            for (const col of missingColumns) {
                console.log(`Adding missing column: ${col}`);
                if (col === 'issue_description') {
                    await db.sequelize.getQueryInterface().addColumn('tickets', 'issue_description', {
                        type: db.Sequelize.TEXT,
                        allowNull: true
                    });
                }
                if (col === 'priority') {
                    await db.sequelize.getQueryInterface().addColumn('tickets', 'priority', {
                        type: db.Sequelize.ENUM('Low', 'Medium', 'High'),
                        allowNull: false,
                        defaultValue: 'Medium'
                    });
                }
                if (col === 'source') {
                    await db.sequelize.getQueryInterface().addColumn('tickets', 'source', {
                        type: db.Sequelize.ENUM('Manual', 'System'),
                        allowNull: false,
                        defaultValue: 'Manual'
                    });
                }
                if (col === 'scheduled_date') {
                    await db.sequelize.getQueryInterface().addColumn('tickets', 'scheduled_date', {
                        type: db.Sequelize.DATE,
                        allowNull: true
                    });
                }
            }
            console.log('Columns added successfully.');
        } else {
            console.log('All required columns exist.');
        }

    } catch (error) {
        console.error('Error checking/updating table:', error);
    } finally {
        process.exit();
    }
}

checkColumns();
