const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool  = require('../config/db');

// Helper function to generate AgentID
const generateAgentID = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT AgentID FROM AgentDetails ORDER BY AgentID DESC LIMIT 1');
        
        let newAgentID = '0001'; // Default AgentID if no record exists
        if (result.rows.length > 0) {
            const lastAgentID = result.rows[0].agentid;
            newAgentID = (parseInt(lastAgentID, 10) + 1).toString().padStart(4, '0'); // Increment and pad with zeros
        }
        

        client.release();
        console.log('Generated AgentID:', newAgentID);  // Log the generated AgentID
        return newAgentID;
    } catch (err) {
        throw new Error('Error generating AgentID: ' + err.message);
    }
};

const accessTokenSecret = 'c7d597311b240249db349e9d2e5c563912bc0af30de2f9c1b4b176391e421ae7';  // Use a secure secret in production

// Add agent details and return the generated AgentID
// Add agent details and return the generated AgentID with a longer expiration token
// Add agent details and return the generated AgentID
const addAgentDetails = async (req, res) => {
    const { firstName, lastName, middleName } = req.body;

    try {
        const client = await pool.connect();
        const AgentID = await generateAgentID(); // Generate a new AgentID

        // Insert agent details into the database
        await client.query(
            `INSERT INTO AgentDetails (AgentID, firstName, lastName, middleName)
             VALUES ($1, $2, $3, $4)`,
            [AgentID, firstName, lastName, middleName]
        );

        // Generate a JWT token with AgentID as payload (not hnNumber)
        // const token = jwt.sign({ AgentID, usertypeid: 'T04' }, process.env.JWT_SECRET, { expiresIn: '24h' });
        const token = jwt.sign({ AgentID, usertypeid: 'T04' }, accessTokenSecret, { expiresIn: '24h' });

        // Send back the AgentID and the token
        res.status(201).json({ message: 'Agent details added successfully', AgentID, token });
        
        client.release();
    } catch (err) {
        console.error('Error adding agent details:', err);  // Log the error to the console
        res.status(500).json({ error: err.message });
    }
};



// Create user account for the agent
// const createAgentAccount = async (req, res) => {
//     const { AgentID, username, password } = req.body;  // Extract AgentID from request body or token
//     console.log('Received token:', req.headers.authorization);

//     try {
//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Insert the user account for the agent
//         const result = await pool.query(
//             `INSERT INTO UserAccount (username, HN, AgentID, UserTypesID, password) 
//              VALUES ($1, NULL, $2, 'T04', $3) RETURNING *`,
//             [username, AgentID, hashedPassword]
//         );

//         // Return success response
//         res.status(201).json(result.rows[0]);  // Return the created user account
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

const createAgentAccount = async (req, res) => {
    const { AgentID, username, password } = req.body;

    try {
        // Check if the username or AgentID already exists
        const existingUser = await pool.query(
            `SELECT * FROM UserAccount WHERE username = $1 OR AgentID = $2`,
            [username, AgentID]
        );

        if (existingUser.rows.length > 0) {
            console.error(`Conflict detected: Username - ${username}, AgentID - ${AgentID}`);
            return res.status(400).json({ error: 'Username or AgentID already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user account for the agent
        const result = await pool.query(
            `INSERT INTO UserAccount (username, HN, AgentID, UserTypesID, password) 
             VALUES ($1, NULL, $2, 'T04', $3) RETURNING *`,
            [username, AgentID, hashedPassword]
        );

        // Return success response
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    addAgentDetails,
    createAgentAccount
};
