const express = require('express');
const router = express.Router();
const {getLastTaxiBooking , addTaxiBooking , updateTaxiBooking, getLastHotelBooking, addHotelBooking, updateHotelBooking}  = require('../controllers/BookingsController'); // Import the controller

// POST route to save travel details
router.get('/last-taxi-bookings', getLastTaxiBooking);
router.post('/add-taxi-booking', addTaxiBooking);
router.put('/update-taxi-booking/:TaxiBookingsID', updateTaxiBooking);

// GET the last hotel booking for each procedure
router.get('/last-hotel-bookings', getLastHotelBooking);

// POST to add a new hotel booking
router.post('/add-hotel-booking', addHotelBooking);

// PUT to update a hotel booking by HotelBookingID
router.put('/update-hotel-booking/:HotelBookingsID', updateHotelBooking);


module.exports = router;
