const express = require('express');
const router = express.Router({ mergeParams: true });
const { createBid, getVendorBids } = require('../controllers/bidsController');

router.post('/', createBid);
router.get('/', getVendorBids);

module.exports = router;
