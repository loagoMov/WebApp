const express = require('express');
const router = express.Router();
const { createToken, verifyToken } = require('../services/dpoService');
const { updateUserSubscription, updateVendorSubscription, getSubscriptionStatus, logPayment } = require('../services/subscriptionService');

const TIER_MAP = {
    'basic': { amount: 50.00, currency: 'BWP' },
    'premium': { amount: 150.00, currency: 'BWP' },
    'vendor_basic': { amount: 200.00, currency: 'BWP' },
    'vendor_pro': { amount: 500.00, currency: 'BWP' }
};

// Initiate Payment
router.post('/initiate-payment', async (req, res) => {
    const { userId, userType, tier, email, firstName, lastName } = req.body;

    try {
        const tierInfo = TIER_MAP[tier];
        if (!tierInfo) {
            return res.status(400).json({ error: 'Invalid subscription tier' });
        }

        const paymentData = {
            companyToken: process.env.DPO_COMPANY_TOKEN,
            currency: tierInfo.currency,
            amount: tierInfo.amount,
            serviceType: process.env.DPO_SERVICE_TYPE,
            paymentDescription: `Subscription: ${tier}`,
            redirectURL: `http://localhost:5173/subscription/success?userId=${userId}&tier=${tier}&type=${userType}`,
            backURL: `http://localhost:5173/payment-cancel`,
            customerEmail: email,
            customerFirstName: firstName,
            customerLastName: lastName
        };

        const tokenResult = await createToken(paymentData);

        if (tokenResult.success) {
            res.json({
                success: true,
                transToken: tokenResult.transToken,
                paymentURL: tokenResult.paymentURL
            });
        } else {
            res.status(500).json({ error: 'Failed to create DPO token', details: tokenResult.error });
        }
    } catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({ error: error.message });
    }
});

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
