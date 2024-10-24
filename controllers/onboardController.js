const pool = require('../config/db'); // Assuming you have a db.js or db setup for PostgreSQL

// Fetch travel details by procedureId and HN
const getOnboardDetails = async (req, res) => {
    const { procedureId, HN } = req.params;

    try {
        const query = `
            SELECT 
                td.departure_location,
                td.departure_time,
                td.arrival_location,
                td.arrival_time,
                td.departure_date,
                p.first_name AS patient_first_name,
                p.last_name AS patient_last_name
            FROM 
                TravelDetails td
            JOIN 
                ProcedureRequests pr ON td.ProcedureID = pr.ProcedureID
            JOIN 
                PatientDetails p ON pr.HN = p.HN
            WHERE 
                td.ProcedureID = $1 AND p.HN = $2
        `;
        const result = await pool.query(query, [procedureId, HN]);

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'No travel details found for the provided ProcedureID and HN.' });
        }
    } catch (error) {
        console.error('Error fetching travel details:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update travel status to "On Board"
// Update travel status to "On Board Arrival Flight Cancel Flight Delay"
const updateStatusOnBoard = async (req, res) => {
    const { procedureId, HN, status } = req.body;

    if (!procedureId || !HN || !status) {
        return res.status(400).json({ error: 'Missing required fields: procedureId, HN, or status.' });
    }

    try {
        const query = `
            UPDATE ProcedureRequests 
            SET status = $1
            WHERE ProcedureID = $2 AND HN = $3
            RETURNING *;
        `;
        const result = await pool.query(query, [status, procedureId, HN]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'No procedure found to update.' });
        }

        res.json({ message: 'Status updated to On Board successfully', procedure: result.rows[0] });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update patient travel status (Arrival, Flight Cancel, Flight Delay)
// Update patient status in ProcedureRequests table
const updatePatientStatus = async (req, res) => {
    const { procedureId, HN } = req.params;
    const { status } = req.body;

    if (!procedureId || !HN || !status) {
        return res.status(400).json({ error: 'Missing required fields: procedureId, HN, or status.' });
    }

    try {
        const query = `
            UPDATE ProcedureRequests
            SET status = $1
            WHERE ProcedureID = $2 AND HN = $3
            RETURNING *;
        `;
        const result = await pool.query(query, [status, procedureId, HN]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'No procedure found to update.' });
        }

        res.json({ message: `Status updated to ${status} successfully`, procedure: result.rows[0] });
    } catch (error) {
        console.error('Error updating patient status:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update cancel_status in TravelDetails table
const updateCancelStatus = async (req, res) => {
    const { procedureId, HN } = req.params;

    if (!procedureId || !HN) {
        return res.status(400).json({ error: 'Missing required fields: procedureId or HN.' });
    }

    try {
        const query = `
            UPDATE TravelDetails
            SET cancel_status = 'Waiting for Approval'
            WHERE ProcedureID = $1 AND HN = $2
            RETURNING *;
        `;
        const result = await pool.query(query, [procedureId, HN]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'No travel details found to update.' });
        }

        res.json({ message: 'Cancel status updated successfully', travelDetails: result.rows[0] });
    } catch (error) {
        console.error('Error updating cancel status:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update delay_status in TravelDetails table
const updateDelayStatus = async (req, res) => {
    const { procedureId, HN } = req.params;

    if (!procedureId || !HN) {
        return res.status(400).json({ error: 'Missing required fields: procedureId or HN.' });
    }

    try {
        const query = `
            UPDATE TravelDetails
            SET delay_status = 'Waiting for Approval'
            WHERE ProcedureID = $1 AND HN = $2
            RETURNING *;
        `;
        const result = await pool.query(query, [procedureId, HN]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'No travel details found to update.' });
        }

        res.json({ message: 'Delay status updated successfully', travelDetails: result.rows[0] });
    } catch (error) {
        console.error('Error updating delay status:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


// Update travel details after flight cancel
const updateFlightCancel = async (req, res) => {
    const { procedureId, HN } = req.params;
    const { departure_location, arrival_location, departure_date, departure_time, arrival_date, arrival_time, flight_number,cancel_status } = req.body;

    try {
        const updateQuery = `
            UPDATE TravelDetails
            SET
                departure_location = $1,
                arrival_location = $2,
                departure_date = $3,
                departure_time = $4,
                arrival_date = $5,
                arrival_time = $6,
                flight_number = $7,
                cancel_status = $8
            WHERE ProcedureID = $9 AND HN = $10
            RETURNING *;
        `;

        const values = [
            departure_location,
            arrival_location,
            departure_date,
            departure_time,
            arrival_date,
            arrival_time,
            flight_number,
            cancel_status,
            procedureId,
            HN
        ];

        const result = await pool.query(updateQuery, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Travel details not found' });
        }

        res.json({ message: 'Travel details updated successfully', travelDetails: result.rows[0] });
    } catch (error) {
        console.error('Error updating travel details:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateFlightDelay = async (req, res) => {
    const { procedureId, HN } = req.params;
    const { departure_date, departure_time, arrival_date, arrival_time, flight_number,delay_status } = req.body;

    try {
        const updateQuery = `
            UPDATE TravelDetails
            SET
                departure_date = $1,
                departure_time = $2,
                arrival_date = $3,
                arrival_time = $4,
                flight_number = $5,
                delay_status = $6
            WHERE ProcedureID = $7 AND HN = $8
            RETURNING *;
        `;

        const values = [
            departure_date,
            departure_time,
            arrival_date,
            arrival_time,
            flight_number,
            delay_status,
            procedureId,
            HN
        ];

        const result = await pool.query(updateQuery, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Travel details not found' });
        }

        res.json({ message: 'Travel details updated successfully', travelDetails: result.rows[0] });
    } catch (error) {
        console.error('Error updating travel details:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


// Fetch travel details based on procedureId and HN
const getDecisionDelayDetails = async (req, res) => {
    const { procedureId, HN } = req.params;

    try {
        const query = `
            SELECT 
                departure_location, 
                arrival_location, 
                departure_date, 
                departure_time, 
                arrival_date, 
                arrival_time, 
                delay_status 
            FROM TravelDetails 
            WHERE ProcedureID = $1 AND HN = $2
        `;
        const result = await pool.query(query, [procedureId, HN]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No travel details found for the specified procedure and patient.' });
        }

        res.json(result.rows[0]);  // Return the travel details
    } catch (error) {
        console.error('Error fetching travel details:', error);
        res.status(500).json({ error: 'Server error while fetching travel details.' });
    }
};

const getTravelDetailsForDecision = async (req, res) => {
    const { procedureId, HN } = req.params; // Get procedureId and HN from the request parameters

    try {
        const query = `
            SELECT 
                td.departure_location,
                td.departure_time,
                td.arrival_location,
                td.arrival_time,
                td.arrival_date,
                td.cancel_status
            FROM TravelDetails td
            LEFT JOIN ProcedureRequests pr ON td.ProcedureID = pr.ProcedureID
            WHERE pr.ProcedureID = $1 AND pr.HN = $2;
        `;

        const result = await pool.query(query, [procedureId, HN]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No travel details found.' });
        }

        res.json(result.rows[0]); // Send the first row of the result as JSON
    } catch (error) {
        console.error('Error fetching travel details:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getNotifyPlanDetails = async (req, res) => {
    const { procedureId, HN } = req.params;
    // Log received params
    console.log("Backend: Received procedureId:", procedureId);
    console.log("Backend: Received HN:", HN);
    try {
        // First, retrieve the Hospital based on the HN from the Clinic table
        const clinicQuery = `
            SELECT Hospital 
            FROM Clinic 
            WHERE HN = $1;
        `;
        console.log("Backend: Executing clinicQuery:", clinicQuery);

        const clinicResult = await pool.query(clinicQuery, [HN]);
        console.log("Backend: Clinic query result:", clinicResult.rows);

        if (clinicResult.rows.length === 0 || !clinicResult.rows[0].hospital) {
            return res.status(404).json({ message: 'No hospital found for the given HN.' });
        }

        const { hospital } = clinicResult.rows[0];  // Extract Hospital name

        // Now, retrieve the procedure details along with the hospital information
        const procedureQuery = `
            SELECT 
                pr.ProcedureID, 
                pd.first_name AS patient_first_name, 
                pd.last_name AS patient_last_name, 
                d.first_name AS doctor_first_name, 
                d.last_name AS doctor_last_name, 
                p.packageName AS package_name,
                pr.SurgeryDate, 
                $2 AS hospital_name  -- Use the Hospital retrieved from the Clinic query
            FROM ProcedureRequests pr
            LEFT JOIN PatientDetails pd ON pr.HN = pd.HN
            LEFT JOIN Doctors d ON pr.DoctorsID = d.DoctorsID
            LEFT JOIN Packages p ON pr.PackagesID = p.PackagesID
            WHERE pr.ProcedureID = $1 AND pr.HN = $3;
        `;
        console.log("Backend: Executing procedureQuery:", procedureQuery);
        console.log("Backend: Query params:", [procedureId, hospital, HN]);
        const result = await pool.query(procedureQuery, [procedureId, hospital, HN]);
        // Log procedure query and its params


        console.log("Backend: Procedure query result:", result.rows);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No plan details found.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching notify plan details:', error);
        res.status(500).json({ error: 'Server error' });
    }
};




const updateProcedureStatusToOperation = async (req, res) => {
    const { procedureId, HN } = req.params;

    try {
        const query = `
            UPDATE ProcedureRequests
            SET status = 'Operation'
            WHERE ProcedureID = $1 AND HN = $2
            RETURNING *;
        `;

        const result = await pool.query(query, [procedureId, HN]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Procedure not found.' });
        }

        res.json({ message: 'Status updated to Operation', procedure: result.rows[0] });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getDuringTreatmentDetails = async (req, res) => {
    const { procedureId, HN } = req.params;

    try {
        const clinicQuery = `
            SELECT Hospital 
            FROM Clinic 
            WHERE HN = $1;
        `;
        
        const clinicResult = await pool.query(clinicQuery, [HN]);

        if (clinicResult.rows.length === 0 || !clinicResult.rows[0].hospital) {
            return res.status(404).json({ message: 'No hospital found for the given HN.' });
        }

        const { hospital } = clinicResult.rows[0];  // Extract Hospital name

        const procedureQuery = `
            SELECT 
                pr.ProcedureID, 
                pd.first_name AS patient_first_name, 
                pd.last_name AS patient_last_name, 
                d.first_name || ' ' || d.last_name AS doctor_name, 
                p.packageName AS package_name, 
                p.description AS package_details,
                $2 AS hospital_name  -- Use the Hospital retrieved from the Clinic query
            FROM ProcedureRequests pr
            LEFT JOIN PatientDetails pd ON pr.HN = pd.HN
            LEFT JOIN Doctors d ON pr.DoctorsID = d.DoctorsID
            LEFT JOIN Packages p ON pr.PackagesID = p.PackagesID
            WHERE pr.ProcedureID = $1 AND pr.HN = $3;
        `;

        const result = await pool.query(procedureQuery, [procedureId, hospital, HN]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No treatment details found.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching treatment details:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateTreatmentStatus = async (req, res) => {
    const { procedureId, HN } = req.params;
    const { status } = req.body;

    try {
        const query = `
            UPDATE ProcedureRequests
            SET status = $1
            WHERE ProcedureID = $2 AND HN = $3
            RETURNING *;
        `;

        const result = await pool.query(query, [status, procedureId, HN]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'No procedure found to update status.' });
        }

        res.json({ message: `Status updated to ${status} successfully`, procedure: result.rows[0] });
    } catch (error) {
        console.error('Error updating procedure status:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getOnboardDetails,
    updateStatusOnBoard,
    updatePatientStatus,
    updateCancelStatus,
    updateDelayStatus,
    updateFlightCancel,
    updateFlightDelay,
    getDecisionDelayDetails,
    getTravelDetailsForDecision,
    getNotifyPlanDetails,
    updateProcedureStatusToOperation,
    getDuringTreatmentDetails,
    updateTreatmentStatus
};
