const express = require('express');
const router = express.Router();
const { getProcedureAndTravelDetails, getProceduresByPatient } = require('../controllers/trackProcedureController');

// Route to fetch procedures by patient HN
router.get('/track-procedures/:hn', getProceduresByPatient);

// Route to fetch procedure and travel details by ProcedureID and HN
router.get('/track-procedure-details/:hn/:procedureID', getProcedureAndTravelDetails);

module.exports = router;
