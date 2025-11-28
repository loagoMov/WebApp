import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SubscriptionSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        const verifyPayment = async () => {
            const transToken = searchParams.get('TransactionToken');

            if (!transToken) {
                setStatus('error');
                setMessage('No transaction token found.');
                return;
            }

            try {
                const token = await currentUser.getIdToken();
                // We need to know the tier and userType. Ideally, these should be passed in state or retrieved.
                // For now, we might need to rely on what we stored or just verify the token.
                // The backend verify-payment needs userId, userType, tier to update the DB.
                // DPO doesn't pass back custom params in the URL easily unless we appended them to the redirect URL.
                // Let's assume we appended them or we can verify just with the token and update based on that if the backend stored the ref.
                // BUT, my backend implementation expects them in the body.

                // WORKAROUND: For this MVP, we will try to verify. 
                // If the backend requires tier/userType, we should have encoded them in the redirect URL.
                // Let's update the initiate-payment to encode them in the redirect URL.

                // Assuming the URL is like /subscription/success?TransactionToken=...&tier=...&userType=...
                const tier = searchParams.get('tier');
                const userType = searchParams.get('userType');

                const response = await axios.post('http://localhost:3000/api/subscriptions/verify-payment', {
                    transToken,
                    userId: currentUser.uid,
                    userType: userType || 'user', // Default fallback
                    tier: tier || 'user_plus' // Default fallback
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.status === 'success') {
                    setStatus('success');
                    setMessage('Payment successful! Your subscription is active.');
                    setTimeout(() => {
                        navigate(userType === 'vendor' ? '/vendor/dashboard' : '/profile');
                    }, 3000);
                } else {
                    setStatus('failed');
                    setMessage(response.data.message || 'Payment verification failed.');
                }
            } catch (error) {
                console.error('Verification error:', error);
                setStatus('error');
                setMessage('An error occurred while verifying payment.');
            }
        };

        if (currentUser) {
            verifyPayment();
        }
    }, [currentUser, searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                {status === 'verifying' && (
                    <div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verifying Payment</h2>
                        <p className="mt-2 text-sm text-gray-600">{message}</p>
                        <div className="mt-4 animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    </div>
                )}
                {status === 'success' && (
                    <div>
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Success!</h2>
                        <p className="mt-2 text-sm text-gray-600">{message}</p>
                        <p className="mt-4 text-sm text-gray-500">Redirecting you back...</p>
                    </div>
                )}
                {(status === 'failed' || status === 'error') && (
                    <div>
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment Failed</h2>
                        <p className="mt-2 text-sm text-gray-600">{message}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionSuccess;
