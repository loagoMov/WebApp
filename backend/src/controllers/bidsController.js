const { db } = require('../config/firebase');

const createBid = async (req, res) => {
    try {
        const { vendorId, categoryTarget, bidAmount, prioritySlot, maxSpend } = req.body;

        // TODO: Verify ownership and payment method

        const bidData = {
            vendorId,
            categoryTarget,
            bidAmount,
            prioritySlot,
            maxSpend,
            status: 'active',
            startAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        };

        const docRef = await db.collection('recommendation_bids').add(bidData);
        res.status(201).json({ id: docRef.id, ...bidData });
    } catch (error) {
        console.error('Error creating bid:', error);
        res.status(500).json({ error: 'Failed to create bid' });
    }
};

const getVendorBids = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const snapshot = await db.collection('recommendation_bids').where('vendorId', '==', vendorId).get();

        const bids = [];
        snapshot.forEach(doc => {
            bids.push({ id: doc.id, ...doc.data() });
        });

        res.json(bids);
    } catch (error) {
        console.error('Error fetching bids:', error);
        res.status(500).json({ error: 'Failed to fetch bids' });
    }
};

module.exports = { createBid, getVendorBids };
