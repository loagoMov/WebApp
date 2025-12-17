import React, { useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { useStripe } from '../context/StripeProvider';
import CheckoutForm from './CheckoutForm';

const PaymentModal = ({ isOpen, onClose, tier, tierName, price, user, userType = 'user' }) => {
    const { stripePromise, error: stripeError } = useStripe();

    // Close modal on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSuccess = (paymentIntent) => {
        console.log('Payment successful:', paymentIntent);
        // Redirect to success page
        window.location.href = `/subscription/success?userId=${user.uid}&tier=${tier}&type=${userType}`;
    };

    const handleError = (error) => {
        console.error('Payment failed:', error);
        // Error is already displayed in the form
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Subscribe to {tierName}
                        </h2>
                        <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                            {price}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Billed monthly
                        </p>
                    </div>

                    {/* Stripe Error */}
                    {stripeError && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-200">
                                {stripeError}
                            </p>
                        </div>
                    )}

                    {/* Payment Form */}
                    {!stripeError && stripePromise && (
                        <Elements stripe={stripePromise}>
                            <CheckoutForm
                                tier={tier}
                                user={user}
                                userType={userType}
                                onSuccess={handleSuccess}
                                onError={handleError}
                                onCancel={onClose}
                            />
                        </Elements>
                    )}

                    {/* Loading state */}
                    {!stripeError && !stripePromise && (
                        <div className="flex items-center justify-center py-8">
                            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}

                    {/* Security badge */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            Secured by Stripe
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
