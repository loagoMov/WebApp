import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const register = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const googleLogin = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    // Initialize reCAPTCHA verifier
    const setupRecaptcha = (containerId = 'recaptcha-container') => {
        if (!recaptchaVerifier) {
            const verifier = new RecaptchaVerifier(auth, containerId, {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved - allow signInWithPhoneNumber
                },
                'expired-callback': () => {
                    // Response expired - user needs to solve reCAPTCHA again
                }
            });
            setRecaptchaVerifier(verifier);
            return verifier;
        }
        return recaptchaVerifier;
    };

    // Send OTP to phone number
    const sendOTP = async (phoneNumber) => {
        try {
            const verifier = setupRecaptcha();
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
            return confirmationResult;
        } catch (error) {
            console.error('Error sending OTP:', error);
            throw error;
        }
    };

    // Verify OTP and complete sign-in
    const verifyOTP = async (confirmationResult, otp) => {
        try {
            const result = await confirmationResult.confirm(otp);
            return result.user;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error;
        }
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        googleLogin,
        sendOTP,
        verifyOTP,
        setupRecaptcha,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
