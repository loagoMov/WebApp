const express = require('express');
const router = express.Router({ mergeParams: true });
const { createLead, getVendorLeads } = require('../controllers/leadsController');

router.post('/', createLead);
router.get('/', getVendorLeads);

module.exports = router;
