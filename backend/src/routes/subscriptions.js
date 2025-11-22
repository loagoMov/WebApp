const express = require('express');
const router = express.Router();
const { createToken, verifyToken } = require('../services/dpoService');
const { updateUserSubscription, updateVendorSubscription, getSubscriptionStatus, logPayment } = require('../services/subscriptionService');

// ... (TIER_MAP remains same)

// ... (initiate-payment remains same)

// Verify Payment (Called by frontend after redirect or via webhook if DPO supports it)
router.post('/verify-payment', async (req, res) => {
    const { transToken, userId, userType, tier } = req.body;

    try {
        const verification = await verifyToken(transToken);

        if (verification.status === 'paid') {
            const subscriptionData = {
                dpoTransactionToken: transToken,
                tier: tier,
                status: 'active',
                updatedAt: new Date().toISOString()
            };

            if (userType === 'vendor') {
                await updateVendorSubscription(userId, subscriptionData);
            } else {
                await updateUserSubscription(userId, subscriptionData);
            }

            // Log Payment
            await logPayment({
                transactionToken: transToken,
                userId: userId,
                userType: userType,
                amount: verification.transactionAmount,
                currency: verification.transactionCurrency,
                status: 'paid',
                tier: tier
            });

            res.json({ status: 'success', message: 'Subscription activated' });
        } else {
            res.json({ status: verification.status, message: verification.explanation || 'Payment not completed' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Subscription Status
router.get('/status/:userId', async (req, res) => {
    const { userId } = req.params;
    const { type } = req.query; // 'user' or 'vendor'

    try {
        const status = await getSubscriptionStatus(userId, type);
        res.json(status || { tier: 'free', status: 'inactive' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
