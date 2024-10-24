const express = require('express');
const router = express.Router();
const travelController = require('../controllers/travelController'); // Import the controller

// POST route to save travel details
router.post('/travel-details', travelController.saveTravelDetails);
router.get('/process-travel-status/:procedureId/:HN', travelController.getProcessTravelStatus);

module.exports = router;
