const express = require('express');
const router = express.Router();
const ratingsController = require('../controllers/ratingsController');

// Route to submit service rating
router.post('/submit-service-rating', ratingsController.submitServiceRating);

// Route to get package name for a procedure and HN
router.get('/package-name/:procedureId/:HN', ratingsController.getPackageName);

// Route to get departure details
router.get('/departure-details/:procedureId/:HN', ratingsController.getDepartureDetails);

// Route to update status to "Departure"
router.put('/update-departure-status/:procedureId/:HN', ratingsController.updateDepartureStatus);

router.get('/clinic-details/:procedureId/:HN', ratingsController.getClinicDetails);

// Route to submit clinic rating
router.post('/submit-clinic-rating', ratingsController.submitClinicRating);

module.exports = router;
