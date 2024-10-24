const pool = require('../db');

const createRatings = async () => {
    const client = await pool.connect();
    try {

        const createClinicTable = `
            CREATE TABLE IF NOT EXISTS Clinic (
                ClinicID VARCHAR(3) PRIMARY KEY,
                HN VARCHAR(13) REFERENCES PatientDetails(HN),
                MedicalProblem VARCHAR(255),
                Hospital VARCHAR(255)
            );
        `;
        await client.query(createClinicTable);
        console.log('Clinic table created successfully');

        const createServiceRatingsTable = `
            CREATE TABLE IF NOT EXISTS ServiceRatings (
                ServiceRatingsID VARCHAR(7) PRIMARY KEY,
                HN VARCHAR(13) REFERENCES PatientDetails(HN),
                ProcedureID VARCHAR(7) REFERENCES ProcedureRequests(ProcedureID),
                service_ratings INT CHECK (service_ratings BETWEEN 1 AND 5),
                service_comment VARCHAR(255),
                ratingDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(createServiceRatingsTable);
        console.log('Service Ratings table created successfully');


        const createClinicRatingsTable = `
            CREATE TABLE IF NOT EXISTS ClinicRatings (
                ClinicRatingsID VARCHAR(7) PRIMARY KEY,
                HN VARCHAR(13) REFERENCES PatientDetails(HN),
                ProcedureID VARCHAR(7) REFERENCES ProcedureRequests(ProcedureID),
                ClinicID VARCHAR(3) REFERENCES Clinic(ClinicID),
                clinic_ratings INT CHECK (clinic_ratings BETWEEN 1 AND 5),
                clinic_comment VARCHAR(255),
                ratingDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(createClinicRatingsTable);
        console.log('Clinic Ratings table created successfully');


    } catch (err) {
        console.error('Error creating rating table:', err);
    } finally {
        client.release();
    }
};

module.exports = { createRatings };
