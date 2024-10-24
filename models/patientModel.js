const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
// Helper function to generate a new HN
const generateHN = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT HN FROM PatientDetails ORDER BY HN DESC LIMIT 1');

        let newHN = '0000000000001'; // Default HN if no record exists (13 digits)
        if (result.rows.length > 0) {
            const lastHN = result.rows[0].hn;
            newHN = (parseInt(lastHN, 10) + 1).toString().padStart(13, '0'); // Increment and pad with 13 zeros
        }

        client.release();
        return newHN;
    } catch (err) {
        throw new Error('Error generating HN: ' + err.message);
    }
};

const accessTokenSecret = 'c7d597311b240249db349e9d2e5c563912bc0af30de2f9c1b4b176391e421ae7';  // Use a secure secret in production

// Add a new patient with generated HN and return a JWT token
const addPatientDetails = async (req, res) => {
    const { first_name, last_name, middle_name, gender, age, date_of_birth, height, weight, nationality, passport_no } = req.body;

    try {
        const client = await pool.connect();
        const HN = await generateHN(); // Generate a new HN

        // Insert patient details into the database
        await client.query(
            `INSERT INTO PatientDetails (HN, first_name, last_name, middle_name, gender, age, date_of_birth, height, weight, nationality, passport_no)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [HN, first_name, last_name, middle_name, gender, age, date_of_birth, height, weight, nationality, passport_no]
        );

        // Create a JWT token with the hnNumber
        // const token = jwt.sign({ HN, usertypeid: 'T02' }, process.env.JWT_SECRET, { expiresIn: '24h' });
        const token = jwt.sign({ HN, usertypeid: 'T02' }, accessTokenSecret, { expiresIn: '24h' });

        res.status(201).json({ message: 'Patient details added successfully', HN, token });
        client.release();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Add patient contact
const addPatientContact = async (req, res) => {
    const { HN, address1, address2, address3, city, country, postal_code, email, tel_home, tel_mobile } = req.body;

    try {
        const client = await pool.connect();
        await client.query(
            `INSERT INTO PatientContact (HN, address1, address2, address3, city, country, postal_code, email, tel_home, tel_mobile)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,  // Ensure you have 10 placeholders for the 10 columns
            [HN, address1, address2, address3, city, country, postal_code, email, tel_home, tel_mobile]
        );
        res.status(201).json({ message: 'Patient contact added successfully' });
        client.release();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Add emergency contact
const addPatientEmergencyContact = async (req, res) => {
    const { HN, first_name, last_name, tel_home, tel_mobile } = req.body;

    try {
        const client = await pool.connect();
        await client.query(
            `INSERT INTO PatientEmergencyContact (HN, first_name, last_name, tel_home, tel_mobile)
            VALUES ($1, $2, $3, $4, $5)`,
            [HN, first_name, last_name, tel_home, tel_mobile]
        );
        res.status(201).json({ message: 'Emergency contact added successfully' });
        client.release();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addPatientMedicalConditions = async (req, res) => {
    const {
        HN, heart_disease, diabetes, hypertension, deep_vein_thrombosis,
        cardiovascular_accidents, asthma, bleeding_tendency, hyperthyroidism,
        adrenal_insufficiency, hepatitis, hiv, keloid_scarring, cancer,
        history_of_surgery, other_conditions, drug_allergies, underlying_disease, 
        food_allergies, current_medications, current_vitamins, current_blood_pressure,
        history_for_depression
    } = req.body;

    // Log the received values for debugging
    console.log('Values being inserted:', req.body);

    try {
        const client = await pool.connect();
        
        // Insert data with 23 columns
        await client.query(
            `INSERT INTO PatientMedicalConditions (
                HN, heart_disease, diabetes, hypertension, deep_vein_thrombosis, 
                cardiovascular_accidents, asthma, bleeding_tendency, hyperthyroidism, 
                adrenal_insufficiency, hepatitis, hiv, keloid_scarring, cancer, 
                history_of_surgery, other_conditions, drug_allergies, underlying_disease, 
                food_allergies, current_medications, current_vitamins, current_blood_pressure,
                history_for_depression)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
            [HN, heart_disease, diabetes, hypertension, deep_vein_thrombosis, cardiovascular_accidents,
             asthma, bleeding_tendency, hyperthyroidism, adrenal_insufficiency, hepatitis, hiv, 
             keloid_scarring, cancer, history_of_surgery, other_conditions, drug_allergies, underlying_disease, 
             food_allergies, current_medications, current_vitamins, current_blood_pressure, history_for_depression]
        );

        res.status(201).json({ message: 'Medical conditions added successfully' });
        client.release();
    } catch (err) {
        console.error('Error executing query:', err.message);  // Log the exact error message for debugging
        res.status(500).json({ error: err.message });
    }
};


// Create user account
const createAccountPatient = async (req, res) => {
    const { HN, username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO UserAccount (HN, UserTypesID, username, password) VALUES ($1, 'T02', $2, $3) RETURNING *`,
            [HN, username, hashedPassword]
        );
        res.status(201).json(result.rows[0]);  // Return the created user account
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

// Step 2: Create patient user account
const createAccountPatientByAgent = async (req, res) => {
    const { HN, username, password, AgentID } = req.body;

    try {
        const client = await pool.connect();

        // Check if the username already exists
        const usernameCheck = await client.query('SELECT username FROM UserAccount WHERE username = $1', [username]);

        if (usernameCheck.rows.length > 0) {
            client.release();
            return res.status(400).json({ error: 'Username already exists. Please choose a different username.' });
        }

        // Proceed to insert the user account
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await client.query(
            `INSERT INTO UserAccount (HN, UserTypesID, username, password, AgentID) 
             VALUES ($1, 'T02', $2, $3, $4) RETURNING *`,
            [HN, username, hashedPassword, AgentID]
        );

        client.release();
        res.status(201).json({ message: 'User account created successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Error creating user account:', error.message);
        res.status(500).json({ error: 'Error creating user account: ' + error.message });
    }
};




module.exports = {
    addPatientDetails,
    addPatientContact,
    addPatientEmergencyContact,
    addPatientMedicalConditions,
    createAccountPatient,
    createAccountPatientByAgent
};


