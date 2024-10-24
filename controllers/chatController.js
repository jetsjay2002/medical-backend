const pool = require('../config/db');
const path = require('path');

// Generate ChatID by checking the last ChatID in the database and incrementing it
const generateChatID = async () => {
    try {
        // Query to get the last ChatID
        const result = await pool.query(`
            SELECT ChatID FROM ChatMessage 
            ORDER BY ChatID DESC 
            LIMIT 1
        `);

        if (result.rows.length === 0) {
            // If no ChatID exists, start from '0000001'
            return '0000001';
        } else {
            // If a ChatID exists, increment it
            const lastChatID = result.rows[0].chatid;
            const newChatID = (parseInt(lastChatID, 10) + 1).toString().padStart(7, '0');
            return newChatID;
        }
    } catch (error) {
        console.error('Error generating ChatID:', error);
        throw error;
    }
};

// Handle sending chat message
const sendChatMessage = async (req, res) => {
    const { hn, procedureID, title, message } = req.body;
    let imagePath = null;

    // If an image is uploaded, save the file path
    if (req.file) {
        imagePath = req.file.filename;  // Only store the filename
    }
    try {
        console.log('HN:', hn);
        console.log('ProcedureID:', procedureID);
        console.log('ChatID length:', (await generateChatID()).length);

        const chatID = await generateChatID();  // Now this function fetches and increments the ChatID
        const query = `
            INSERT INTO ChatMessage (ChatID, HN, ProcedureID, title, message, image_path, is_read, DateMessage)
            VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        `;
        const values = [chatID, hn, procedureID, title, message, imagePath, false];

        await pool.query(query, values);

        res.status(201).json({ message: 'Chat message sent successfully!' });
    } catch (error) {
        console.error('Error sending chat message:', error);
        res.status(500).json({ error: 'Failed to send chat message' });
    }
};

// Fetch all chat messages by patient (HN), grouped by procedure
const getAllChatMessagesByPatient = async (req, res) => {
    const { hn } = req.params;  // Fetch only based on the patient's HN

    try {
        const query = `
            SELECT cm.title, cm.message, cm.image_path, pr.procedure AS procedure_name, 
                   p.first_name AS patient_first_name, p.last_name AS patient_last_name,
                   d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, 
                   pk.packageName AS package_name,  -- Correctly fetch packageName from the Packages table
                   cm.ProcedureID
            FROM ChatMessage cm
            JOIN ProcedureRequests pr ON cm.ProcedureID = pr.ProcedureID
            JOIN PatientDetails p ON cm.HN = p.HN
            JOIN Doctors d ON pr.DoctorsID = d.DoctorsID
            JOIN Packages pk ON pr.PackagesID = pk.PackagesID  -- Join the Packages table to get packageName
            WHERE cm.HN = $1
            ORDER BY cm.ProcedureID ASC, cm.DateMessage ASC
        `;

        const values = [hn];  // Patient HN as parameter
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No chat messages found for this patient.' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving chat messages:', error);
        res.status(500).json({ error: 'Failed to retrieve chat messages.' });
    }
};





module.exports = {
    sendChatMessage,
    getAllChatMessagesByPatient 
};
