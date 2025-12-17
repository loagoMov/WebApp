import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const StripeContext = createContext(null);

export const useStripe = () => {
    const context = useContext(StripeContext);
    if (!context) {
        throw new Error('useStripe must be used within StripeProvider');
    }
    return context;
};

export const StripeProvider = ({ children }) => {
    const [stripePromise, setStripePromise] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey) {
            setError('Stripe publishable key is not configured');
            console.error('VITE_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
            return;
        }

        try {
            const stripe = loadStripe(publishableKey);
            setStripePromise(stripe);
        } catch (err) {
            setError('Failed to load Stripe');
            console.error('Error loading Stripe:', err);
        }
    }, []);

    const value = {
        stripePromise,
        error
    };

    return (
        <StripeContext.Provider value={value}>
            {children}
        </StripeContext.Provider>
    );
};

export default StripeProvider;
