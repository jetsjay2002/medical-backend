const pool = require('../config/db');
const path = require('path');

// Function to generate a unique ReplyID
const generateReplyID = async () => {
    try {
        // Query to get the last ReplyID
        const result = await pool.query(`
            SELECT ReplyID FROM ReplyMessage 
            ORDER BY ReplyID DESC 
            LIMIT 1
        `);

        if (result.rows.length === 0) {
            // If no ReplyID exists, start from '0000001'
            return '0000001';
        } else {
            // If a ReplyID exists, increment it
            const lastReplyID = result.rows[0].replyid;
            const newReplyID = (parseInt(lastReplyID, 10) + 1).toString().padStart(7, '0');
            return newReplyID;
        }
    } catch (error) {
        console.error('Error generating ReplyID:', error);
        throw error;
    }
};

// Controller for sending reply message
const sendReplyMessage = async (req, res) => {
    const { chatID, hn, procedureID, reply_message } = req.body;
    let imagePath = null;

    // Check if image is uploaded and store the path
    if (req.file) {
        imagePath = req.file.filename;  // Only store the filename, not full path
    }

    try {
        console.log('HN:', hn);
        console.log('ProcedureID:', procedureID);
        console.log('replyID length:', (await generateReplyID()).length);
        const replyID = await generateReplyID();  // Generate new ReplyID

        const query = `
            INSERT INTO ReplyMessage (ReplyID, ChatID, HN, ProcedureID, reply_message, image_path, DateReply)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        `;
        const values = [replyID, chatID, hn, procedureID, reply_message, imagePath];

        await pool.query(query, values);

        res.status(201).json({ message: 'Reply sent successfully!' });
    } catch (error) {
        console.error('Error sending reply message:', error);
        res.status(500).json({ error: 'Failed to send reply message' });
    }
};

// Controller for fetching all replies for a specific chat message
const getRepliesForChat = async (req, res) => {
    const { chatID } = req.params;

    try {
        const query = `
            SELECT rm.ReplyID, rm.reply_message, rm.image_path, rm.DateReply
            FROM ReplyMessage rm
            WHERE rm.ChatID = $1
            ORDER BY rm.DateReply ASC
        `;
        const values = [chatID];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No replies found for this chat message.' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching replies:', error);
        res.status(500).json({ error: 'Failed to fetch replies.' });
    }
};


const getAllChatMessagesByPatient = async (req, res) => {
    const { hn } = req.params;  // Fetch based on the patient's HN

    try {
        const query = `
            SELECT cm.ChatID, cm.title, cm.message, cm.image_path, pr.procedure AS procedure_name, 
                   p.first_name AS patient_first_name, p.last_name AS patient_last_name,
                   d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, 
                   pk.packageName AS package_name, cm.ProcedureID  -- Ensure ChatID and ProcedureID are selected
            FROM ChatMessage cm
            JOIN ProcedureRequests pr ON cm.ProcedureID = pr.ProcedureID
            JOIN PatientDetails p ON cm.HN = p.HN
            JOIN Doctors d ON pr.DoctorsID = d.DoctorsID
            JOIN Packages pk ON pr.PackagesID = pk.PackagesID
            WHERE cm.HN = $1
            ORDER BY cm.ProcedureID ASC, cm.DateMessage ASC;
        `;

        const values = [hn];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No chat messages found for this patient.' });
        }

        res.status(200).json(result.rows);  // Return the result with ChatID and ProcedureID
    } catch (error) {
        console.error('Error retrieving chat messages:', error);
        res.status(500).json({ error: 'Failed to retrieve chat messages.' });
    }
};

// Controller to fetch all reply messages by ChatID
// const getReplyMessagesByChatID = async (req, res) => {
//     const { chatID } = req.params;

//     try {
//         const query = `
//             SELECT ReplyID, reply_message, image_path, DateReply
//             FROM ReplyMessage
//             WHERE ChatID = $1
//             ORDER BY DateReply ASC;
//         `;
//         const result = await pool.query(query, [chatID]);

//         if (result.rows.length === 0) {
//             return res.status(404).json({ message: 'No replies found for this ChatID.' });
//         }

//         res.json(result.rows);
//     } catch (err) {
//         console.error('Error fetching replies:', err);
//         res.status(500).json({ message: 'Error fetching replies.' });
//     }
// };




module.exports = {
    sendReplyMessage,
    getRepliesForChat,
    getAllChatMessagesByPatient,
    // getReplyMessagesByChatID
};
