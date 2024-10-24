const pool = require('../db');

const createTravelTables = async () => {
    const client = await pool.connect();
    try {
        const creatTravelDetailsTable = `
            CREATE TABLE IF NOT EXISTS TravelDetails (
                ProcedureID VARCHAR(7) PRIMARY KEY REFERENCES ProcedureRequests(ProcedureID) ON DELETE CASCADE,
                HN VARCHAR(13) REFERENCES PatientDetails(HN) ON DELETE CASCADE,
                departure_location VARCHAR(255),
                arrival_location VARCHAR(255),
                departure_date DATE,
                departure_time TIME,
                arrival_date DATE,
                arrival_time TIME,
                flight_number VARCHAR(50),
                cancel_status VARCHAR(50),
                delay_status VARCHAR(50)
            );
        `;
        await client.query(creatTravelDetailsTable);
        console.log('Travel Details table created successfully');


        const creatTravelCompanionTable = `
            CREATE TABLE IF NOT EXISTS TravelCompanions (
                ProcedureID VARCHAR(7) PRIMARY KEY REFERENCES ProcedureRequests(ProcedureID) ON DELETE CASCADE,
                HN VARCHAR(13) REFERENCES PatientDetails(HN) ON DELETE CASCADE,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                middle_name VARCHAR(255)
            );
        `;
        await client.query(creatTravelCompanionTable);
        console.log('Travel Companions table created successfully');


        const createTaxiBookingTable = `
            CREATE TABLE IF NOT EXISTS TaxiBookings (
                TaxiBookingsID VARCHAR(7) PRIMARY KEY,
                HN VARCHAR(13) REFERENCES PatientDetails(HN),
                ProcedureID VARCHAR(7) REFERENCES ProcedureRequests(ProcedureID),
                taxi_driver VARCHAR(255),
                vehicle_type VARCHAR(50),
                license_plate VARCHAR(50),
                num_passengers INT,
                taxi_status VARCHAR(50),
                requestedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(createTaxiBookingTable);
        console.log('Taxi Bookings table created successfully');


        const createHotelBookingTable = `
            CREATE TABLE IF NOT EXISTS HotelBookings (
                HotelBookingsID VARCHAR(7) PRIMARY KEY,
                HN VARCHAR(13) REFERENCES PatientDetails(HN),
                ProcedureID VARCHAR(7) REFERENCES ProcedureRequests(ProcedureID),
                hotel_name VARCHAR(255),
                hotel_location VARCHAR(255),
                num_of_rooms INT,
                number_of_guest INT,
                room_type VARCHAR(255),
                nights_stayed INT,
                check_in_date DATE,
                check_in_time TIME,
                check_out_date DATE,
                check_out_time TIME,
                hotel_status VARCHAR(50),
                requestedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(createHotelBookingTable);
        console.log('Hotel Bookings table created successfully');

    } catch (err) {
        console.error('Error creating agents table:', err);
    } finally {
        client.release();
    }
};

module.exports = { createTravelTables };
