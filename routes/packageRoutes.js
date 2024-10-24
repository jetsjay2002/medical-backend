const express = require('express');
const router = express.Router();
const { getPackages, getPackageDetails, selectPackage } = require('../controllers/packageController');
const pool = require('../config/db');

// Route to get all packages
router.get('/packages', getPackages);
// Route to get package details by PackagesID
// Route to get package details by PackagesID
router.get('/packagedetails/:packageId', getPackageDetails);

// Route to select a package and insert into ProcedureRequests
router.post('/select-package', selectPackage);

module.exports = router;
