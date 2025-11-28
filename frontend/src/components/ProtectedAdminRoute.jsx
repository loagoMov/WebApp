import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

// Hardcoded list of allowed admin emails
// In a real production app, this should be handled via Firebase Custom Claims
export const ADMIN_EMAILS = [
    'admin@coverbots.bw',
    'loagomontsho@gmail.com',
    'coverbotsbw@gmail.com',
    'montsholoago100@gmail.com', // Added for testing
];

const ProtectedAdminRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/admin/login" replace />;
    }

    if (!ADMIN_EMAILS.includes(currentUser.email)) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized</h1>
                <p className="text-gray-600 mb-8">You do not have permission to access the Admin Dashboard.</p>
                <p className="text-sm text-gray-500">Logged in as: {currentUser.email}</p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-blue-700"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return children;
};

export default ProtectedAdminRoute;
