const express = require('express');
const router = express.Router();
const { getChatMessagesByProcedureID, getReplyMessagesByChatID } = require('../controllers/historyChatReply');

// Route to fetch all chat messages by procedureID
router.get('/chat-history/:procedureID', getChatMessagesByProcedureID);

// Route to fetch all reply messages by chatID
router.get('/reply-history/:chatID', getReplyMessagesByChatID);

module.exports = router;
