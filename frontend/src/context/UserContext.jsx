import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [userProfile, setUserProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const fetchUserProfile = async () => {
        if (isAuthenticated && user) {
            setLoadingProfile(true);
            try {
                const userRef = doc(db, 'users', user.sub);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setUserProfile(userSnap.data());
                } else {
                    setUserProfile(null);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            } finally {
                setLoadingProfile(false);
            }
        } else {
            setUserProfile(null);
            setLoadingProfile(false);
        }
    };

    useEffect(() => {
        if (!isLoading) {
            fetchUserProfile();
        }
    }, [isAuthenticated, user, isLoading]);

    return (
        <UserContext.Provider value={{ userProfile, loadingProfile, refreshProfile: fetchUserProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
