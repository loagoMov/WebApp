const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const auth = require('../middleware/auth');

// Unified search endpoint (works with or without auth)
router.post('/', auth.optionalAuth, searchController.unifiedSearch);

module.exports = router;
