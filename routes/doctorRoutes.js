const express = require('express');
const router = express.Router();
const { getDoctors,getDoctorDetails, selectDoctor } = require('../controllers/doctorController');

// Route to get the list of doctors
router.get('/doctors', getDoctors);
// Route to get the details of a doctor by ID
router.get('/doctordetails/:doctorId', getDoctorDetails);

router.post('/select-doctor', selectDoctor);


module.exports = router;
