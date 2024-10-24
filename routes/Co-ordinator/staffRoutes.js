const express = require('express');
const router = express.Router();
const staffController = require('../../controllers/Co-Ordinator/staffController');
// const {verifyToken, getStaffUser} = require('../../controllers/Co-Ordinator/staffController');

// Route to get status counts
router.get('/status-counts', staffController.getStatusCounts);
router.get('/patient-list', staffController.getAllProcedures);
router.get('/reply-counts', staffController.getReplyCounts)
router.get('/reply-counts-patient', staffController.getReplyCountsPatient)
router.get('/notifications', staffController.getNotifyStaff)
router.get('/staff-profile/:staffid', staffController.getUserByUsernamer)

module.exports = router;
