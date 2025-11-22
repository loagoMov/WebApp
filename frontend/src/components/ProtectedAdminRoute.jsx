import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

// Hardcoded list of allowed admin emails
// In a real production app, this should be handled via Auth0 Roles/Permissions
export const ADMIN_EMAILS = [
    'admin@coverbots.bw',
    'loagomontsho@gmail.com',
    'coverbotsbw@gmail.com',
    'montsholoago100@gmail.com', // Added for testing
];

const ProtectedAdminRoute = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth0();

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    if (!ADMIN_EMAILS.includes(user.email)) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized</h1>
                <p className="text-gray-600 mb-8">You do not have permission to access the Admin Dashboard.</p>
                <p className="text-sm text-gray-500">Logged in as: {user.email}</p>
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
