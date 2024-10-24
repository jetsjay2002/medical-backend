const pool = require('../config/db');


const getPackageName = async (req, res) => {
    const { procedureId, HN } = req.params;

    try {
        const query = `
            SELECT p.packageName
            FROM ProcedureRequests pr
            LEFT JOIN Packages p ON pr.PackagesID = p.PackagesID
            WHERE pr.ProcedureID = $1 AND pr.HN = $2;
        `;
        
        // Execute the query with the required parameters
        const result = await pool.query(query, [procedureId, HN]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No package found for this procedure and patient.' });
        }

        res.json({ package_name: result.rows[0].packagename });
    } catch (error) {
        console.error('Error fetching package name:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


const submitServiceRating = async (req, res) => {
    const { procedureId, HN, rating, comment } = req.body;

    // Check for missing required fields
    if (!procedureId || !HN || !rating) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    try {
        // Query to get the maximum ServiceRatingsID
        const maxIdQuery = `SELECT ServiceRatingsID FROM ServiceRatings ORDER BY ServiceRatingsID DESC LIMIT 1;`;
        const maxIdResult = await pool.query(maxIdQuery);
        
        let nextId = '0000001'; // Default ID if there are no existing entries

        if (maxIdResult.rows.length > 0) {
            const lastId = maxIdResult.rows[0].serviceratingsid;
            // Increment the last ID as a string, maintaining 7 characters
            const newId = (parseInt(lastId) + 1).toString().padStart(7, '0');
            nextId = newId;
        }

        const insertQuery = `
            INSERT INTO ServiceRatings (ServiceRatingsID, HN, ProcedureID, service_ratings, service_comment)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        
        // Execute the query with the new ServiceRatingsID
        const result = await pool.query(insertQuery, [nextId, HN, procedureId, rating, comment]);

        res.json({ message: 'Service rating submitted successfully', rating: result.rows[0] });
    } catch (error) {
        console.error('Error submitting service rating:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Controller function to get departure details
const getDepartureDetails = async (req, res) => {
    const { procedureId, HN } = req.params;

    try {
        const query = `
            SELECT 
                pd.first_name || ' ' || pd.last_name AS patient_name, 
                p.packageName AS package_name
            FROM ProcedureRequests pr
            LEFT JOIN PatientDetails pd ON pr.HN = pd.HN
            LEFT JOIN Packages p ON pr.PackagesID = p.PackagesID
            WHERE pr.ProcedureID = $1 AND pr.HN = $2;
        `;
        const result = await pool.query(query, [procedureId, HN]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No departure details found.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching departure details:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Controller function to update the status to "Departure"
const updateDepartureStatus = async (req, res) => {
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
            return res.status(404).json({ message: 'No procedure request found to update status.' });
        }

        res.json({ message: 'Status updated successfully', procedure: result.rows[0] });
    } catch (error) {
        console.error('Error updating departure status:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// const getClinicDetails = async (req, res) => {
//     const { procedureId, HN } = req.params;

//     try {
//         const query = `
//             SELECT 
//                 pr.ProcedureID, 
//                 pd.first_name AS patient_first_name, 
//                 pd.last_name AS patient_last_name, 
//                 d.first_name AS doctor_first_name, 
//                 d.last_name AS doctor_last_name, 
//                 p.packageName AS package_name,
//                 pr.SurgeryDate, 
//                 c.Hospital AS hospital_name  -- Fetching the hospital name from Clinic
//             FROM ProcedureRequests pr
//             LEFT JOIN PatientDetails pd ON pr.HN = pd.HN
//             LEFT JOIN Doctors d ON pr.DoctorsID = d.DoctorsID
//             LEFT JOIN Packages p ON pr.PackagesID = p.PackagesID
//             LEFT JOIN Clinic c ON c.HN = pr.HN  -- Use HN to get the ClinicID from Clinic table
//             WHERE pr.ProcedureID = $1 AND pr.HN = $2;

//         `;

//         const result = await pool.query(query, [procedureId, HN]);

//         if (result.rows.length === 0) {
//             return res.status(404).json({ message: 'No clinic details found.' });
//         }

//         res.json(result.rows[0]);
//     } catch (error) {
//         console.error('Error fetching clinic details:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// };
const getClinicDetails = async (req, res) => {
    const { procedureId, HN } = req.params;

    try {
        const query = `
            SELECT 
                pr.ProcedureID, 
                pd.first_name AS patient_first_name, 
                pd.last_name AS patient_last_name, 
                d.first_name AS doctor_first_name, 
                d.last_name AS doctor_last_name, 
                p.packageName AS package_name,
                pr.SurgeryDate, 
                c.Hospital AS hospital_name,
                c.ClinicID  -- Return the ClinicID
            FROM ProcedureRequests pr
            LEFT JOIN PatientDetails pd ON pr.HN = pd.HN
            LEFT JOIN Doctors d ON pr.DoctorsID = d.DoctorsID
            LEFT JOIN Packages p ON pr.PackagesID = p.PackagesID
            LEFT JOIN Clinic c ON pd.HN = c.HN  -- Join the Clinic based on HN
            WHERE pr.ProcedureID = $1 AND pr.HN = $2;
        `;

        const result = await pool.query(query, [procedureId, HN]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No clinic details found.' });
        }

        res.json(result.rows[0]);  // Return the clinic and other procedure details
    } catch (error) {
        console.error('Error fetching clinic details:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


const submitClinicRating = async (req, res) => {
    const { procedureId, HN, rating, comment, clinicId } = req.body;

    try {
        // Generate a unique ClinicRatingsID, incrementing from the existing ones
        const maxIdQuery = `SELECT MAX(CAST(ClinicRatingsID AS INT)) FROM ClinicRatings`;
        const maxIdResult = await pool.query(maxIdQuery);
        const newId = String(maxIdResult.rows[0].max + 1).padStart(7, '0'); // Ensure ID is 7 characters long

        const query = `
            INSERT INTO ClinicRatings (ClinicRatingsID, HN, ProcedureID, ClinicID, clinic_ratings, clinic_comment, ratingDate)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        `;

        await pool.query(query, [newId, HN, procedureId, clinicId, rating, comment]);

        res.json({ message: 'Clinic rating submitted successfully.' });
    } catch (error) {
        console.error('Error submitting clinic rating:', error);
        res.status(500).json({ error: 'Server error' });
    }
};



module.exports = {
    getPackageName,
    submitServiceRating,
    getDepartureDetails,
    updateDepartureStatus,
    getClinicDetails,
    submitClinicRating
};