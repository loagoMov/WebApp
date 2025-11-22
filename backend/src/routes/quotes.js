const express = require('express');
const router = express.Router({ mergeParams: true });
const { saveQuote, getSavedQuotes } = require('../controllers/quotesController');

router.post('/:userId', saveQuote);
router.get('/:userId', getSavedQuotes);

module.exports = router;
