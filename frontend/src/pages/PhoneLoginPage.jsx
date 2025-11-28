import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const PhoneLoginPage = () => {
    const { sendOTP, verifyOTP, currentUser, loading } = useAuth();
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOTP] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (currentUser) {
        return <Navigate to="/profile" replace />;
    }

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Format phone number for Botswana (+267)
            const formattedNumber = phoneNumber.startsWith('+')
                ? phoneNumber
                : `+267${phoneNumber.replace(/\s/g, '')}`;

            const result = await sendOTP(formattedNumber);
            setConfirmationResult(result);
            setStep('otp');
        } catch (err) {
            console.error('OTP Error:', err);
            if (err.code === 'auth/invalid-phone-number') {
                setError('Invalid phone number format.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many requests. Please try again later.');
            } else {
                setError('Failed to send OTP. Please check your number.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await verifyOTP(confirmationResult, otp);

            // Check if user exists in Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (!userDoc.exists()) {
                // New user - create profile
                await setDoc(doc(db, 'users', user.uid), {
                    phoneNumber: user.phoneNumber,
                    role: 'user',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }

            navigate('/profile');
        } catch (err) {
            console.error('Verification Error:', err);
            if (err.code === 'auth/invalid-verification-code') {
                setError('Invalid OTP. Please try again.');
            } else if (err.code === 'auth/code-expired') {
                setError('OTP expired. Please request a new one.');
            } else {
                setError('Verification failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F1E6] dark:bg-[#003366] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
            <div id="recaptcha-container"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {step === 'phone' ? 'Sign in with phone' : 'Enter verification code'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link to="/login" className="font-medium text-primary hover:text-blue-500">
                        sign in with email
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-[#002244] py-8 px-4 shadow sm:rounded-lg sm:px-10 transition-colors duration-300">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {step === 'phone' ? (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#003366] text-gray-500 dark:text-gray-300 text-sm">
                                        +267
                                    </span>
                                    <input
                                        type="tel"
                                        required
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="71234567"
                                        pattern="[0-9]{8}"
                                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    Enter your 8-digit Botswana mobile number
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                            >
                                {isLoading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                                    placeholder="123456"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm text-center text-lg tracking-widest"
                                />
                                <p className="mt-2 text-sm text-gray-500">
                                    Sent to +267{phoneNumber}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                            >
                                {isLoading ? 'Verifying...' : 'Verify & Continue'}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep('phone');
                                    setOTP('');
                                    setError('');
                                }}
                                className="w-full text-sm text-gray-600 hover:text-gray-900"
                            >
                                ← Change number
                            </button>
                        </form>
                    )}

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-[#002244] text-gray-500 dark:text-gray-300">
                                    First time here?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link
                                to="/register"
                                className="font-medium text-primary hover:text-blue-500"
                            >
                                Create an account with email
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhoneLoginPage;
