// controllers/procedureRequestsController.js
const pool = require('../config/db');  // assuming you've set up your database connection

const getDecisionNewPlanDetails = async (req, res) => {
    try {
        const query = `
            SELECT 
                pr.ProcedureID, 
                pr.HN, 
                pd.first_name AS patient_first_name, 
                pd.last_name AS patient_last_name, 
                d.first_name AS doctor_first_name, 
                d.last_name AS doctor_last_name, 
                p.packageName,  -- This will now come from the packages table
                td.cancel_status,  -- This will come from the TravelDetails table
                td.delay_status,   -- This will come from the TravelDetails table
                pr.status, 
                pr.SurgeryDate, 
                td.arrival_date, 
                td.departure_date
            FROM ProcedureRequests pr
            LEFT JOIN PatientDetails pd ON pr.HN = pd.HN
            LEFT JOIN Doctors d ON pr.DoctorsID = d.DoctorsID
            LEFT JOIN Packages p ON pr.PackagesID = p.PackagesID  -- Join Packages table for packageName
            LEFT JOIN TravelDetails td ON pr.ProcedureID = td.ProcedureID  -- Join TravelDetails table for cancel_status and delay_status
            WHERE pr.status IN ('Flight Cancel', 'Flight Delay')
            ORDER BY pr.ProcedureID ASC;
        `;
        
        const result = await pool.query(query);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No procedure requests found.' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching procedure requests:', error);
        res.status(500).json({ error: 'Server error' });
    }
};



// Approve Cancel Status
const approveCancelStatus = async (req, res) => {
    const { procedureId, HN } = req.params;

    try {
        const query = `
            UPDATE TravelDetails
            SET cancel_status = 'Approved'
            WHERE ProcedureID = $1 AND HN = $2 AND cancel_status = 'Waiting for Approval'
            RETURNING *;
        `;
        
        const result = await pool.query(query, [procedureId, HN]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'No travel details found to approve cancel status.' });
        }

        res.json({ message: 'Cancel status approved successfully', travelDetails: result.rows[0] });
    } catch (error) {
        console.error('Error approving cancel status:', error);
        res.status(500).json({ error: 'Server error' });
    }
};



// Approve Delay Status
const approveDelayStatus = async (req, res) => {
    const { procedureId, HN } = req.params;

    try {
        const query = `
            UPDATE TravelDetails
            SET delay_status = 'Approved'
            WHERE ProcedureID = $1 AND HN = $2 AND delay_status = 'Waiting for Approval'
            RETURNING *;
        `;
        
        const result = await pool.query(query, [procedureId, HN]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'No travel details found to approve delay status.' });
        }

        res.json({ message: 'Delay status approved successfully', travelDetails: result.rows[0] });
    } catch (error) {
        console.error('Error approving delay status:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getDecisionNewPlanDetails,
    approveCancelStatus,
    approveDelayStatus
};
