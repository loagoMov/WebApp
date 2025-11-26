const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const checkJwt = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Log an event (Public or Protected? Let's make it public but optionally authenticated for userId tracking)
// We'll use checkJwt optionally in the controller, but for now let's allow public access for 'views' 
// and handle auth inside if needed. Actually, for simplicity, let's make it open but rate limited.
router.post('/events', analyticsController.logEvent);

// Get dashboard stats (Admin only)
router.get('/stats', checkJwt, authorize({ roles: ['admin'] }), analyticsController.getDashboardStats);

module.exports = router;
