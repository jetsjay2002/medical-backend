const pool = require('../config/db'); // Import the correct pool connection

const getLastTaxiBooking = async (req, res) => {
    try {
        const query = `
            SELECT 
                tb.TaxiBookingsID,
                tb.procedureId,
                tb.taxi_driver,
                tb.vehicle_type,
                tb.license_plate,
                tb.num_passengers,
                tb.taxi_status,
                td.arrival_date,
                td.arrival_time,
                td.flight_number,
                td.arrival_location,
                pd.first_name AS patient_first_name,
                pd.last_name AS patient_last_name
            FROM 
                TaxiBookings tb
            LEFT JOIN 
                TravelDetails td ON tb.procedureId = td.procedureId
            LEFT JOIN 
                PatientDetails pd ON tb.HN = pd.HN
            WHERE 
                tb.TaxiBookingsID IN (
                    SELECT MAX(TaxiBookingsID) 
                    FROM TaxiBookings 
                    GROUP BY procedureId
                )
            ORDER BY 
                tb.TaxiBookingsID DESC;
        `;

        const result = await pool.query(query);
        
        if (result.rows.length > 0) {
            res.json(result.rows);  // Return all rows with patient name
        } else {
            res.status(404).json({ error: 'No taxi bookings found.' });
        }
    } catch (error) {
        console.error('Error fetching taxi bookings:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


// Add a New Taxi Booking and Automatically Confirm
const addTaxiBooking = async (req, res) => {
    const { taxibookingsid, taxi_driver, vehicle_type, license_plate } = req.body;

    try {
        // Check if the taxi booking exists
        const checkQuery = 'SELECT * FROM TaxiBookings WHERE TaxiBookingsID = $1';
        const checkResult = await pool.query(checkQuery, [taxibookingsid]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Taxi booking not found' });
        }

        // Update the taxi booking with the provided details
        const query = `
            UPDATE TaxiBookings 
            SET taxi_driver = $1, vehicle_type = $2, license_plate = $3, taxi_status = 'Confirmed'
            WHERE TaxiBookingsID = $4
            RETURNING *;
        `;
        const result = await pool.query(query, [taxi_driver, vehicle_type, license_plate, taxibookingsid]);

        res.json({ message: 'Taxi booking confirmed successfully', taxiBooking: result.rows[0] });
    } catch (error) {
        console.error('Error confirming taxi booking:', error);
        res.status(500).json({ error: 'Server error' });
    }
};



// Update Taxi Booking and Automatically Confirm
const updateTaxiBooking = async (req, res) => {
    const { TaxiBookingsID } = req.params;
    const { taxi_driver, vehicle_type, license_plate, num_passengers } = req.body;

    try {
        const query = `
            UPDATE TaxiBookings
            SET taxi_driver = $1, vehicle_type = $2, license_plate = $3, num_passengers = $4, taxi_status = 'Confirmed'  -- Set status to 'Confirmed'
            WHERE TaxiBookingsID = $5
            RETURNING *;
        `;
        const result = await pool.query(query, [taxi_driver, vehicle_type, license_plate, num_passengers, TaxiBookingsID]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Taxi booking not found' });
        }

        res.json({ message: 'Taxi booking updated and confirmed successfully', taxiBooking: result.rows[0] });
    } catch (error) {
        console.error('Error updating taxi booking:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


const getLastHotelBooking = async (req, res) => {
    try {
      const query = `
        SELECT 
          hb.HotelBookingsID,
          hb.procedureId,
          hb.hotel_name,
          hb.hotel_location,
          hb.num_of_rooms, 
          hb.number_of_guest,
          hb.room_type,
          hb.nights_stayed,
          hb.check_in_date,
          hb.check_in_time,
          hb.check_out_date,
          hb.check_out_time,
          hb.hotel_status,
          pd.first_name AS patient_first_name,
          pd.last_name AS patient_last_name
        FROM HotelBookings hb
        LEFT JOIN TravelDetails td ON hb.procedureId = td.procedureId
        LEFT JOIN PatientDetails pd ON hb.HN = pd.HN
        WHERE hb.HotelBookingsID IN (
          SELECT MAX(HotelBookingsID) 
          FROM HotelBookings 
          GROUP BY procedureId
        )
        ORDER BY hb.HotelBookingsID DESC;
      `;
  
      const result = await pool.query(query);
      
      if (result.rows.length > 0) {
        res.json(result.rows);  // Return all rows with the latest hotel bookings
      } else {
        res.status(404).json({ error: 'No hotel bookings found.' });
      }
    } catch (error) {
      console.error('Error fetching hotel bookings:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  // Add a new hotel booking
  const addHotelBooking = async (req, res) => {
    const { hotelbookingsid, hotel_name, hotel_location } = req.body;

    try {
        // Check if the hotel booking exists
        const checkQuery = 'SELECT * FROM HotelBookings WHERE HotelBookingsID = $1';
        const checkResult = await pool.query(checkQuery, [hotelbookingsid]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Hotel booking not found' });
        }

        // Update the hotel booking with the provided details and set status to 'Confirmed'
        const updateQuery = `
            UPDATE HotelBookings 
            SET hotel_name = $1, hotel_location = $2, hotel_status = 'Confirmed'
            WHERE HotelBookingsID = $3
            RETURNING *;
        `;
        const result = await pool.query(updateQuery, [
            hotel_name,
            hotel_location,
            hotelbookingsid
        ]);

        // Send the response with the updated hotel booking details
        res.json({ message: 'Hotel booking confirmed successfully', hotelBooking: result.rows[0] });
    } catch (error) {
        console.error('Error confirming hotel booking:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


// Update a hotel booking by HotelBookingsID
const updateHotelBooking = async (req, res) => {
    const { HotelBookingsID } = req.params;
    const {
      hotel_name,
      hotel_location,
      num_of_rooms,
      room_type,
      nights_stayed,
      check_in_date,
      check_in_time,
      check_out_date,
      check_out_time,
    } = req.body;
  
    try {
      const query = `
        UPDATE HotelBookings
        SET
          hotel_name = $1,
          hotel_location = $2,
          num_of_rooms = $3,
          room_type = $4,
          nights_stayed = $5,
          check_in_date = $6,
          check_in_time = $7,
          check_out_date = $8,
          check_out_time = $9
        WHERE HotelBookingsID = $10
        RETURNING *;
      `;
      const result = await pool.query(query, [
        hotel_name,
        hotel_location,
        num_of_rooms,
        room_type,
        nights_stayed,
        check_in_date,
        check_in_time,
        check_out_date,
        check_out_time,
        HotelBookingsID,
      ]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Hotel booking not found' });
      }
  
      res.json({ message: 'Hotel booking updated successfully', hotelBooking: result.rows[0] });
    } catch (error) {
      console.error('Error updating hotel booking:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  


module.exports = {
    getLastTaxiBooking,
    addTaxiBooking,
    updateTaxiBooking,
    getLastHotelBooking,
    addHotelBooking,
    updateHotelBooking
};
