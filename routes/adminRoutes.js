const express = require('express');
const { createUserAccount, getAllUsers, updateUser, deleteUser, getCurrentUser } = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authenticateAdmin } = require('../middleware/authAdmin');

const router = express.Router();

// User routes
router.post('/add-users', authenticateToken, authenticateAdmin, createUserAccount);
router.get('/get-users', authenticateToken, authenticateAdmin, getAllUsers);
router.put('/update-user/:username', authenticateToken, authenticateAdmin, updateUser);
router.delete('/delete-users/:username', authenticateToken, authenticateAdmin, deleteUser);
router.get('/admin-current-user', authenticateToken, authenticateAdmin, getCurrentUser);

router.use((req, res, next) => {
    console.log('A request was made to:', req.originalUrl); // Log the requested route
    next();
  });

module.exports = router;
