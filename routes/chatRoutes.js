const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { sendChatMessage, getAllChatMessagesByPatient  } = require('../controllers/chatController');

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

// Route to send chat message with optional image upload
router.post('/send-chat-message', upload.single('image'), sendChatMessage);
router.get('/chat-messages/:hn', getAllChatMessagesByPatient);

module.exports = router;
