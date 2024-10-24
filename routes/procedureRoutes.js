// const express = require('express');
// const { getProcedureRequestByProcedureId, saveProcedureDetails   } = require('../controllers/procedureController');
// const router = express.Router();

// // Route to get a procedure request by procedureId
// router.get('/procedure-request/:procedureId', getProcedureRequestByProcedureId);
// router.post('/procedure-request/save-details', saveProcedureDetails );

// module.exports = router;
const express = require('express');
const { getProcedureRequestByProcedureId, saveProcedureDetails, getProcessTreatmentData, updateProcedureAndTravelDetails } = require('../controllers/procedureController'); // Ensure correct import
const router = express.Router();
const pool = require('../config/db');

// Define the routes and make sure the callback function is provided
router.get('/procedure-request/:procedureId', getProcedureRequestByProcedureId);
router.post('/procedure-request/save-details', saveProcedureDetails);
router.get('/process-treatment/:HN/:procedureId', getProcessTreatmentData);

router.get('/procedure-requests/filtered', async (req, res) => {

    try {
        const query = `
            SELECT 
                pr.ProcedureID, 
                pr.status, 
                pr.procedure, 
                pr.surgeon, 
                pr.SurgeryDate, 
                pd.HN,  -- HN from PatientDetails table
                pd.first_name AS patient_first_name, 
                pd.last_name AS patient_last_name,
                pa.packageName,
                d.first_name AS doctor_first_name,
                d.last_name AS doctor_last_name
            FROM ProcedureRequests pr
            LEFT JOIN PatientDetails pd ON pr.HN = pd.HN  -- Join with PatientDetails on HN
            LEFT JOIN Packages pa ON pr.PackagesID = pa.PackagesID  -- Join with Packages table
            LEFT JOIN Doctors d ON pr.DoctorsID = d.DoctorsID  -- Join with Doctors table
            WHERE pr.status = 'Waiting for Approval' OR pr.status = 'Approved'
            ORDER BY pr.ProcedureID ASC;
        `;
        const result = await pool.query(query);

        // Return the filtered procedure requests
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching procedure requests:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


// Update the status of a procedure request by ProcedureID
router.put('/procedure-requests/:procedureID/status', async (req, res) => {
    const { procedureID } = req.params; // Extract procedure ID from the URL
    const { newStatus } = req.body; // Get the new status from the request body

    try {
        const query = `
            UPDATE ProcedureRequests
            SET status = $1
            WHERE ProcedureID = $2
            RETURNING *;
        `;

        const values = [newStatus, procedureID];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Procedure request not found' });
        }

        res.json({ message: 'Status updated successfully', procedureRequest: result.rows[0] });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.put('/procedure-requests/:procedureId', updateProcedureAndTravelDetails);


module.exports = router;
