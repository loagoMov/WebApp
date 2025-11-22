const { db } = require('../config/firebase');
const admin = require('firebase-admin');

// Tier Limits Configuration
const TIER_LIMITS = {
    'vendor_bronze': { products: 3, bidding: false, analytics: 'basic', schemaTier: 'Starter' },
    'vendor_silver': { products: 10, bidding: true, analytics: 'advanced', schemaTier: 'Growth' },
    'vendor_gold': { products: 9999, bidding: true, analytics: 'full', schemaTier: 'Dominion' },
    'user_lite': { compare: 3, save: 5, ai: 'standard', schemaTier: 'Free' },
    'user_plus': { compare: 9999, save: 9999, ai: 'savings', schemaTier: 'SmartPlan' },
    'user_ultimate': { compare: 9999, save: 9999, ai: 'advanced', schemaTier: 'ElitePlan' }
};

const updateUserSubscription = async (userId, subscriptionData) => {
    try {
        const internalTier = subscriptionData.tier;
        const tierConfig = TIER_LIMITS[internalTier] || TIER_LIMITS['user_lite'];
        const schemaTier = tierConfig.schemaTier;

        // 1. Update main user document
        const userRef = db.collection('users').doc(userId);
        await userRef.set({
            subscriptionTier: schemaTier,
            quotaLimit: tierConfig.compare, // Example quota
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // 2. Update userSubscriptions collection
        const subRef = db.collection('userSubscriptions').doc(userId);
        await subRef.set({
            tier: schemaTier,
            validUntil: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // Approx 1 month
            stripeSubscriptionId: subscriptionData.subscriptionId,
            stripeCustomerId: subscriptionData.customerId,
            status: subscriptionData.status,
            paymentHistory: admin.firestore.FieldValue.arrayUnion({
                amount: 0, // We'd need to pass this from webhook
                date: admin.firestore.Timestamp.now(),
                method: 'stripe'
            })
        }, { merge: true });

        console.log(`Updated user ${userId} to ${schemaTier}`);
        return true;
    } catch (error) {
        console.error('Error updating user subscription:', error);
        throw error;
    }
};

const updateVendorSubscription = async (vendorId, subscriptionData) => {
    try {
        const internalTier = subscriptionData.tier;
        const tierConfig = TIER_LIMITS[internalTier] || TIER_LIMITS['vendor_bronze'];
        const schemaTier = tierConfig.schemaTier;

        // 1. Update main vendor document
        const vendorRef = db.collection('vendors').doc(vendorId);
        await vendorRef.set({
            subscriptionTier: schemaTier,
            productLimit: tierConfig.products,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // 2. Update vendorSubscriptions collection
        const subRef = db.collection('vendorSubscriptions').doc(vendorId);
        await subRef.set({
            tier: schemaTier,
            validUntil: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
            stripeSubscriptionId: subscriptionData.subscriptionId,
            stripeCustomerId: subscriptionData.customerId,
            status: subscriptionData.status,
            paymentHistory: admin.firestore.FieldValue.arrayUnion({
                amount: 0,
                date: admin.firestore.Timestamp.now(),
                method: 'stripe'
            })
        }, { merge: true });

        console.log(`Updated vendor ${vendorId} to ${schemaTier}`);
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
            return { tier: 'free', status: 'inactive', limits: {} };
        }

        const data = doc.data();
        // Reverse map schema tier to internal tier for frontend compatibility if needed
        // Or just return the limits based on the stored tier
        const schemaTier = data.subscriptionTier || (type === 'vendor' ? 'Starter' : 'Free');

        // Find internal tier key based on schema tier
        const internalTierKey = Object.keys(TIER_LIMITS).find(key => TIER_LIMITS[key].schemaTier === schemaTier);
        const limits = TIER_LIMITS[internalTierKey] || {};

        return {
            tier: internalTierKey || 'free', // Return internal key for frontend logic compatibility
            schemaTier: schemaTier,
            status: 'active', // You might want to fetch real status from sub collection
            limits: limits
        };
    } catch (error) {
        console.error('Error getting subscription status:', error);
        throw error;
    }
};

const logPayment = async (paymentData) => {
    try {
        await db.collection('payments').add({
            ...paymentData,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Logged payment for ${paymentData.userId}`);
    } catch (error) {
        console.error('Error logging payment:', error);
        // Don't throw here, logging failure shouldn't fail the request
    }
};

module.exports = {
    updateUserSubscription,
    updateVendorSubscription,
    getSubscriptionStatus,
    logPayment,
    TIER_LIMITS
};
