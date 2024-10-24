const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { sendReplyMessage, getRepliesForChat,getAllChatMessagesByPatient } = require('../controllers/replyChatController');

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Files will be stored in the 'uploads/' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Unique file name
    },
});

const upload = multer({ storage: storage });

// Route to send reply message with optional image upload
router.post('/send-reply-message', upload.single('image'), sendReplyMessage);

// Route to fetch all replies for a specific chat message
router.get('/chat/:chatID/replies', getRepliesForChat);
router.get('/reply-chat-messages/:hn', getAllChatMessagesByPatient);
// router.get('/reply-his/:chatID', getReplyMessagesByChatID);

module.exports = router;
