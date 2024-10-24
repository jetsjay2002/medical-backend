const pool = require('../db');

const createUserTables = async () => {
    const client = await pool.connect();
    try {

        const createUserTypesTableQuery = `
            CREATE TABLE IF NOT EXISTS UserTypes (
                UserTypesID VARCHAR(3) PRIMARY KEY,
                UserTypesName VARCHAR(50)
            );
        `;
        await client.query(createUserTypesTableQuery);
        console.log('User Types table created successfully');

        const insertUserTypesQuery = `
            INSERT INTO UserTypes (UserTypesID, UserTypesName)
            VALUES 
                ('T01', 'Admin'),
                ('T02', 'Patient'),
                ('T03', 'Coordinator'),
                ('T04', 'Agent')
            ON CONFLICT (UserTypesID) DO NOTHING;
        `;
        await client.query(insertUserTypesQuery);
        console.log('Insert User Types data successfully');



        // const createUserAccountTable = `
        //     CREATE TABLE IF NOT EXISTS UserAccount (
        //         username VARCHAR(50) PRIMARY KEY,
        //         HN VARCHAR(13) REFERENCES PatientDetails(HN) ON DELETE CASCADE,
        //         AgentID VARCHAR(4) REFERENCES AgentDetails(AgentID) ON DELETE CASCADE,
        //         UserTypesID VARCHAR(3) REFERENCES UserTypes(UserTypesID) ON DELETE CASCADE,
        //         password VARCHAR(60) NOT NULL
        //     );
        // `;
        // await client.query(createUserAccountTable);
        // console.log('User Account table created successfully');

        const createUserAccountTable = `
            CREATE TABLE IF NOT EXISTS UserAccount (
                username VARCHAR(50) PRIMARY KEY,
                HN VARCHAR(13) REFERENCES PatientDetails(HN) ON DELETE CASCADE,
                AgentID VARCHAR(4),
                AdminID VARCHAR(4),
                StaffID VARCHAR(4),
                UserTypesID VARCHAR(3) REFERENCES UserTypes(UserTypesID) ON DELETE CASCADE,
                password VARCHAR(60) NOT NULL
            );
        `;
        await client.query(createUserAccountTable);
        console.log('User Account table created successfully');

        const insertStaffAccountQuery = `
            INSERT INTO UserAccount (username, StaffID, UserTypesID, password) 
            VALUES ('staff_jay', '0001', 'T03', '$2b$10$.WUyqtTXNmihvfjN3q4QbOYn.6JCrDLn3/f.pgIIBsIOrnmCWlVRe')
            ON CONFLICT (username) DO NOTHING;
        `;
        await client.query(insertStaffAccountQuery);
        console.log('Insert Staff Accpint data successfully');

    } catch (err) {
        console.error('Error creating agents table:', err);
    } finally {
        client.release();
    }
};

module.exports = { createUserTables };
