const express = require('express');
const router = express.Router();
const { getPatientsByAgent,checkAgentIDByUsername,getAgentUsername,getUserDetails } = require('../../controllers/Agent/agentController');
const { authenticateToken } = require('../../middleware/authMiddleware');

// Route to get all patients for a specific agent
// URL: /api/agent/:agentId/patients
router.get('/agent/:AgentID/patients', getPatientsByAgent);
router.get('/user/:username/AgentID', checkAgentIDByUsername);
router.get('/agent/:AgentID/username', getAgentUsername);
router.get('/user/agent-check-details', getUserDetails);

module.exports = router;
