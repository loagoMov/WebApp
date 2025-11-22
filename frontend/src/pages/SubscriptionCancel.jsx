import React from 'react';
import { useNavigate } from 'react-router-dom';

const SubscriptionCancel = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment Canceled</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        You have canceled the payment process. No charges were made.
                    </p>
                </div>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center">
                    <div className="rounded-md shadow">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionCancel;
