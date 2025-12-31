import React, { createContext, useContext, useMemo } from 'react';
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
    const stripePromise = useMemo(() => {
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) return null;
        return loadStripe(publishableKey);
    }, []);

    const error = useMemo(() => {
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        return publishableKey ? null : 'Stripe publishable key is not configured';
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
