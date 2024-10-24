const pool = require('../db');

const createChatTables = async () => {
    const client = await pool.connect();
    try {
        const creatChatMessageTable = `
            CREATE TABLE IF NOT EXISTS ChatMessage (
                ChatID VARCHAR(7) PRIMARY KEY,
                HN VARCHAR(13) REFERENCES PatientDetails(HN),
                ProcedureID VARCHAR(7) REFERENCES ProcedureRequests(ProcedureID),
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                image_path TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                DateMessage TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(creatChatMessageTable);
        console.log('Chat Message table created successfully');


        const creatReplyMessageTable = `
            CREATE TABLE IF NOT EXISTS ReplyMessage (
                ReplyID VARCHAR(7) PRIMARY KEY,
                ChatID VARCHAR(7) REFERENCES ChatMessage(ChatID),
                HN VARCHAR(13) REFERENCES PatientDetails(HN),
                ProcedureID VARCHAR(7) REFERENCES ProcedureRequests(ProcedureID),
                reply_message TEXT NOT NULL,
                image_path TEXT,
                DateReply TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(creatReplyMessageTable);
        console.log('Reply Message table created successfully');


    } catch (err) {
        console.error('Error creating chat table:', err);
    } finally {
        client.release();
    }
};

module.exports = { createChatTables };
