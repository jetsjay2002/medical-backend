const express = require('express');
const router = express.Router();
const { getClinicDataByHN, saveClinicData,checkHNInClinic
    // saveClinicDataAgent,getClinicDataByHNAgent  
} = require('../controllers/clinicController');

// Endpoint to get clinic data by HN
router.get('/clinic/:HN', getClinicDataByHN);

router.post('/filter-hospital', saveClinicData);

// router.get('/clinic-agent/:HN', getClinicDataByHNAgent);

// router.post('/filter-hospital-agent', saveClinicDataAgent);
router.get('/clinic/check-hn/:hn', checkHNInClinic);

module.exports = router;
