const pool = require('../../config/db');  // Database connection pool

// Controller to get all patients for a specific agent by AgentID
// const getPatientsByAgent = async (req, res) => {
//     const { agentId } = req.params; // Get AgentID from the request parameters

//     try {
//         // Query to fetch all patients associated with the AgentID
//         const query = `
//             SELECT ua.username, pd.HN, pd.name AS patient_name, ua.AgentID
//             FROM UserAccount ua
//             JOIN PatientDetails pd ON ua.HN = pd.HN
//             WHERE ua.AgentID = $1;
//         `;

//         const { rows } = await pool.query(query, [agentId]);

//         if (rows.length > 0) {
//             res.status(200).json({
//                 agentId: agentId,
//                 patients: rows  // Return the patients associated with the agent
//             });
//         } else {
//             res.status(404).json({ message: 'No patients found for this agent.' });
//         }
//     } catch (error) {
//         console.error('Error fetching patients for the agent:', error.message);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

const getPatientsByAgent = async (req, res) => {
    const { AgentID } = req.params;

    try {
        const query = `
            SELECT ua.username, pd.HN, pd.first_name AS patient_name, pd.last_name AS patient_lastname,ua.AgentID
            FROM UserAccount ua
            JOIN PatientDetails pd ON ua.HN = pd.HN
            WHERE ua.AgentID = $1;
        `;

        const { rows } = await pool.query(query, [AgentID]);

        if (rows.length > 0) {
            res.status(200).json({
                AgentID: AgentID,
                patients: rows
            });
        } else {
            // If no patients found, return an empty array
            res.status(200).json({
                AgentID: AgentID,
                patients: []  // Empty array if no patients
            });
        }
    } catch (error) {
        console.error('Error fetching patients for the agent:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const checkAgentIDByUsername = async (req, res) => {
    const { username } = req.params; // Get username from the request parameters

    try {
        const client = await pool.connect();
        const result = await client.query('SELECT AgentID FROM UserAccount WHERE username = $1', [username]);

        client.release();

        if (result.rows.length > 0 && result.rows[0].agentid) {
            res.status(200).json({ agentId: result.rows[0].agentid });
        } else {
            res.status(200).json({ agentId: null }); // Return null if no AgentID is found
        }
    } catch (error) {
        console.error('Error checking AgentID:', error);
        res.status(500).json({ error: 'Error checking AgentID' });
    }
};

// Controller to get the agent's username by AgentID, and ensure HN is NULL
const getAgentUsername = async (req, res) => {
    const { AgentID } = req.params;

    try {
        // Query to fetch the agent's username where HN is NULL and AgentID exists
        const query = 'SELECT username FROM UserAccount WHERE AgentID = $1 AND HN IS NULL';  // Check that HN is NULL
        const values = [AgentID];  // Safely pass the AgentID as a parameter

        // Execute the query
        const result = await pool.query(query, values);

        if (result.rows.length > 0) {
            // If agent is found without HN, return the username
            res.status(200).json({ username: result.rows[0].username });
        } else {
            // If no agent is found, return 404
            res.status(404).json({ message: 'Agent not found or has HN assigned' });
        }
    } catch (error) {
        console.error('Error fetching agent username:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Controller to check user details
const getUserDetails = async (req, res) => {
    const { username } = req.query; // Get the username from query parameters
    console.log('Received request for username:', username);  // Log the username

    try {
        const query = `
            SELECT ua.username, ua.HN, ua.AgentID
            FROM UserAccount ua
            WHERE ua.username = $1
        `;

        const result = await pool.query(query, [username]);
        console.log('Query result:', result.rows); // Log the query results

        if (result.rows.length > 0) {
            const user = result.rows[0];
            res.status(200).json({
                username: user.username,
                hn: user.hn,  // Ensure that these fields match your DB columns
                agentId: user.agentid,
            });
        } else {
            console.log('User not found in database'); // Log if user is not found
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
module.exports = {
    getPatientsByAgent,
    checkAgentIDByUsername,
    getAgentUsername,
    getUserDetails
};
