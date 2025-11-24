const express = require('express');
const router = express.Router({ mergeParams: true });
const quotesController = require('../controllers/quotesController');

// POST /api/quotes/:userId - Save a quote
router.post('/:userId', quotesController.saveQuote);

// GET /api/quotes/:userId - Get all saved quotes for a user
router.get('/:userId', quotesController.getSavedQuotes);

// DELETE /api/quotes/:quoteId - Delete a saved quote
router.delete('/:quoteId', quotesController.deleteQuote);

module.exports = router;
