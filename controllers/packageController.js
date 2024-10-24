const pool = require('../config/db');

// Get all packages from the database
const getPackages = async (req, res) => {
    try {
        const result = await pool.query('SELECT PackagesID, packageName, description, price, image, target_audience, purpose FROM Packages');
        
        // Send the packages as the response
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ message: 'Error fetching packages' });
    }
};

const getPackageDetails = async (req, res) => {
    const { packageId } = req.params;  // Extract packageId from request parameters

    try {
        const result = await pool.query('SELECT * FROM Packages WHERE PackagesID = $1', [packageId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.status(200).json(result.rows[0]);  // Send the package details as response
    } catch (error) {
        console.error('Error fetching package details:', error);
        res.status(500).json({ message: 'Error fetching package details' });
    }
};

// Function to generate a new ProcedureID
const generateProcedureID = async () => {
    try {
        // Query to get the latest ProcedureID in descending order
        const result = await pool.query('SELECT ProcedureID FROM ProcedureRequests ORDER BY ProcedureID DESC LIMIT 1');

        let newProcedureID = '0000001';  // Default starting ID if no records exist

        if (result.rows.length > 0) {
            const latestProcedureID = result.rows[0].procedureid;
            
            // Increment the ProcedureID by 1
            const numericPart = parseInt(latestProcedureID, 10) + 1;
            
            // Pad the number with leading zeros to ensure it's 7 digits long
            newProcedureID = numericPart.toString().padStart(7, '0');
        }

        return newProcedureID;
    } catch (error) {
        console.error('Error generating ProcedureID:', error);
        throw new Error('Error generating ProcedureID');
    }
};

// const selectPackage = async (req, res) => {
//     const { hn, packageId } = req.body;

//     try {
//         // Generate a new unique ProcedureID
//         const newProcedureID = await generateProcedureID();

//         const query = `
//             INSERT INTO ProcedureRequests 
//             (ProcedureID, HN, PackagesID)
//             VALUES ($1, $2, $3)
//         `;
//         const values = [newProcedureID, hn, packageId];

//         await pool.query(query, values);  // Execute the SQL query

//         res.status(200).json({ message: 'Package selected and procedure request created successfully', ProcedureID: newProcedureID });
//     } catch (error) {
//         console.error('Error inserting into ProcedureRequests:', error);
//         res.status(500).json({ message: 'Error creating procedure request' });
//     }
// };
const selectPackage = async (req, res) => {
    const { hn, packageId } = req.body;

    if (!hn || !packageId) {
        return res.status(400).json({ message: 'HN and packageId are required' });
    }

    try {
        const newProcedureID = await generateProcedureID();

        const query = `
            INSERT INTO ProcedureRequests 
            (ProcedureID, HN, PackagesID)
            VALUES ($1, $2, $3)
        `;
        const values = [newProcedureID, hn, packageId];

        await pool.query(query, values);

        res.status(200).json({ message: 'Package selected and procedure request created successfully', procedureId: newProcedureID });
    } catch (error) {
        console.error('Error inserting into ProcedureRequests:', error.message);
        res.status(500).json({ message: 'Error creating procedure request', error: error.message });
    }
};


module.exports = {
    getPackages,
    getPackageDetails,
    selectPackage
};
