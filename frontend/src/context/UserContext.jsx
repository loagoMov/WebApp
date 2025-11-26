import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const { currentUser, loading } = useAuth();
    const [userProfile, setUserProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const fetchUserProfile = async () => {
        if (currentUser) {
            setLoadingProfile(true);
            try {
                const userRef = doc(db, 'users', currentUser.uid);
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
        if (!loading) {
            fetchUserProfile();
        }
    }, [currentUser, loading]);

    return (
        <UserContext.Provider value={{ userProfile, loadingProfile, refreshProfile: fetchUserProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
