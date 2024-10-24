const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Create a user with unique AgentID, AdminID, and HN logic based on UserTypesID
// const createUserAccount = async (req, res) => {
//     const { username, HN, password, UserTypesID } = req.body;

//     try {
//         let newUserId = null;

//         // For patients, generate a new HN if not provided
//         if (UserTypesID === 'T03') {
//             const lastHNResult = await pool.query('SELECT HN FROM PatientDetails ORDER BY HN DESC LIMIT 1');
//             HN = lastHNResult.rows.length > 0 
//                 ? (parseInt(lastHNResult.rows[0].hn, 10) + 1).toString().padStart(13, '0') 
//                 : '0000000000001'; // Starting HN if none exists
//         }

//         // Generate IDs for other user types
//         if (UserTypesID === 'T04') { // Agent
//             const maxAgentIdQuery = 'SELECT MAX(CAST(AgentID AS INT)) FROM UserAccount WHERE UserTypesID = $1';
//             const maxResult = await pool.query(maxAgentIdQuery, ['T04']);
//             newUserId = String(maxResult.rows[0].max + 1).padStart(4, '0');
//         } else if (UserTypesID === 'T01') { // Admin
//             const maxAdminIdQuery = 'SELECT MAX(CAST(AdminID AS INT)) FROM UserAccount WHERE UserTypesID = $1';
//             const maxResult = await pool.query(maxAdminIdQuery, ['T01']);
//             newUserId = String(maxResult.rows[0].max + 1).padStart(4, '0');
//         } else if (UserTypesID === 'T02') { // Coordinator
//             const maxStaffIdQuery = 'SELECT MAX(CAST(StaffID AS INT)) FROM UserAccount WHERE UserTypesID = $1';
//             const maxResult = await pool.query(maxStaffIdQuery, ['T02']);
//             newUserId = String(maxResult.rows[0].max + 1).padStart(4, '0');
//         }

//         // Hash password before saving
//         const hashedPassword = await bcrypt.hash(password, 10);

//         const query = `
//             INSERT INTO UserAccount (username, HN, password, UserTypesID, ${UserTypesID === 'T04' ? 'AgentID' : UserTypesID === 'T01' ? 'AdminID' : 'StaffID'})
//             VALUES ($1, $2, $3, $4, $5)
//         `;
//         await pool.query(query, [username, HN, hashedPassword, UserTypesID, newUserId]);

//         res.status(201).json({ message: 'User account created successfully' });
//     } catch (error) {
//         console.error('Error creating user:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };
// const createUserAccount = async (req, res) => {
//     let { username, password, UserTypesID } = req.body;
//     let newUserId = null;  // Variable to store the new ID (HN, AdminID, etc.)

//     try {
//         // Determine the new ID based on the selected UserTypesID
//         if (UserTypesID === 'T02') {  // Patient
//             const lastHNResult = await pool.query('SELECT HN FROM UserAccount WHERE UserTypesID = $1 ORDER BY HN DESC LIMIT 1', ['T02']);
//             newUserId = lastHNResult.rows.length > 0 
//                 ? (parseInt(lastHNResult.rows[0].hn, 10) + 1).toString().padStart(4, '0') 
//                 : '0001';  // Start at '0001' if no HN exists
//         } else if (UserTypesID === 'T04') {  // Agent
//             const maxAgentIdResult = await pool.query('SELECT MAX(CAST(AgentID AS INT)) FROM UserAccount WHERE UserTypesID = $1', ['T04']);
//             newUserId = maxAgentIdResult.rows[0].max 
//                 ? String(parseInt(maxAgentIdResult.rows[0].max) + 1).padStart(4, '0')
//                 : '0001';
//         } else if (UserTypesID === 'T01') {  // Admin
//             const maxAdminIdResult = await pool.query('SELECT MAX(CAST(AdminID AS INT)) FROM UserAccount WHERE UserTypesID = $1', ['T01']);
//             newUserId = maxAdminIdResult.rows[0].max 
//                 ? String(parseInt(maxAdminIdResult.rows[0].max) + 1).padStart(4, '0')
//                 : '0001';
//         } else if (UserTypesID === 'T03') {  // Coordinator
//             const maxStaffIdResult = await pool.query('SELECT MAX(CAST(StaffID AS INT)) FROM UserAccount WHERE UserTypesID = $1', ['T03']);
//             newUserId = maxStaffIdResult.rows[0].max 
//                 ? String(parseInt(maxStaffIdResult.rows[0].max) + 1).padStart(4, '0')
//                 : '0001';
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Insert new user into the database
//         const query = `
//             INSERT INTO UserAccount (username, password, UserTypesID, ${UserTypesID === 'T04' ? 'AgentID' : UserTypesID === 'T01' ? 'AdminID' : UserTypesID === 'T03' ? 'StaffID' : 'HN'})
//             VALUES ($1, $2, $3, $4)
//         `;
//         await pool.query(query, [username, hashedPassword, UserTypesID, newUserId]);

//         res.status(201).json({ message: 'User account created successfully' });
//     } catch (error) {
//         console.error('Error creating user:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };
const createUserAccount = async (req, res) => {
    let { username, password, UserTypesID } = req.body;
    let newUserId = null;  // Variable to store the new ID (HN, AdminID, etc.)

    try {

        const usernameCheck = await pool.query('SELECT * FROM UserAccount WHERE username = $1', [username]);
        if (usernameCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        // Determine the new ID based on the selected UserTypesID
        if (UserTypesID === 'T02') {  // Patient
            // Generate new HN
            const lastHNResult = await pool.query('SELECT HN FROM PatientDetails ORDER BY HN DESC LIMIT 1');
            const newHN = lastHNResult.rows.length > 0 
                ? (parseInt(lastHNResult.rows[0].hn, 10) + 1).toString().padStart(13, '0') 
                : '0000000000001';  // Start at '0000000000001' if no HN exists

            // Insert new HN into PatientDetails table
            await pool.query('INSERT INTO PatientDetails (HN) VALUES ($1)', [newHN]);

            newUserId = newHN;  // Set the new HN as the newUserId
        } else if (UserTypesID === 'T04') {  // Agent
            const maxAgentIdResult = await pool.query('SELECT MAX(CAST(AgentID AS INT)) FROM UserAccount WHERE UserTypesID = $1', ['T04']);
            newUserId = maxAgentIdResult.rows[0].max 
                ? String(parseInt(maxAgentIdResult.rows[0].max) + 1).padStart(4, '0')
                : '0001';
        } else if (UserTypesID === 'T01') {  // Admin
            const maxAdminIdResult = await pool.query('SELECT MAX(CAST(AdminID AS INT)) FROM UserAccount WHERE UserTypesID = $1', ['T01']);
            newUserId = maxAdminIdResult.rows[0].max 
                ? String(parseInt(maxAdminIdResult.rows[0].max) + 1).padStart(4, '0')
                : '0001';
        } else if (UserTypesID === 'T03') {  // Staff (Coordinator)
            const maxStaffIdResult = await pool.query('SELECT MAX(CAST(StaffID AS INT)) FROM UserAccount WHERE UserTypesID = $1', ['T03']);
            newUserId = maxStaffIdResult.rows[0].max 
                ? String(parseInt(maxStaffIdResult.rows[0].max) + 1).padStart(4, '0')
                : '0001';
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the database
        const query = `
            INSERT INTO UserAccount (username, password, UserTypesID, ${UserTypesID === 'T04' ? 'AgentID' : UserTypesID === 'T01' ? 'AdminID' : UserTypesID === 'T03' ? 'StaffID' : 'HN'})
            VALUES ($1, $2, $3, $4)
        `;
        await pool.query(query, [username, hashedPassword, UserTypesID, newUserId]);
        console.log('Received UserTypesID:', UserTypesID); // Ensure correct UserTypesID is being processed

        res.status(201).json({ message: 'User account created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Get all users
const getAllUsers = async (req, res) => {
    console.log('Inside getAllUsers. Fetching all users.'); // Add this log
    try {
        const result = await pool.query('SELECT * FROM UserAccount');
        console.log('Users fetched from the database:', result.rows); // Log the result from the database
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Update user
// const updateUser = async (req, res) => {
//     const { username } = req.params;
//     const { email, phone, role } = req.body;

//     try {
//         const query = 'UPDATE UserAccount SET email = $1, phone = $2, UserTypesID = $3 WHERE username = $4';
//         await pool.query(query, [email, phone, role, username]);
//         res.json({ message: 'User updated successfully' });
//     } catch (error) {
//         console.error('Error updating user:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

const updateUser = async (req, res) => {
    const { username } = req.params;  // Existing username to identify the user
    const { newUsername, newPassword, newId, UserTypesID } = req.body;

    try {
        // Hash the new password if provided
        let hashedPassword = null;
        if (newPassword) {
            hashedPassword = await bcrypt.hash(newPassword, 10);
        }

        // Determine which ID to update based on the user type
        let idField = '';
        if (UserTypesID === 'T02') {  // Patient
            idField = 'HN';
        } else if (UserTypesID === 'T04') {  // Agent
            idField = 'AgentID';
        } else if (UserTypesID === 'T01') {  // Admin
            idField = 'AdminID';
        } else if (UserTypesID === 'T03') {  // Coordinator (Staff)
            idField = 'StaffID';
        }

        // Update the user with new information
        const query = `
            UPDATE UserAccount
            SET username = $1,
                password = COALESCE($2, password),  -- Only update password if provided
                ${idField} = $3
            WHERE username = $4 AND UserTypesID = $5
        `;
        const result = await pool.query(query, [newUsername, hashedPassword, newId, username, UserTypesID]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found or no changes made' });
        }

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Delete user
const deleteUser = async (req, res) => {
    const { username } = req.params;

    try {
        await pool.query('DELETE FROM UserAccount WHERE username = $1', [username]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get current user info (for checking admin access)
// const getCurrentUser = async (req, res) => {
//     const { username } = req.user;

//     try {
//         const result = await pool.query('SELECT username, hn, agentid, adminid, staffid, UserTypesID FROM UserAccount WHERE username = $1', [username]);
//         if (result.rows.length === 0) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         console.log('Current user:', result.rows[0]); // Log the current user data including UserTypesID
//         res.json(result.rows[0]);
//     } catch (error) {
//         console.error('Error fetching current user:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };


// const getCurrentUser = async (req, res) => {
//     const { username } = req.user;

//     console.log('Decoded user from token:', req.user);  // Log the decoded user

//     try {
//         // Fetch user from the database
//         const result = await pool.query('SELECT username, hn, agentid, adminid, staffid, usertypesid FROM UserAccount WHERE username = $1', [username]);

//         if (result.rows.length === 0) {
//             console.log('User not found');
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const user = result.rows[0];
//         console.log('User fetched from database:', user);  // Log the user

//         // Ensure usertypesid is included and not undefined
//         const userTypeId = user.usertypeid || user.UserTypesID;
//         console.log('Final userTypeId:', userTypeId);  // Log the final userTypeId

//         // If userTypeId is undefined, log a warning
//         if (!userTypeId) {
//             console.warn('Warning: userTypeId is undefined. Check if the database field exists.');
//         }

//         // Send response with user and include usertypesid explicitly
//         res.json({
//             ...user,
//             usertypesid: userTypeId // explicitly include usertypesid
//         });
//     } catch (error) {
//         console.error('Error fetching current user:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };


const getCurrentUser = async (req, res) => {
    const { username } = req.user;

    console.log('Decoded user from token:', req.user);  // Log the decoded user

    try {
        // Query to fetch the user by username
        const result = await pool.query('SELECT * FROM UserAccount WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        console.log('User fetched from database:', user);  // Log the user object

        // Ensure that usertypesid is present and explicitly add it to the response
        const userTypeId = user.usertypesid; // This should exist in the database
        console.log('Final userTypeId:', userTypeId);

        // Check if the user is an admin and proceed
        if (userTypeId === 'T01') {
            console.log('User is an Admin. Proceeding...');
            const userResponse = {
                ...user,
                usertypesid: userTypeId  // Explicitly include usertypesid in the response
            };
            console.log('Full response being sent to frontend:', userResponse);

            res.json(userResponse);  // Send the user data to frontend

        } else {
            console.log('Access forbidden: User is not an admin');
            return res.status(403).json({ error: 'Access forbidden: Admins only' });
        }
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// const getCurrentUser = async (req, res) => {
//     const { username } = req.user;

//     console.log('Decoded user from token:', req.user);  // Log the decoded user

//     try {
//         // Query to fetch the user by username
//         const result = await pool.query('SELECT * FROM UserAccount WHERE username = $1', [username]);

//         if (result.rows.length === 0) {
//             console.log('User not found');
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const user = result.rows[0];
//         console.log('User fetched from database:', user);  // Log the user object

//         // Directly access usertypesid from the database, which is all lowercase
//         const userTypeId = user.usertypesid;
//         console.log('Checking UserTypesID:', userTypeId);

//         // Check if the user is an admin and proceed
//         if (userTypeId === 'T01') {
//             console.log('User is an Admin. Proceeding...');
//             // res.json(user);  // Return user data if they are admin
//             console.log('Final userTypeId:', userTypeId);  // Log the final userTypeId
//             res.json({
//                 ...user,
//                 usertypesid: userTypeId // explicitly include usertypesid
//             });
//         } else {
//             console.log('Access forbidden: User is not an admin');
//             return res.status(403).json({ error: 'Access forbidden: Admins only' });
//         }
//     } catch (error) {
//         console.error('Error fetching current user:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

  
  
  
  
  
module.exports = {
    createUserAccount,
    getAllUsers,
    updateUser,
    deleteUser,
    getCurrentUser,
};
