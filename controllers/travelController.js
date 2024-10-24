const pool = require('../config/db'); // Import the correct pool connection

const generateNewId = async (table, column) => {
    try {
        const result = await pool.query(`SELECT MAX(${column}) as max_id FROM ${table}`);
        let maxId = result.rows[0].max_id;

        // If there's no existing ID, start with 0000001
        if (!maxId) {
            return '0000001';
        }

        // Convert the ID to an integer, increment it, and then pad with leading zeros
        const newId = (parseInt(maxId, 10) + 1).toString().padStart(7, '0');
        return newId;
    } catch (error) {
        console.error('Error generating new ID:', error);
        throw error;
    }
};


// Controller function to save travel details, taxi, and hotel bookings
// const saveTravelDetails = async (req, res) => {
//     const {
//         procedureId,
//         HN,
//         departure_location,
//         arrival_location,
//         departure_date,
//         departure_time,
//         arrival_date,
//         arrival_time,
//         flight_number,
//         companion_first_name,
//         companion_last_name,
//         companion_middle_name,
//         taxiData,
//         hotelData
//     } = req.body;

//     try {
//         // Check if ProcedureID already exists in TravelDetails
//         const checkQuery = `SELECT ProcedureID FROM TravelDetails WHERE ProcedureID = $1`;
//         const checkResult = await pool.query(checkQuery, [procedureId]);
//         console.log('Check result for existing ProcedureID:', checkResult.rows);


//         if (checkResult.rows.length > 0) {
//             // If ProcedureID already exists, update the existing record
//             const updateTravelDetailsQuery = `
//                 UPDATE TravelDetails
//                 SET 
//                     departure_location = $2,
//                     arrival_location = $3,
//                     departure_date = $4,
//                     departure_time = $5,
//                     arrival_date = $6,
//                     arrival_time = $7,
//                     flight_number = $8
//                 WHERE ProcedureID = $1
//                 RETURNING ProcedureID;
//             `;
//             const updateValues = [
//                 procedureId,
//                 departure_location,
//                 arrival_location,
//                 departure_date,
//                 departure_time || null,
//                 arrival_date,
//                 arrival_time || null,
//                 flight_number
//             ];
//             const updateResult = await pool.query(updateTravelDetailsQuery, updateValues);
//             console.log('Travel details updated:', updateResult.rows[0].procedureid);
//         } else {
//             // If ProcedureID does not exist, insert a new record
//             const travelDetailsQuery = `
//                 INSERT INTO TravelDetails (
//                     ProcedureID,
//                     HN,
//                     departure_location,
//                     arrival_location,
//                     departure_date,
//                     departure_time,
//                     arrival_date,
//                     arrival_time,
//                     flight_number
//                 ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
//                 RETURNING ProcedureID;
//             `;

//             const travelDetailsValues = [
//                 procedureId,
//                 HN,
//                 departure_location,
//                 arrival_location,
//                 departure_date,
//                 departure_time || null,
//                 arrival_date,
//                 arrival_time || null,
//                 flight_number
//             ];

//             const travelDetailsResult = await pool.query(travelDetailsQuery, travelDetailsValues);
//             console.log('Travel details inserted:', travelDetailsResult.rows[0].procedureid);
//         }

//         // Insert or update companion details if provided
//         if (companion_first_name || companion_last_name || companion_middle_name) {
//             const companionQuery = `
//                 INSERT INTO TravelCompanions (
//                     ProcedureID,
//                     HN,
//                     first_name,
//                     last_name,
//                     middle_name
//                 ) VALUES ($1, $2, $3, $4, $5)
//                 ON CONFLICT (ProcedureID) DO UPDATE
//                 SET first_name = EXCLUDED.first_name,
//                     last_name = EXCLUDED.last_name,
//                     middle_name = EXCLUDED.middle_name;
//             `;
//             const companionValues = [
//                 procedureId,
//                 HN,
//                 companion_first_name || null,
//                 companion_last_name || null,
//                 companion_middle_name || null
//             ];
//             await pool.query(companionQuery, companionValues);
//         }

//         // Insert or update taxi booking if taxi was selected
//         if (taxiData && taxiData.status === 'Waiting for confirmed') {
//             console.log('Inserting/updating taxi data:', taxiData);

//             // Generate a new TaxiBookingsID
            
//             const newTaxiId = await generateNewId('TaxiBookings', 'TaxiBookingsID');

//             const taxiQuery = `
//                 INSERT INTO TaxiBookings (
//                     TaxiBookingsID,
//                     HN,
//                     ProcedureID,
//                     vehicle_type,
//                     num_passengers,
//                     taxi_status
//                 ) VALUES ($1, $2, $3, $4, $5, $6)
//                 ON CONFLICT (ProcedureID) DO UPDATE
//                 SET vehicle_type = EXCLUDED.vehicle_type,
//                     num_passengers = EXCLUDED.num_passengers,
//                     taxi_status = EXCLUDED.taxi_status;
//             `;
//             const taxiValues = [
//                 newTaxiId, // Use the new generated ID
//                 HN,
//                 procedureId,
//                 taxiData.vehicle_type || null,
//                 taxiData.num_passengers || null,
//                 taxiData.status
//             ];
//             await pool.query(taxiQuery, taxiValues);
//         }


//         // Insert or update hotel booking if hotel was selected
//         if (hotelData && hotelData.status === 'Waiting for confirmed') {
//             console.log('Inserting/updating hotel data:', hotelData);

//             // Generate a new HotelBookingsID
//             const newHotelId = await generateNewId('HotelBookings', 'HotelBookingsID');

//             const hotelQuery = `
//                 INSERT INTO HotelBookings (
//                     HotelBookingsID,
//                     HN,
//                     ProcedureID,
//                     num_of_rooms,
//                     room_type,
//                     nights_stayed,
//                     check_in_date,
//                     check_in_time,
//                     check_out_date,
//                     check_out_time,
//                     hotel_status
//                 ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
//                 ON CONFLICT (ProcedureID) DO UPDATE
//                 SET num_of_rooms = EXCLUDED.num_of_rooms,
//                     room_type = EXCLUDED.room_type,
//                     nights_stayed = EXCLUDED.nights_stayed,
//                     check_in_date = EXCLUDED.check_in_date,
//                     check_in_time = EXCLUDED.check_in_time,
//                     check_out_date = EXCLUDED.check_out_date,
//                     check_out_time = EXCLUDED.check_out_time,
//                     hotel_status = EXCLUDED.hotel_status;
//             `;
//             const hotelValues = [
//                 newHotelId, // Use the new generated ID
//                 HN,
//                 procedureId,
//                 hotelData.num_of_rooms || null,
//                 hotelData.room_type || null,
//                 hotelData.nights_stayed || null,
//                 hotelData.check_in_date || null,
//                 hotelData.check_in_time || null,
//                 hotelData.check_out_date || null,
//                 hotelData.check_out_time || null,
//                 hotelData.status
//             ];
//             await pool.query(hotelQuery, hotelValues);
//         }

//         res.json({ travel_details_id: procedureId });
//     } catch (error) {
//         console.error('Error saving travel details, taxi, and hotel bookings:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// };
// Controller function to save travel details, taxi, and hotel bookings
// const saveTravelDetails = async (req, res) => {
//     const {
//         procedureId,
//         HN,
//         departure_location,
//         arrival_location,
//         departure_date,
//         departure_time,
//         arrival_date,
//         arrival_time,
//         flight_number,
//         companion_first_name,
//         companion_last_name,
//         companion_middle_name,
//         taxiData,   // This will contain taxi-related information
//         hotelData   // This will contain hotel-related information
//     } = req.body;
//     console.log("Received travel details:", req.body);  // Add a log to verify incoming data

//     try {
//         // Validate essential travel details data
//         if (!procedureId || !HN || !departure_location || !arrival_location || !departure_date || !arrival_date || !flight_number) {
//             return res.status(400).json({ error: 'Missing essential travel details.' });
//         }

//         // Insert or update travel details
//         const travelDetailsQuery = `
//             INSERT INTO TravelDetails (
//                 ProcedureID, HN, departure_location, arrival_location,
//                 departure_date, departure_time, arrival_date, arrival_time, flight_number
//             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
//             ON CONFLICT (ProcedureID) DO UPDATE
//             SET departure_location = EXCLUDED.departure_location,
//                 arrival_location = EXCLUDED.arrival_location,
//                 departure_date = EXCLUDED.departure_date,
//                 departure_time = EXCLUDED.departure_time,
//                 arrival_date = EXCLUDED.arrival_date,
//                 arrival_time = EXCLUDED.arrival_time,
//                 flight_number = EXCLUDED.flight_number;
//         `;
//         const travelDetailsValues = [
//             procedureId, HN, departure_location, arrival_location, departure_date,
//             departure_time || null, arrival_date, arrival_time || null, flight_number
//         ];
//         await pool.query(travelDetailsQuery, travelDetailsValues);

//         // Insert or update companion details if provided
//         if (companion_first_name || companion_last_name || companion_middle_name) {
//             const companionQuery = `
//                 INSERT INTO TravelCompanions (
//                     ProcedureID, HN, first_name, last_name, middle_name
//                 ) VALUES ($1, $2, $3, $4, $5)
//                 ON CONFLICT (ProcedureID) DO UPDATE
//                 SET first_name = EXCLUDED.first_name,
//                     last_name = EXCLUDED.last_name,
//                     middle_name = EXCLUDED.middle_name;
//             `;
//             const companionValues = [
//                 procedureId, HN, companion_first_name || null, companion_last_name || null, companion_middle_name || null
//             ];
//             await pool.query(companionQuery, companionValues);
//         }

//         if (taxiData) {
//             const newTaxiId = await generateNewId('TaxiBookings', 'TaxiBookingsID');
//             const taxiQuery = `
//                 INSERT INTO TaxiBookings (
//                     TaxiBookingsID, HN, ProcedureID, vehicle_type, num_passengers, taxi_status
//                 ) VALUES ($1, $2, $3, $4, $5, $6)
//                 ON CONFLICT (TaxiBookingsID) DO UPDATE
//                 SET vehicle_type = EXCLUDED.vehicle_type,
//                     num_passengers = EXCLUDED.num_passengers,
//                     taxi_status = EXCLUDED.taxi_status;
//             `;
//             const taxiValues = [
//                 newTaxiId, HN, procedureId,
//                 taxiData?.vehicle_type || null,
//                 taxiData?.num_passengers || null,
//                 taxiData ? 'Waiting for confirmed' : null
//             ];
//             await pool.query(taxiQuery, taxiValues);
//         } else {
//             console.log('No taxi data provided.');
//         }
        
//         if (hotelData) {
//             const newHotelId = await generateNewId('HotelBookings', 'HotelBookingsID');
//             const hotelQuery = `
//                 INSERT INTO HotelBookings (
//                     HotelBookingsID, HN, ProcedureID, num_of_rooms, number_of_guest, room_type, nights_stayed,
//                     check_in_date, check_in_time, check_out_date, check_out_time, hotel_status
//                 ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
//                 ON CONFLICT (HotelBookingsID) DO UPDATE
//                 SET num_of_rooms = EXCLUDED.num_of_rooms,
//                     number_of_guest = EXCLUDED.number_of_guest,
//                     room_type = EXCLUDED.room_type,
//                     nights_stayed = EXCLUDED.nights_stayed,
//                     check_in_date = EXCLUDED.check_in_date,
//                     check_in_time = EXCLUDED.check_in_time,
//                     check_out_date = EXCLUDED.check_out_date,
//                     check_out_time = EXCLUDED.check_out_time,
//                     hotel_status = EXCLUDED.hotel_status;
//             `;
//             const hotelValues = [
//                 newHotelId, HN, procedureId,
//                 hotelData?.num_of_rooms || null,
//                 hotelData?.number_of_guest || null, // Add number of guests here
//                 hotelData?.room_type || null,
//                 hotelData?.nights_stayed || null,
//                 hotelData?.check_in_date || null,
//                 hotelData?.check_in_time || null,
//                 hotelData?.check_out_date || null,
//                 hotelData?.check_out_time || null,
//                 hotelData ? 'Waiting for confirmed' : null
//             ];
//             await pool.query(hotelQuery, hotelValues);
//         } else {
//             console.log('No hotel data provided.');
//         }

//         // Successfully saved all details
//         res.status(200).json({ procedureId });
//     } catch (error) {
//         console.error('Error saving travel details, taxi, and hotel bookings:', error);
//         res.status(500).json({ error: 'Server error while saving travel details.' });
//     }
// };

const saveTravelDetails = async (req, res) => {
    const {
        procedureId,
        HN,
        departure_location,
        arrival_location,
        departure_date,
        departure_time,
        arrival_date,
        arrival_time,
        flight_number,
        companion_first_name,
        companion_last_name,
        companion_middle_name,
        taxiData,   // This will contain taxi-related information
        hotelData   // This will contain hotel-related information
    } = req.body;

    console.log("Received travel details:", req.body);  // Add a log to verify incoming data

    try {
        // Validate essential travel details data
        if (!procedureId || !HN || !departure_location || !arrival_location || !departure_date || !arrival_date || !flight_number) {
            return res.status(400).json({ error: 'Missing essential travel details.' });
        }

        // Insert or update travel details
        const travelDetailsQuery = `
            INSERT INTO TravelDetails (
                ProcedureID, HN, departure_location, arrival_location,
                departure_date, departure_time, arrival_date, arrival_time, flight_number
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (ProcedureID) DO UPDATE
            SET departure_location = EXCLUDED.departure_location,
                arrival_location = EXCLUDED.arrival_location,
                departure_date = EXCLUDED.departure_date,
                departure_time = EXCLUDED.departure_time,
                arrival_date = EXCLUDED.arrival_date,
                arrival_time = EXCLUDED.arrival_time,
                flight_number = EXCLUDED.flight_number;
        `;
        const travelDetailsValues = [
            procedureId, HN, departure_location, arrival_location, departure_date,
            departure_time || null, arrival_date, arrival_time || null, flight_number
        ];
        await pool.query(travelDetailsQuery, travelDetailsValues);

        // Insert or update companion details if provided
        if (companion_first_name || companion_last_name || companion_middle_name) {
            const companionQuery = `
                INSERT INTO TravelCompanions (
                    ProcedureID, HN, first_name, last_name, middle_name
                ) VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (ProcedureID) DO UPDATE
                SET first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    middle_name = EXCLUDED.middle_name;
            `;
            const companionValues = [
                procedureId, HN, companion_first_name || null, companion_last_name || null, companion_middle_name || null
            ];
            await pool.query(companionQuery, companionValues);
        }

        // Insert or update taxi booking if taxi data is provided
        if (taxiData) {
            const newTaxiId = await generateNewId('TaxiBookings', 'TaxiBookingsID');
            const taxiQuery = `
                INSERT INTO TaxiBookings (
                    TaxiBookingsID, HN, ProcedureID, vehicle_type, num_passengers, taxi_status
                ) VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (TaxiBookingsID) DO UPDATE
                SET vehicle_type = EXCLUDED.vehicle_type,
                    num_passengers = EXCLUDED.num_passengers,
                    taxi_status = EXCLUDED.taxi_status;
            `;
            const taxiValues = [
                newTaxiId, HN, procedureId,
                taxiData?.vehicle_type || null,
                taxiData?.num_passengers || null,
                'Waiting for confirmed'
            ];
            await pool.query(taxiQuery, taxiValues);
        } else {
            console.log('No taxi data provided.');
        }
        
        
        // Insert or update hotel booking if hotel data is provided
        if (hotelData) {
            const newHotelId = await generateNewId('HotelBookings', 'HotelBookingsID');
            const hotelQuery = `
                INSERT INTO HotelBookings (
                    HotelBookingsID, HN, ProcedureID, num_of_rooms, number_of_guest, room_type, nights_stayed,
                    check_in_date, check_in_time, check_out_date, check_out_time, hotel_status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (HotelBookingsID) DO UPDATE
                SET num_of_rooms = EXCLUDED.num_of_rooms,
                    number_of_guest = EXCLUDED.number_of_guest,
                    room_type = EXCLUDED.room_type,
                    nights_stayed = EXCLUDED.nights_stayed,
                    check_in_date = EXCLUDED.check_in_date,
                    check_in_time = EXCLUDED.check_in_time,
                    check_out_date = EXCLUDED.check_out_date,
                    check_out_time = EXCLUDED.check_out_time,
                    hotel_status = EXCLUDED.hotel_status;
            `;
            const hotelValues = [
                newHotelId, HN, procedureId,
                hotelData?.num_of_rooms || null,
                hotelData?.number_of_guest || null,
                hotelData?.room_type || null,
                hotelData?.nights_stayed || null,
                hotelData?.check_in_date || null,
                hotelData?.check_in_time || null,
                hotelData?.check_out_date || null,
                hotelData?.check_out_time || null,
                'Waiting for confirmed'
            ];
            await pool.query(hotelQuery, hotelValues);
        } else {
            console.log('No hotel data provided.');
        }

        // Successfully saved all details
        res.status(200).json({ procedureId });
    } catch (error) {
        console.error('Error saving travel details, taxi, and hotel bookings:', error);
        res.status(500).json({ error: 'Server error while saving travel details.' });
    }
};


const getProcessTravelStatus = async (req, res) => {
    const { procedureId, HN } = req.params;

    try {
        // Fetch the latest taxi booking for the procedure
        const taxiQuery = `
            SELECT taxi_status, taxi_driver, vehicle_type, license_plate
            FROM TaxiBookings
            WHERE ProcedureID = $1 AND HN = $2
            ORDER BY requestedDate DESC
            LIMIT 1;
        `;
        const taxiResult = await pool.query(taxiQuery, [procedureId, HN]);
        let taxiStatus = '-';
        let taxiDetails = {};
        
        if (taxiResult.rows.length > 0) {
            taxiStatus = taxiResult.rows[0].taxi_status;
            if (taxiStatus === 'Confirmed') {
                taxiDetails = {
                    taxi_driver: taxiResult.rows[0].taxi_driver,
                    vehicle_type: taxiResult.rows[0].vehicle_type,
                    license_plate: taxiResult.rows[0].license_plate,
                };
            }
        }

        // Fetch the latest hotel booking for the procedure
        const hotelQuery = `
            SELECT hotel_status, hotel_name, hotel_location
            FROM HotelBookings
            WHERE ProcedureID = $1 AND HN = $2
            ORDER BY requestedDate DESC
            LIMIT 1;
        `;
        const hotelResult = await pool.query(hotelQuery, [procedureId, HN]);
        let hotelStatus = '-';
        let hotelDetails = {};

        if (hotelResult.rows.length > 0) {
            hotelStatus = hotelResult.rows[0].hotel_status;
            if (hotelStatus === 'Confirmed') {
                hotelDetails = {
                    hotel_name: hotelResult.rows[0].hotel_name,
                    hotel_location: hotelResult.rows[0].hotel_location,
                };
            }
        }

        // Send response with the status and details
        res.status(200).json({
            taxi_status: taxiStatus,
            ...taxiDetails, // Spread the taxi details if confirmed
            hotel_status: hotelStatus,
            ...hotelDetails, // Spread the hotel details if confirmed
        });
    } catch (error) {
        console.error('Error fetching process travel status:', error);
        res.status(500).json({ error: 'Error fetching process travel status' });
    }
};





module.exports = {
    saveTravelDetails,
    getProcessTravelStatus
};
