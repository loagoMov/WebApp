const express = require('express');
const router = express.Router();
const { createVendor, getVendorProfile } = require('../controllers/vendorsController');

router.post('/', createVendor);
router.get('/me', getVendorProfile);

module.exports = router;
