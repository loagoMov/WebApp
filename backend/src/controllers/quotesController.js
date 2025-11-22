const { db } = require('../config/firebase');
const admin = require('firebase-admin');

const saveQuote = async (req, res) => {
    try {
        const { userId } = req.params;
        const quoteData = req.body;

        // 1. Fetch User Subscription & Limits
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userData = userDoc.data();
        // Default to 5 saved quotes for Free tier if not set
        const saveLimit = userData.quotaLimit || 5;

        // 2. Count Existing Saved Quotes
        const quotesSnapshot = await db.collection('saved_quotes').where('userId', '==', userId).get();
        const currentCount = quotesSnapshot.size;

        if (currentCount >= saveLimit) {
            return res.status(403).json({
                error: 'Saved quote limit reached',
                limit: saveLimit,
                current: currentCount,
                upgradeRequired: true
            });
        }

        // 3. Save Quote
        const newQuote = {
            userId,
            ...quoteData,
            savedAt: new Date().toISOString()
        };

        const docRef = await db.collection('saved_quotes').add(newQuote);
        res.status(201).json({ id: docRef.id, ...newQuote });
    } catch (error) {
        console.error('Error saving quote:', error);
        res.status(500).json({ error: 'Failed to save quote' });
    }
};

const getSavedQuotes = async (req, res) => {
    try {
        const { userId } = req.params;
        const snapshot = await db.collection('saved_quotes').where('userId', '==', userId).orderBy('savedAt', 'desc').get();

        const quotes = [];
        snapshot.forEach(doc => {
            quotes.push({ id: doc.id, ...doc.data() });
        });

        res.json(quotes);
    } catch (error) {
        console.error('Error fetching saved quotes:', error);
        res.status(500).json({ error: 'Failed to fetch saved quotes' });
    }
};

module.exports = { saveQuote, getSavedQuotes };
