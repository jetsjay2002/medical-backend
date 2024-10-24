const pool = require('../config/db');  // assuming you've set up your database connection


// Fetch procedure and travel details for a specific patient and procedure
// const getProcedureAndTravelDetails = async (req, res) => {
//     const { hn, procedureID } = req.params;

//     try {
//         // Fetch procedure status
//         const procedureQuery = `
//             SELECT status 
//             FROM ProcedureRequests 
//             WHERE ProcedureID = $1 AND HN = $2
//         `;
//         const procedureResult = await pool.query(procedureQuery, [procedureID, hn]);

//         if (procedureResult.rows.length === 0) {
//             return res.status(404).json({ message: 'Procedure not found.' });
//         }

//         const procedureStatus = procedureResult.rows[0].status;

//         // Check if travel details exist for the procedure
//         const travelQuery = `
//             SELECT * 
//             FROM TravelDetails
//             WHERE ProcedureID = $1
//         `;
//         const travelResult = await pool.query(travelQuery, [procedureID]);

//         let travelDetails = null;
//         let taxiStatus = null;
//         let hotelStatus = null;

//         if (travelResult.rows.length > 0) {
//             travelDetails = travelResult.rows[0];

//             // Check taxi status
//             const taxiQuery = `
//                 SELECT taxi_status 
//                 FROM TaxiBookings
//                 WHERE ProcedureID = $1
//             `;
//             const taxiResult = await pool.query(taxiQuery, [procedureID]);
//             if (taxiResult.rows.length > 0) {
//                 taxiStatus = taxiResult.rows[0].taxi_status;
//             }

//             // Check hotel status
//             const hotelQuery = `
//                 SELECT hotel_status 
//                 FROM HotelBookings
//                 WHERE ProcedureID = $1
//             `;
//             const hotelResult = await pool.query(hotelQuery, [procedureID]);
//             if (hotelResult.rows.length > 0) {
//                 hotelStatus = hotelResult.rows[0].hotel_status;
//             }
//         }

//         // Return the procedure status, travel details, taxi status, and hotel status
//         res.status(200).json({ procedureStatus, travelDetails, taxiStatus, hotelStatus });
//     } catch (error) {
//         console.error('Error fetching procedure and travel details:', error);
//         res.status(500).json({ error: 'Failed to fetch procedure and travel details.' });
//     }
// };

// const getProcedureAndTravelDetails = async (req, res) => {
//     const { hn, procedureID } = req.params;

//     try {
//         // Fetch procedure status
//         const procedureQuery = `
//             SELECT status 
//             FROM ProcedureRequests 
//             WHERE ProcedureID = $1 AND HN = $2
//         `;
//         const procedureResult = await pool.query(procedureQuery, [procedureID, hn]);

//         if (procedureResult.rows.length === 0) {
//             return res.status(404).json({ message: 'Procedure not found.' });
//         }

//         const procedureStatus = procedureResult.rows[0].status;

//         // Check if travel details, taxi bookings, and hotel bookings exist for the procedure
//         const travelDetailsQuery = `
//             SELECT td.cancel_status, td.delay_status, tb.taxi_status, hb.hotel_status
//             FROM TravelDetails td
//             LEFT JOIN TaxiBookings tb ON td.ProcedureID = tb.ProcedureID
//             LEFT JOIN HotelBookings hb ON td.ProcedureID = hb.ProcedureID
//             WHERE td.ProcedureID = $1
//         `;
//         const travelDetailsResult = await pool.query(travelDetailsQuery, [procedureID]);

//         let travelDetails = null;
//         if (travelDetailsResult.rows.length > 0) {
//             travelDetails = travelDetailsResult.rows[0];
//         }

//         // Return the procedure status and travel details
//         res.status(200).json({ procedureStatus, travelDetails });
//     } catch (error) {
//         console.error('Error fetching procedure and travel details:', error);
//         res.status(500).json({ error: 'Failed to fetch procedure and travel details.' });
//     }
// };

const getProcedureAndTravelDetails = async (req, res) => {
    const { hn, procedureID } = req.params;

    try {
        // Fetch procedure status
        const procedureQuery = `
            SELECT status 
            FROM ProcedureRequests 
            WHERE ProcedureID = $1 AND HN = $2
        `;
        const procedureResult = await pool.query(procedureQuery, [procedureID, hn]);

        if (procedureResult.rows.length === 0) {
            return res.status(404).json({ message: 'Procedure not found.' });
        }

        const procedureStatus = procedureResult.rows[0].status;

        // Check travel details, taxi bookings, and hotel bookings for the procedure
        const travelDetailsQuery = `
            SELECT td.cancel_status, td.delay_status, tb.taxi_status, hb.hotel_status
            FROM TravelDetails td
            LEFT JOIN TaxiBookings tb ON td.ProcedureID = tb.ProcedureID
            LEFT JOIN HotelBookings hb ON td.ProcedureID = hb.ProcedureID
            WHERE td.ProcedureID = $1
        `;
        const travelDetailsResult = await pool.query(travelDetailsQuery, [procedureID]);

        let travelDetails = null;
        if (travelDetailsResult.rows.length > 0) {
            travelDetails = travelDetailsResult.rows[0];
        }

        // Check if ServiceRatings exist for this procedure
        const serviceRatingsQuery = `
            SELECT ProcedureID 
            FROM ServiceRatings 
            WHERE ProcedureID = $1
        `;
        const serviceRatingsResult = await pool.query(serviceRatingsQuery, [procedureID]);
        const serviceRatingExists = serviceRatingsResult.rows.length > 0;

        // Check if ClinicRatings exist for this procedure
        const clinicRatingsQuery = `
            SELECT ProcedureID 
            FROM ClinicRatings 
            WHERE ProcedureID = $1
        `;
        const clinicRatingsResult = await pool.query(clinicRatingsQuery, [procedureID]);
        const clinicRatingExists = clinicRatingsResult.rows.length > 0;

        // Return the procedure status, travel details, and ratings
        res.status(200).json({ 
            procedureStatus, 
            travelDetails, 
            serviceRatingExists, 
            clinicRatingExists 
        });
    } catch (error) {
        console.error('Error fetching procedure, travel, and ratings details:', error);
        res.status(500).json({ error: 'Failed to fetch procedure, travel, and ratings details.' });
    }
};



// Fetch all procedures for a patient by HN
const getProceduresByPatient = async (req, res) => {
    const { hn } = req.params;

    try {
        // Fetch all procedures for a given patient (HN)
        const proceduresQuery = `
            SELECT pr.ProcedureID, pr.status, pk.packageName, 
                   d.first_name AS doctor_first_name, d.last_name AS doctor_last_name
            FROM ProcedureRequests pr
            JOIN Doctors d ON pr.DoctorsID = d.DoctorsID
            JOIN Packages pk ON pr.PackagesID = pk.PackagesID
            WHERE pr.HN = $1
        `;

        const result = await pool.query(proceduresQuery, [hn]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No procedures found for this patient.' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching procedures:', error);
        res.status(500).json({ error: 'Failed to fetch procedures.' });
    }
};

module.exports = {
    getProcedureAndTravelDetails,
    getProceduresByPatient,
};