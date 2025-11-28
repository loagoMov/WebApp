import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TIMEOUT_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

const InactivityHandler = () => {
    const { logout, currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        const checkForInactivity = () => {
            const lastActive = localStorage.getItem('lastActiveTime');
            if (lastActive) {
                const now = Date.now();
                if (now - parseInt(lastActive, 10) > TIMEOUT_MS) {
                    console.log("Session expired due to inactivity.");
                    logout();
                    window.location.href = '/login';
                }
            }
        };

        const updateActivity = () => {
            localStorage.setItem('lastActiveTime', Date.now().toString());
        };

        // Check on mount
        checkForInactivity();

        // Set up listeners
        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('click', updateActivity);
        window.addEventListener('scroll', updateActivity);

        // Check periodically (e.g., every minute)
        const interval = setInterval(checkForInactivity, 60000);

        return () => {
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keydown', updateActivity);
            window.removeEventListener('click', updateActivity);
            window.removeEventListener('scroll', updateActivity);
            clearInterval(interval);
        };
    }, [currentUser, logout]);

    return null; // This component renders nothing
};

export default InactivityHandler;
