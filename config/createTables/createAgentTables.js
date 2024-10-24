const pool = require('../db');

const createAgentTables = async () => {
    const client = await pool.connect();
    try {

        const createAgentDetailsTable = `
            CREATE TABLE IF NOT EXISTS AgentDetails (
                AgentID VARCHAR(4) PRIMARY KEY,
                firstName VARCHAR(255),
                lastName VARCHAR(255),
                middlename VARCHAR(255)
            );
        `;
        await client.query(createAgentDetailsTable);
        console.log('Agents Details table created successfully');

    } catch (err) {
        console.error('Error creating agents table:', err);
    } finally {
        client.release();
    }
};

module.exports = { createAgentTables };
