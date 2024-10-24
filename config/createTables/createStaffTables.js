const pool = require('../db');

const createStaffTables = async () => {
    const client = await pool.connect();
    try {

        const createStaffTable = `
            CREATE TABLE IF NOT EXISTS Coordinator (
                StaffID VARCHAR(4) PRIMARY KEY,
                firstName VARCHAR(255),
                lastName VARCHAR(255)
            );
        `;
        await client.query(createStaffTable);
        console.log('Staff table created successfully');

        const insertStaffUserQuery = `
            INSERT INTO Coordinator (StaffID, firstName, lastName) 
            VALUES ('0001', 'Jetsadaporn', 'Noijanghan')
            ON CONFLICT (StaffID) DO NOTHING;
        `;
        await client.query(insertStaffUserQuery);
        console.log('Insert Staff id data successfully');

    } catch (err) {
        console.error('Error creating staff table:', err);
    } finally {
        client.release();
    }
};



module.exports = { createStaffTables };
