// const express = require('express');
// const router = express.Router();
// const { 
//     addPatientDetails, 
//     addPatientContact, 
//     addPatientEmergencyContact, 
//     addPatientMedicalConditions, 
//     createAccountPatient 
// } = require('../models/patientModel');  // Correctly importing all model functions
// const { authenticateToken } = require('../middleware/authMiddleware');

// // Verify all functions exist
// console.log({
//     addPatientDetails, 
//     addPatientContact, 
//     addPatientEmergencyContact, 
//     addPatientMedicalConditions, 
//     createAccountPatient
// });

// // Define routes correctly
// router.post('/details', addPatientDetails);
// router.post('/contact', addPatientContact);
// router.post('/emergency', addPatientEmergencyContact);
// router.post('/medical', addPatientMedicalConditions);

// // Ensure authenticateToken is defined properly
// if (typeof authenticateToken !== 'function') {
//     console.error('authenticateToken middleware is not a function');
// }

// // Ensure createAccountPatient is defined
// if (typeof createAccountPatient !== 'function') {
//     console.error('createAccountPatient is not a function');
// }

// // router.post('/account', authenticateToken, (req, res) => {
// //     if (req.user.usertypeid !== 'T02') {
// //         return res.status(403).send('Forbidden: Only patients can create accounts.');
// //     }
// //     createAccountPatient(req, res);
// // });
// router.post('/account', authenticateToken, (req, res) => {
//     console.log(req.user);  // Log the user data to verify it's correct

//     // Check if the logged-in user is a patient (T02)
//     if (req.user.usertypeid !== 'T02') {
//         return res.status(403).json({ message: 'Forbidden: Only patients can create accounts.' });
//     }

//     // Proceed to create the account
//     createAccountPatient(req, res);
// });


// module.exports = router;



const express = require('express');
const router = express.Router();
const { addPatientDetails, addPatientContact, addPatientEmergencyContact, 
    addPatientMedicalConditions, createAccountPatient,createAccountPatientByAgent } = require('../models/patientModel'); 
const { authenticateToken } = require('../middleware/authMiddleware');

// Verify all functions exist
console.log({addPatientDetails, 
    addPatientContact, 
    addPatientEmergencyContact,  
    addPatientMedicalConditions, 
    createAccountPatient,
    createAccountPatientByAgent
 });

// Define routes correctly
router.post('/details', addPatientDetails);
router.post('/contact', addPatientContact);
router.post('/emergency', addPatientEmergencyContact);
router.post('/medical', addPatientMedicalConditions);
router.post('/accountbyagent',createAccountPatientByAgent);

// router.post('/accountbyagent', authenticateToken, createAccountPatientByAgent);

if (typeof authenticateToken !== 'function') {
    console.error('authenticateToken middleware is not a function');
}

if (typeof createAccountPatient !== 'function') {
    console.error('createAccountPatient is not a function');
}

router.post('/account', authenticateToken, (req, res) => {
    console.log(req.user);  // Log the user data to verify it's correct

    // Check if the logged-in user is a patient (T02)
    if (req.user.usertypeid !== 'T02') {
        return res.status(403).json({ message: 'Forbidden: Only patients can create accounts.' });
    }

    // Proceed to create the account
    createAccountPatient(req, res);
});


module.exports = router;
