import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Create a Stripe payment intent for subscription
 * @param {Object} params - Payment parameters
 * @param {string} params.tier - Subscription tier
 * @param {string} params.userId - User ID
 * @param {string} params.userType - 'user' or 'vendor'
 * @param {string} params.email - User email
 * @param {string} params.firstName - User first name
 * @param {string} params.lastName - User last name
 * @returns {Promise<Object>} Payment intent data including client secret
 */
export const createPaymentIntent = async ({ tier, userId, userType, email, firstName, lastName }) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/subscriptions/create-payment-intent`, {
            tier,
            userId,
            userType,
            email,
            firstName,
            lastName
        });

        return {
            success: true,
            clientSecret: response.data.clientSecret,
            paymentIntentId: response.data.paymentIntentId
        };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message || 'Failed to create payment intent'
        };
    }
};

/**
 * Confirm subscription after successful payment
 * @param {Object} params - Confirmation parameters
 * @param {string} params.paymentIntentId - Stripe payment intent ID
 * @param {string} params.userId - User ID
 * @param {string} params.tier - Subscription tier
 * @param {string} params.userType - 'user' or 'vendor'
 * @returns {Promise<Object>} Confirmation result
 */
export const confirmSubscription = async ({ paymentIntentId, userId, tier, userType }) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/subscriptions/confirm-subscription`, {
            paymentIntentId,
            userId,
            tier,
            userType
        });

        return {
            success: true,
            subscription: response.data.subscription
        };
    } catch (error) {
        console.error('Error confirming subscription:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message || 'Failed to confirm subscription'
        };
    }
};

/**
 * Get subscription status
 * @param {string} userId - User ID
 * @param {string} type - 'user' or 'vendor'
 * @returns {Promise<Object>} Subscription status
 */
export const getSubscriptionStatus = async (userId, type = 'user') => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/subscriptions/status/${userId}?type=${type}`);
        return response.data;
    } catch (error) {
        console.error('Error getting subscription status:', error);
        return { tier: 'free', status: 'inactive' };
    }
};
