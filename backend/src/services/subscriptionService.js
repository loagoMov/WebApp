const { db } = require('../config/firebase');

// Tier Limits Configuration
const TIER_LIMITS = {
    'vendor_bronze': { products: 3, bidding: false, analytics: 'basic' },
    'vendor_silver': { products: 10, bidding: true, analytics: 'advanced' },
    'vendor_gold': { products: 9999, bidding: true, analytics: 'full' },
    'user_lite': { compare: 3, save: 5, ai: 'standard' },
    'user_plus': { compare: 9999, save: 9999, ai: 'savings' },
    'user_ultimate': { compare: 9999, save: 9999, ai: 'advanced' }
};

const updateUserSubscription = async (userId, subscriptionData) => {
    try {
        const userRef = db.collection('users').doc(userId);
        const tier = subscriptionData.tier;

        await userRef.set({
            stripeCustomerId: subscriptionData.customerId,
            subscriptionId: subscriptionData.subscriptionId,
            tier: tier,
            status: subscriptionData.status,
            limits: TIER_LIMITS[tier] || {},
            updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log(`Updated user ${userId} with tier ${tier}`);
        return true;
    } catch (error) {
        console.error('Error updating user subscription:', error);
        throw error;
    }
};

const updateVendorSubscription = async (vendorId, subscriptionData) => {
    try {
        const vendorRef = db.collection('vendors').doc(vendorId);
        const tier = subscriptionData.tier;

        await vendorRef.set({
            stripeCustomerId: subscriptionData.customerId,
            subscriptionId: subscriptionData.subscriptionId,
            tier: tier,
            status: subscriptionData.status,
            limits: TIER_LIMITS[tier] || {},
            updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log(`Updated vendor ${vendorId} with tier ${tier}`);
        return true;
    } catch (error) {
        console.error('Error updating vendor subscription:', error);
        throw error;
    }
};

const getSubscriptionStatus = async (userId, type = 'user') => {
    try {
        const collection = type === 'vendor' ? 'vendors' : 'users';
        const doc = await db.collection(collection).doc(userId).get();

        if (!doc.exists) {
            return null;
        }

        const data = doc.data();
        return {
            tier: data.tier || 'free',
            status: data.status || 'inactive',
            limits: data.limits || {}
        };
    } catch (error) {
        console.error('Error getting subscription status:', error);
        throw error;
    }
};

module.exports = {
    updateUserSubscription,
    updateVendorSubscription,
    getSubscriptionStatus,
    TIER_LIMITS
};
