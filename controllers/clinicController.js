const pool = require('../config/db');

const getClinicDataByHN = async (HN) => {
    try {
        // Query to get clinic data by HN
        const result = await pool.query('SELECT * FROM Clinic WHERE HN = $1', [HN]);

        if (result.rows.length === 0) {
            return [];  // Return an empty array if no data is found
        }

        return result.rows;  // Return clinic data rows
    } catch (error) {
        console.error('Error fetching clinic data:', error);
        throw new Error('Error fetching clinic data');
    }
};


const saveClinicData = async (req, res) => {
    const { hn, medicalProblem, hospital } = req.body;

    // Ensure all required data is provided
    if (!hn || !medicalProblem || !hospital) {
        return res.status(400).json({ message: 'HN, Medical Problem, and Hospital are required' });
    }

    try {
        // Generate a new ClinicID (you may modify the logic for generating ClinicID)
        const clinicIDQuery = `
            SELECT ClinicID 
            FROM Clinic 
            ORDER BY ClinicID DESC 
            LIMIT 1;
        `;
        const clinicIDResult = await pool.query(clinicIDQuery);
        let newClinicID = '001';  // Default starting ID

        if (clinicIDResult.rows.length > 0) {
            const latestClinicID = clinicIDResult.rows[0].clinicid;
            const numericPart = parseInt(latestClinicID, 10) + 1;
            newClinicID = numericPart.toString().padStart(3, '0');  // Pad the number to 3 digits
        }

        // Insert or update the clinic data for the user based on ClinicID (Primary Key)
        const query = `
            INSERT INTO Clinic (ClinicID, HN, MedicalProblem, Hospital)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (ClinicID) DO UPDATE 
            SET MedicalProblem = EXCLUDED.MedicalProblem, Hospital = EXCLUDED.Hospital;
        `;

        // Execute the query with the generated ClinicID and provided data
        await pool.query(query, [newClinicID, hn, medicalProblem, hospital]);

        // Respond with success message
        res.status(200).json({ message: 'Clinic data saved successfully' });
    } catch (error) {
        console.error('Error saving clinic data:', error);
        res.status(500).json({ message: 'Error saving clinic data' });
    }
};

// Helper function to safely stringify objects with potential circular references
const safeStringify = (obj) => {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
                return;  // Circular reference found, discard key
            }
            cache.add(value);
        }
        return value;
    });
};

// const getClinicDataByHNAgent = async (HN) => {
//     try {
//         // Query to get clinic data by HN
//         const result = await pool.query('SELECT * FROM Clinic WHERE HN = $1', [HN]);

//         if (result.rows.length === 0) {
//             console.log(`No clinic data found for HN: ${HN}`);
//             return [];  // Return an empty array if no data is found
//         }

//         // Log only the necessary information (number of rows) to avoid circular structure issues
//         console.log(`Fetched ${result.rows.length} clinic data entries for HN: ${HN}`);

//         return result.rows;  // Return clinic data rows
//     } catch (error) {
//         // Safely log the error object
//         console.error('Error fetching clinic data:', safeStringify(error));
//         throw new Error('Error fetching clinic data');
//     }
// };

// const saveClinicDataAgent = async (req, res) => {
//     const { hn, medicalProblem, hospital } = req.body;

//     // Ensure all required data is provided
//     if (!hn || !medicalProblem || !hospital) {
//         return res.status(400).json({ message: 'HN, Medical Problem, and Hospital are required' });
//     }

//     try {
//         // Generate a new ClinicID (you may modify the logic for generating ClinicID)
//         const clinicIDQuery = `
//             SELECT ClinicID 
//             FROM Clinic 
//             ORDER BY ClinicID DESC 
//             LIMIT 1;
//         `;
//         const clinicIDResult = await pool.query(clinicIDQuery);
//         let newClinicID = '001';  // Default starting ID

//         if (clinicIDResult.rows.length > 0) {
//             const latestClinicID = clinicIDResult.rows[0].clinicid;
//             const numericPart = parseInt(latestClinicID, 10) + 1;
//             newClinicID = numericPart.toString().padStart(3, '0');  // Pad the number to 3 digits
//         }

//         // Insert or update the clinic data for the user based on ClinicID (Primary Key)
//         const query = `
//             INSERT INTO Clinic (ClinicID, HN, MedicalProblem, Hospital)
//             VALUES ($1, $2, $3, $4)
//             ON CONFLICT (ClinicID) DO UPDATE 
//             SET MedicalProblem = EXCLUDED.MedicalProblem, Hospital = EXCLUDED.Hospital;
//         `;

//         // Execute the query with the generated ClinicID and provided data
//         await pool.query(query, [newClinicID, hn, medicalProblem, hospital]);

//         // Respond with success message
//         res.status(200).json({ message: 'Clinic data saved successfully' });
//     } catch (error) {
//         console.error('Error saving clinic data:', safeStringify(error));
//         res.status(500).json({ message: 'Error saving clinic data' });
//     }
// };
// Check if HN exists in Clinic table
const checkHNInClinic = async (req, res) => {
    const { hn } = req.params;

    try {
        // Query to check if HN exists in the Clinic table
        const result = await pool.query('SELECT * FROM Clinic WHERE HN = $1', [hn]);

        if (result.rows.length > 0) {
            // HN exists in the clinic table
            return res.status(200).json({ exists: true });
        }

        // HN does not exist in the clinic table
        return res.status(200).json({ exists: false });
    } catch (error) {
        console.error('Error checking HN in Clinic table:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getClinicDataByHN,
    saveClinicData,
    // getClinicDataByHNAgent,
    // saveClinicDataAgent
    checkHNInClinic
};
