// const jwt = require('jsonwebtoken');
// const accessTokenSecret = 'c7d597311b240249db349e9d2e5c563912bc0af30de2f9c1b4b176391e421ae7';  // Use a secure secret in production


// const generateToken = (payload) => {
//     return jwt.sign(payload, accessTokenSecret, { expiresIn: '24h' });
// };

// const authenticateToken = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//         return res.sendStatus(401);  // Unauthorized
//     }

//     jwt.verify(token, accessTokenSecret, (err, user) => {
//         if (err) {
//             return res.sendStatus(403);  // Forbidden
//         }

//         req.user = user;
//         next();
//     });
// };

// module.exports = {authenticateToken};

const jwt = require('jsonwebtoken');
const accessTokenSecret = 'c7d597311b240249db349e9d2e5c563912bc0af30de2f9c1b4b176391e421ae7';  // Make sure this matches the secret used during token creation

const generateToken = (payload) => {
    return jwt.sign(payload, accessTokenSecret, { expiresIn: '24h' });
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log('Auth Header:', authHeader); // Log the Authorization header
    console.log('Token:', token); // Log the extracted token
    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) {
            console.log('Invalid token:', err); // Log token verification errors
            return res.status(403).json({ message: 'Invalid token' });
        }

        console.log('Decoded token in authenticateToken:', user);
        req.user = user; // Attach the user to the request
        next();
    });
};

module.exports = { authenticateToken };







// const jwt = require('jsonwebtoken');

// function authenticateToken(req, res, next) {
//     const token = req.header('Authorization')?.split(' ')[1];  // Get token from Authorization header

//     if (!token) {
//         return res.status(401).json({ message: 'No token, authorization denied' });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify token
//         req.user = decoded;  // Set user information from the token
//         next();  // Continue to the next middleware or route
//     } catch (err) {
//         res.status(401).json({ message: 'Token is not valid' });
//     }
// }

// module.exports = { authenticateToken };
// const jwt = require('jsonwebtoken');

// const authenticateToken = (req, res, next) => {
//     const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;  // decoded token contains the payload (AgentID)
//         next();
//     } catch (err) {
//         if (err.name === 'TokenExpiredError') {
//             return res.status(403).json({ message: 'Token expired' });
//         }
//         return res.status(403).json({ message: 'Token verification failed' });
//     }
// };



// module.exports = { authenticateToken };
