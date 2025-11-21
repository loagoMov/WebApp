const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { updateUserSubscription, updateVendorSubscription, getSubscriptionStatus } = require('../services/subscriptionService');

// Map price IDs to internal tier names
// NOTE: These Price IDs should be replaced with actual Stripe Price IDs from your dashboard
const PRICE_TIER_MAP = {
    'price_bronze_id': 'vendor_bronze',
    'price_silver_id': 'vendor_silver',
    'price_gold_id': 'vendor_gold',
    'price_lite_id': 'user_lite',
    'price_plus_id': 'user_plus',
    'price_ultimate_id': 'user_ultimate'
};

// Create Checkout Session
router.post('/create-checkout-session', async (req, res) => {
    const { priceId, userId, userType, successUrl, cancelUrl } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                userId,
                userType // 'user' or 'vendor'
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create Customer Portal Session
router.post('/create-portal-session', async (req, res) => {
    const { customerId, returnUrl } = req.body;

    try {
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating portal session:', error);
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

// Webhook Handler
// NOTE: This route needs raw body parsing in server.js
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            await handleCheckoutCompleted(session);
            break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            const subscription = event.data.object;
            await handleSubscriptionUpdated(subscription);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

async function handleCheckoutCompleted(session) {
    const { userId, userType } = session.metadata;

    // In a real app, you might want to fetch the subscription details to get the price ID
    // For simplicity, we'll assume the webhook for subscription.updated will handle the tier mapping
    // Or we can retrieve the line items here if needed.
    console.log(`Checkout completed for ${userType} ${userId}`);
}

async function handleSubscriptionUpdated(subscription) {
    // Find the user/vendor associated with this customer ID
    // This is tricky without a reverse lookup or storing metadata on the subscription
    // Ideally, we stored userId in metadata during checkout, which persists to subscription

    const userId = subscription.metadata.userId;
    const userType = subscription.metadata.userType;
    const priceId = subscription.items.data[0].price.id;
    const tier = PRICE_TIER_MAP[priceId] || 'unknown';

    const subscriptionData = {
        customerId: subscription.customer,
        subscriptionId: subscription.id,
        tier: tier,
        status: subscription.status
    };

    if (userType === 'vendor') {
        // We need the vendor ID. If we don't have it in metadata, we might need to query by stripeCustomerId
        // For now, assuming metadata is preserved
        if (userId) {
            await updateVendorSubscription(userId, subscriptionData);
        }
    } else {
        if (userId) {
            await updateUserSubscription(userId, subscriptionData);
        }
    }
}

module.exports = router;
