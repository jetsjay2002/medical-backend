require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const multer = require('multer');
const path = require('path');


const { createAgentTables } = require('./config/createTables/createAgentTables');
const { createPatientTables } = require('./config/createTables/createPatientTables');
const { createChatTables } = require('./config/createTables/createChatTables');
const { createRatings } = require('./config/createTables/createRatings');
const { createDataTables } = require('./config/createTables/createDataTables');
const { createTravelTables } = require('./config/createTables/createTravelTables');
const { createUserTables } = require('./config/createTables/createUserTables');
const { createStaffTables } = require('./config/createTables/createStaffTables');

// const registerRoutes = require('./routes/registerRoutes');
// const loginRoutes = require('./routes/loginRoutes');
require('dotenv').config();  // Load environment variables
const patientRoutes = require('./routes/patientRoutes');
const agentRoutes = require('./routes/agentRoutes');
const authRoutes = require('./routes/authRoutes');
const packageRoutes = require('./routes/packageRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const procedureRoutes = require('./routes/procedureRoutes');
const travelRoutes = require('./routes/travelRoutes'); // Import the travel details routes
const BookingsRoutes = require('./routes/BookingsRoutes');
const onboardRoutes = require('./routes/onboardRoutes');
const rescheduleRoutes = require('./routes/rescheduleRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Import the admin routes
const chatRoutes = require('./routes/chatRoutes');  // Import chat routes
const trackProcedureRoutes = require('./routes/trackProcedureRoutes');  // Import chat routes
const replyChatRoutes = require('./routes/replyChatRoutes');  // Import chat routes
const agentPageRoutes = require('./routes/Agent/agentPageRoutes');  // Import chat routes
const historyChatReplyRoutes = require('./routes/historyChatReplyRoutes');  // Import chat routes
const staffRoutes = require('./routes/Co-ordinator/staffRoutes');  // Import chat routes

const app = express();

app.use(cors({
    origin: '*', // Allow all origins for testing
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const createAllTables = async () => {
    try {
        await createRatings();
        await createAgentTables();
        await createPatientTables();
        await createChatTables();
        await createDataTables();
        await createTravelTables();
        await createUserTables();
        await createStaffTables();
        console.log('All tables created successfully');
    } catch (err) {
        console.error('Error creating tables:', err);
    }
};

createAllTables();

// Use the registration routes
// app.use('/api/signup', registerRoutes);
// app.use('/api', loginRoutes);
app.use('/api/signup', patientRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', packageRoutes);
app.use('/api', doctorRoutes);
app.use('/api', clinicRoutes);
app.use('/api', procedureRoutes);
app.use('/api', travelRoutes);
app.use('/api', BookingsRoutes);
app.use('/api', onboardRoutes);
app.use('/api', rescheduleRoutes);
app.use('/api', ratingRoutes);
app.use('/api', adminRoutes);
app.use('/api', trackProcedureRoutes);
app.use('/api', historyChatReplyRoutes);
app.use('/api', staffRoutes);


app.use('/api', agentPageRoutes);

//chat message

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', chatRoutes);
app.use('/api', replyChatRoutes);


// Error handling middleware (optional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
