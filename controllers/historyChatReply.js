const pool = require('../config/db');

// Fetch all chat messages for a given procedureID
const getChatMessagesByProcedureID = async (req, res) => {
    const { procedureID } = req.params;

    try {
        const query = `
            SELECT * FROM ChatMessage
            WHERE ProcedureID = $1
            ORDER BY DateMessage ASC;
        `;
        const result = await pool.query(query, [procedureID]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No chat messages found for this procedure.' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({ message: 'Error fetching chat messages.' });
    }
};

// Fetch all reply messages for a given chatID
const getReplyMessagesByChatID = async (req, res) => {
    const { chatID } = req.params;

    try {
        const query = `
            SELECT * FROM ReplyMessage
            WHERE ChatID = $1
            ORDER BY DateReply ASC;
        `;
        const result = await pool.query(query, [chatID]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No reply messages found for this chat.' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching reply messages:', error);
        res.status(500).json({ message: 'Error fetching reply messages.' });
    }
};

module.exports = {
    getChatMessagesByProcedureID,
    getReplyMessagesByChatID
};
