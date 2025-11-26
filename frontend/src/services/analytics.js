import { getAuth } from "firebase/auth";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const logEvent = async (eventType, metadata = {}) => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        const userId = user ? user.uid : null;

        await fetch(`${API_URL}/api/analytics/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                eventType,
                userId,
                metadata
            })
        });
    } catch (error) {
        console.error("Failed to log analytics event:", error);
    }
};

export const getDashboardStats = async (token) => {
    try {
        const response = await fetch(`${API_URL}/api/analytics/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        throw error;
    }
};
