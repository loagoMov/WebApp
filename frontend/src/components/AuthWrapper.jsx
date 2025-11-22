import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const AuthWrapper = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const navigate = useNavigate();
    const location = useLocation();
    const [checkingProfile, setCheckingProfile] = useState(true);

    useEffect(() => {
        const checkProfile = async () => {
            if (isLoading) return;

            if (isAuthenticated && user) {
                console.log('AuthWrapper: User authenticated', user.sub);
                // Skip check if already on onboarding page
                if (location.pathname === '/onboarding') {
                    console.log('AuthWrapper: Already on onboarding page');
                    setCheckingProfile(false);
                    return;
                }

                try {
                    const userRef = doc(db, 'users', user.sub);
                    const userSnap = await getDoc(userRef);

                    if (!userSnap.exists()) {
                        console.log('AuthWrapper: Profile not found, redirecting to onboarding');
                        // Profile doesn't exist, redirect to onboarding
                        navigate('/onboarding');
                    } else {
                        console.log('AuthWrapper: Profile found');
                        // Profile exists, check if we need to redirect from root or login pages
                        // This part is optional but good for UX
                        const userData = userSnap.data();
                        // If user is on login page or root, redirect to dashboard based on role
                        if (location.pathname === '/' || location.pathname === '/vendor/login' || location.pathname === '/admin/login') {
                            // Logic can be refined here if needed
                        }
                    }
                } catch (error) {
                    console.error("Error checking user profile:", error);
                }
            } else if (!isLoading) {
                console.log('AuthWrapper: User not authenticated');
            }
            setCheckingProfile(false);
        };

        checkProfile();
    }, [user, isAuthenticated, isLoading, navigate, location.pathname]);

    if (isLoading || (isAuthenticated && checkingProfile)) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return children;
};

export default AuthWrapper;
