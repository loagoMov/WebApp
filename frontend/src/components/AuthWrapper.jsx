import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const AuthWrapper = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const navigate = useNavigate();
    const location = useLocation();
    const [checkingProfile, setCheckingProfile] = useState(true);
    const [showProfileNotification, setShowProfileNotification] = useState(false);

    useEffect(() => {
        const checkProfile = async () => {
            if (isLoading) return;

            if (isAuthenticated && user) {
                // Skip check if already on onboarding or profile page
                if (location.pathname === '/onboarding' || location.pathname === '/profile') {
                    setCheckingProfile(false);
                    setShowProfileNotification(false);
                    return;
                }

                try {
                    const userRef = doc(db, 'users', user.sub);
                    const userSnap = await getDoc(userRef);

                    if (!userSnap.exists()) {
                        // Profile doesn't exist, show notification instead of redirecting
                        setShowProfileNotification(true);
                    } else {
                        const userData = userSnap.data();

                        // Check if critical data is missing
                        if (!userData.fullName || !userData.phone || !userData.location) {
                            setShowProfileNotification(true);
                        } else {
                            setShowProfileNotification(false);
                        }

                        // If user is on login page, redirect to dashboard based on role
                        const publicPaths = ['/vendor/login', '/admin/login', '/login'];
                        if (publicPaths.includes(location.pathname)) {
                            if (userData.role === 'vendor') {
                                navigate('/vendor/dashboard');
                            } else if (userData.role === 'admin') {
                                navigate('/admin/dashboard');
                            } else {
                                navigate('/profile');
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error checking user profile:", error);
                }
            }
            setCheckingProfile(false);
        };

        checkProfile();
    }, [user, isAuthenticated, isLoading, navigate, location.pathname]);

    if (isLoading || (isAuthenticated && checkingProfile)) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <>
            {children}
            {showProfileNotification && (
                <div className="fixed bottom-4 right-4 bg-white border border-gray-200 shadow-lg rounded-lg p-4 max-w-md z-50 animate-fade-in-up">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3 w-0 flex-1 pt-0.5">
                            <p className="text-sm font-medium text-gray-900">Complete your profile</p>
                            <p className="mt-1 text-sm text-gray-500">
                                Adding your details helps us give you better insurance recommendations.
                            </p>
                            <div className="mt-3 flex space-x-7">
                                <Link
                                    to="/profile"
                                    className="bg-white rounded-md text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    onClick={() => setShowProfileNotification(false)}
                                >
                                    Update Profile
                                </Link>
                                <button
                                    type="button"
                                    className="bg-white rounded-md text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    onClick={() => setShowProfileNotification(false)}
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={() => setShowProfileNotification(false)}
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AuthWrapper;
