const express = require('express');
const router = express.Router();
const onboardController = require('../controllers/onboardController');

// Route to fetch travel details
router.get('/onboard-details/:procedureId/:HN', onboardController.getOnboardDetails);

// Route to update status to "On Board"
router.post('/update-status-onboard', onboardController.updateStatusOnBoard);

router.put('/update-patient-status/:procedureId/:HN', onboardController.updatePatientStatus);
router.put('/update-cancel-status/:procedureId/:HN', onboardController.updateCancelStatus);
router.put('/update-delay-status/:procedureId/:HN', onboardController.updateDelayStatus);

router.put('/update-flight-cancel/:procedureId/:HN', onboardController.updateFlightCancel);

router.put('/update-flight-delay/:procedureId/:HN', onboardController.updateFlightDelay);

router.get('/decision-delay/:procedureId/:HN', onboardController.getDecisionDelayDetails);

router.get('/decision-cancel/:procedureId/:HN', onboardController.getTravelDetailsForDecision);


router.get('/notify-plan-details/:procedureId/:HN', onboardController.getNotifyPlanDetails);

// Route to update status to 'Operation'
router.put('/update-status/:procedureId/:HN', onboardController.updateProcedureStatusToOperation);

router.get('/during-treatment-details/:procedureId/:HN', onboardController.getDuringTreatmentDetails);

// Route to update status to Recuperate
router.put('/update-status-Recuperate/:procedureId/:HN', onboardController.updateTreatmentStatus);

module.exports = router;
