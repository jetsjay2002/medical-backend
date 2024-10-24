// const pool = require('../config/db');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const activeUsers = require('../models/activeUsers');
// const { addToken, isBlacklisted } = require('../utils/tokenBlacklist');

// // Function to generate JWT token
// const generateToken = (payload) => {
//     return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
// };

// // Function to validate the token
// // Function to validate the token and check for expiration
// const isValidToken = (token) => {
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         return decoded;  // Return decoded token if valid
//     } catch (error) {
//         if (error.name === 'TokenExpiredError') {
//             console.error('Token expired:', error);
//             return { expired: true };  // Return expired flag if token is expired
//         }
//         console.error('Token verification failed:', error);
//         return null;  // Return null if token is invalid
//     }
// };

// // Login Function
// // const generateToken = (payload) => {
// //     return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
// // };

// // Login Function

// const login = async (username, password) => {
//     try {
//         const result = await pool.query('SELECT * FROM UserAccount WHERE username = $1', [username]);
//         const user = result.rows[0];

//         if (!user) {
//             throw new Error('Invalid username or password');
//         }

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) {
//             throw new Error('Invalid username or password');
//         }

//         let token;
//         let additionalInfo;

//         if (user.usertypesid === 'T02') {  // Patient
//             token = generateToken({ username: user.username, UserTypesID: 'T02', HN: user.hn });
//             additionalInfo = { HN: user.hn };
//         } else if (user.usertypesid === 'T04') {  // Agent
//             token = generateToken({ username: user.username, UserTypesID: 'T04', AgentID: user.agentid });
//             additionalInfo = { AgentID: user.agentid };
//         } else {
//             throw new Error('Unsupported user type');
//         }

//         // Add user to active users
//         if (activeUsers && typeof activeUsers.add === 'function') {
//             activeUsers.add(username);
//         }

//         // Return token, username, and additional information based on user type
//         return { token, username: user.username, UserTypesID: user.usertypesid, ...additionalInfo };

//     } catch (error) {
//         // Log specific properties of the error instead of the whole object
//         console.error('Login error:', error.message); // Log the error message only
//         throw new Error('Internal server error'); // Throw a generic error to the client
//     }
// };



// // const login = async (req, res) => {
// //     const { username, password } = req.body;

// //     try {
// //         const result = await pool.query('SELECT * FROM UserAccount WHERE username = $1', [username]);
// //         const user = result.rows[0];

// //         if (!user) {
// //             return res.status(401).json({ message: 'Invalid username or password' });
// //         }

// //         // Check the password using bcrypt
// //         const isPasswordValid = await bcrypt.compare(password, user.password);
// //         if (!isPasswordValid) {
// //             return res.status(401).json({ message: 'Invalid username or password' });
// //         }

// //         // Prepare payload and generate token
// //         const tokenPayload = { username: user.username, UserTypesID: user.usertypesid };
// //         const token = generateToken(tokenPayload);

// //         res.status(200).json({ token, username: user.username, UserTypesID: user.usertypesid });

// //     } catch (error) {
// //         console.error('Login error:', error);
// //         res.status(500).json({ message: 'Internal server error' });
// //     }
// // };

// // Logout Function
// const logout = (req, res) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1]; // Extract token from Authorization header

//     if (!token) {
//         return res.status(400).json({ message: 'Token is missing' });
//     }

//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//         if (err) {
//             return res.status(403).json({ message: 'Invalid token' });
//         }

//         // Add token to blacklist
//         addToken(token);
//         return res.status(200).json({ message: 'Logout successful' });
//     });
// };

// // List Active Users Function
// const listActiveUsers = (req, res) => {
//     const activeTokens = activeUsers.getAll(); // Assuming there's a getAll function in activeUsers

//     const activeUsersList = Array.from(activeTokens).map(token => {
//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode the token
//             return {
//                 username: decoded.username,
//                 UserTypesID: decoded.UserTypesID,
//                 HN: decoded.HN || decoded.AgentID  // Display HN or AgentID based on user type
//             };
//         } catch (error) {
//             return { token, error: 'Invalid token' };  // In case the token is invalid
//         }
//     });

//     res.status(200).json({ activeUsers: activeUsersList });
// };

// module.exports = {
//     login,
//     logout,
//     listActiveUsers
// };

const pool = require('../config/db');
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const { addToken, isBlacklisted } = require('../utils/tokenBlacklist');
const jwt = require('jsonwebtoken');
const { getClinicDataByHN } = require('../controllers/clinicController');

const accessTokenSecret = 'c7d597311b240249db349e9d2e5c563912bc0af30de2f9c1b4b176391e421ae7';  // Use a secure secret in production
const activeUsers = new Set();
// Function to generate JWT token
const generateToken = (payload) => {
    return jwt.sign(payload, accessTokenSecret, { expiresIn: '24h' });
};

// Function to validate and check token expiration
const isValidToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;  // Return decoded token if valid
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.error('Token expired:', error);
            return { expired: true };  // Return expired flag if token is expired
        }
        console.error('Token verification failed:', error);
        return null;  // Return null if token is invalid
    }
};

// Login Function
// JWT Secret Key


// Login API
// Function to generate a JWT token
// const login = async (req, res) => {
//     const { username, password } = req.body;
//     let token;
//     let additionalInfo = {};

//     try {
//         // Fetch the user from the database, including the UserTypesID
//         const userQuery = `
//             SELECT username, password, UserTypesID, HN, AgentID
//             FROM UserAccount
//             WHERE username = $1;
//         `;
//         const result = await pool.query(userQuery, [username]);

//         if (result.rows.length === 0) {
//             return res.status(400).json({ message: 'Invalid username or password' });
//         }

//         const user = result.rows[0];

//         // Check if the password matches
//         const validPassword = await bcrypt.compare(password, user.password);
//         if (!validPassword) {
//             return res.status(400).json({ message: 'Invalid username or password' });
//         }

//         // Generate token based on user type
//         if (user.usertypesid === 'T02') {  // Patient
//             token = generateToken({ username: user.username, UserTypesID: 'T02', HN: user.hn });
//             additionalInfo = { HN: user.hn };
//             const clinicData = await getClinicDataByHN(user.hn);
//             res.json({
//                 accessToken: token,
//                 message: 'Login successful',
//                 hasClinicData: clinicData.length > 0,
//                 ...additionalInfo  // Send HN or AgentID depending on user type
//             });

//         } else if (user.usertypesid === 'T04') {  // Agent
//             token = generateToken({ username: user.username, UserTypesID: 'T04', AgentID: user.agentid });
//             additionalInfo = { AgentID: user.agentid };
//             res.json({
//                 accessToken: token,
//                 message: 'Login successful',
//                 ...additionalInfo
//             });
//         } else {
//             throw new Error('Unsupported user type');
//         }

//         // Add user to active users list (if applicable)
//         if (activeUsers && typeof activeUsers.add === 'function') {
//             activeUsers.add(username);
//         }

//         // // Send the token and any additional info to the frontend
//         // res.json({
//         //     accessToken: token,
//         //     message: 'Login successful',
//         //     hasClinicData: clinicData.length > 0,
//         //     ...additionalInfo  // Send HN or AgentID depending on user type
//         // });
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

const login = async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt for:', username);  // Log the username of the user attempting to log in

    let token;
    let additionalInfo = {};

    try {
        // Fetch the user from the database
        const userQuery = `
            SELECT username, password, UserTypesID, HN, AgentID, AdminID, StaffID
            FROM UserAccount
            WHERE username = $1;
        `;
        const result = await pool.query(userQuery, [username]);

        // Log the result of the query
        console.log('Database query result:', result.rows);

        if (result.rows.length === 0) {
            console.log('No user found for username:', username);  // Log when no user is found
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const user = result.rows[0];

        // Check if the password matches
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Invalid password for user:', username);  // Log invalid password attempt
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        console.log('User authenticated:', username, 'UserType:', user.usertypesid);

        // Handle the response for different user types
        if (user.usertypesid === 'T01') {  // Admin
            token = generateToken({ username: user.username, UserTypesID: 'T01', AdminID: user.adminid });
            additionalInfo = { AdminID: user.adminid };
            console.log('Admin user logging in:', username);  // Log for admin login
            res.json({
                accessToken: token,
                message: 'Login successful',
                ...additionalInfo
            });
        } else if (user.usertypesid === 'T04') {  // Agent
            token = generateToken({ username: user.username, UserTypesID: 'T04', AgentID: user.agentid });
            additionalInfo = { AgentID: user.agentid };
            res.json({
                accessToken: token,
                message: 'Login successful',
                ...additionalInfo
            });
        } else if (user.usertypesid === 'T02') {  // Patient
                         token = generateToken({ username: user.username, UserTypesID: 'T02', HN: user.hn });
                         additionalInfo = { HN: user.hn };
                const clinicData = await getClinicDataByHN(user.hn);
                         res.json({
              accessToken: token,
              message: 'Login successful',
                hasClinicData: clinicData.length > 0,
                ...additionalInfo  // Send HN or AgentID depending on user type
            });
        } else if (user.usertypesid === 'T03') {  // Staff
            token = generateToken({ username: user.username, UserTypesID: 'T03', StaffID: user.staffid });
            additionalInfo = { StaffID: user.staffid };
            res.json({
                accessToken: token,
                message: 'Login successful',
                ...additionalInfo
            });
        } else {
            console.log('Unknown user type for user:', username);  // Log when the user type is unknown
            throw new Error('Unsupported user type');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



// Logout Function
const logout = (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];  // Extract the token

    jwt.verify(token, accessTokenSecret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token or logout failed' });
        }

        const username = decoded.username;

        // Replace 'remove' with 'delete' for Sets
        if (activeUsers && activeUsers.has(username)) {
            activeUsers.delete(username);  // Correct method for Sets
        } else {
            console.error('User not found in active users.');
        }

        res.json({ message: 'Logout successful' });
    });
};



const getUserDataFromToken = (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];  // Extract token from Authorization header

    // Verify and decode the token
    jwt.verify(token, accessTokenSecret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        // User data is available in `decoded`
        const { username, UserTypesID } = decoded;

        res.json({
            message: 'User data retrieved successfully',
            username,
            UserTypesID,
        });
    });
};


module.exports = {
    login,
    logout,
    getUserDataFromToken
};
