// const jwt = require('jsonwebtoken');
// const { isBlacklisted } = require('./tokenBlacklist');

// const generateAccessToken = (user) => {
//     return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' }); // Set expiration time
// };


// const authenticateToken = async (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) return res.sendStatus(401);

//     try {
//         const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Verify token
//         req.user = decoded;
//         next();
//     } catch (err) {
//         console.error('Token verification failed:', err);
//         res.sendStatus(403); // Token expired or invalid
//     }
// };



// module.exports = { generateAccessToken, authenticateToken };
