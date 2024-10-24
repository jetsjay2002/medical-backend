const pool = require('../db');

const createPatientTables = async () => {
    const client = await pool.connect();
    try {

        const createPatientDetailsTable = `
            CREATE TABLE IF NOT EXISTS PatientDetails (
                HN VARCHAR(13) PRIMARY KEY,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                middle_name VARCHAR(255),
                gender VARCHAR(10),
                age INT,
                date_of_birth DATE,
                height INT,
                weight INT,
                nationality VARCHAR(255),
                passport_no VARCHAR(255)
            );

        `;
        await client.query(createPatientDetailsTable);
        console.log('Patient Details table created successfully');


        // Table for Contact Information
        const createPatientContactTable = `
            CREATE TABLE IF NOT EXISTS PatientContact (
                HN VARCHAR(13) PRIMARY KEY REFERENCES PatientDetails(HN) ON DELETE CASCADE,
                address1 VARCHAR(255),
                address2 VARCHAR(255),
                address3 VARCHAR(255),
                city VARCHAR(255),
                country VARCHAR(255),
                postal_code VARCHAR(20),
                email VARCHAR(255),
                tel_home VARCHAR(20),
                tel_mobile VARCHAR(20)
            );
        `;
        await client.query(createPatientContactTable);
        console.log('PatientContact table created successfully');


        // Table for Emergency Contact
        const createPatientEmergencyContactTable = `
            CREATE TABLE IF NOT EXISTS PatientEmergencyContact (
                HN VARCHAR(13) PRIMARY KEY REFERENCES PatientDetails(HN) ON DELETE CASCADE,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                tel_home VARCHAR(20),
                tel_mobile VARCHAR(20)
            );
        `;
        await client.query(createPatientEmergencyContactTable);
        console.log('PatientEmergencyContact table created successfully');


        // Table for Medical Conditions
        const createPatientMedicalConditionsTable = `
            CREATE TABLE IF NOT EXISTS PatientMedicalConditions (
                HN VARCHAR(13) PRIMARY KEY REFERENCES PatientDetails(HN) ON DELETE CASCADE,
                heart_disease TEXT DEFAULT 'No',
                diabetes TEXT DEFAULT 'No',
                hypertension TEXT DEFAULT 'No',
                deep_vein_thrombosis TEXT DEFAULT 'No',
                cardiovascular_accidents TEXT DEFAULT 'No',
                asthma TEXT DEFAULT 'No',
                bleeding_tendency TEXT DEFAULT 'No',
                hyperthyroidism TEXT DEFAULT 'No',
                adrenal_insufficiency TEXT DEFAULT 'No',
                hepatitis TEXT DEFAULT 'No',
                hiv TEXT DEFAULT 'No',
                keloid_scarring TEXT DEFAULT 'No',
                cancer TEXT DEFAULT 'No',
                history_of_surgery TEXT DEFAULT 'No',
                other_conditions TEXT DEFAULT 'No',
                drug_allergies TEXT DEFAULT 'No',
                underlying_disease TEXT DEFAULT 'No',
                food_allergies TEXT DEFAULT 'No',
                current_medications TEXT DEFAULT 'No',
                current_vitamins TEXT DEFAULT 'No',
                current_blood_pressure TEXT DEFAULT 'No',
                history_for_depression TEXT DEFAULT 'No'
            );
        `;
        await client.query(createPatientMedicalConditionsTable);
        console.log('PatientMedicalConditions table created successfully');


    } catch (err) {
        console.error('Error creating agents table:', err);
    } finally {
        client.release();
    }
};

module.exports = { createPatientTables };
