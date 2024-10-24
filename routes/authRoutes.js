// const express = require('express');
// const router = express.Router();
// const { login, logout, listActiveUsers } = require('../controllers/authController');

// // Login route
// router.post('/login', async (req, res) => {
//     const { username, password } = req.body;
//     console.log('Login attempt with username:', username); // Log the username

//     try {
//         // Call the login function from the controller
//         const result = await login(req, res);  // Pass req, res directly
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(401).json({ error: error.message });
//     }
// });

// // Logout route
// router.post('/logout', (req, res) => {
//     try {
//         // Call logout function directly and pass req, res
//         logout(req, res); 
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// router.get('/active-users', listActiveUsers);

// module.exports = router;

// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { login, logout, getUserDataFromToken  } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');  // Import the middleware

router.post('/login', login);

// Logout route (with authentication middleware)
router.post('/logout', authenticateToken, logout);

// List active users (admin-only route, for example)
router.get('/user-data', getUserDataFromToken);
module.exports = router;

// authRoutes.js

// routes/authRoutes.js

// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');
// const authenticate = require('../middleware/authenticate');
// const authorizeAdmin = require('../middleware/authorizeAdmin');

// // Login route (no authentication required)
// router.post('/login', authController.login);

// // Logout route (requires authentication)
// router.post('/logout', authenticate, authController.logout);

// // List active users (requires authentication and admin authorization)
// router.get('/active-users', authenticate, authorizeAdmin, authController.listActiveUsers);

// module.exports = router;

