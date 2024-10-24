const jwt = require('jsonwebtoken');

// Middleware to authenticate the token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];  // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'Access token is missing or invalid' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token is not valid' });
        }
        // req.user = decoded;

        req.user = user;  // Attach the user to the request object for access in the next middleware
        next();  // Proceed to the next middleware or route handler
    });
};

module.exports = { authenticateToken };
