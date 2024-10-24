const express = require('express');
const router = express.Router();
const { addAgentDetails, createAgentAccount } = require('../models/agentModel');
const { authenticateToken } = require('../middleware/authMiddleware');

// POST route for adding agent details
router.post('/details', addAgentDetails);

// POST route for creating agent account
router.post('/account', authenticateToken, (req, res) => {
    if (req.user.usertypeid !== 'T04') {
        return res.status(403).send('Forbidden: Only agents can create accounts.');
    }
    createAgentAccount(req, res);  // Call the agent account creation logic
});

module.exports = router;



