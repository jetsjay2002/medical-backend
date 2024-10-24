// routes/procedureRequestsRoutes.js
const express = require('express');
const router = express.Router();
const { getDecisionNewPlanDetails, approveCancelStatus, approveDelayStatus } = require('../controllers/rescheduleController');

// Route to get procedure requests with specific statuses
router.get('/decision-newplan-details', getDecisionNewPlanDetails);

// Approve cancel status
router.put('/approve-cancel/:procedureId/:HN', approveCancelStatus);

// Approve delay status
router.put('/approve-delay/:procedureId/:HN', approveDelayStatus);

module.exports = router;
