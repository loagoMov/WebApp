import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

const AdminLogin = () => {
    const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                    Admin Portal
                </h2>
                <p className="mt-2 text-center text-sm text-gray-400">
                    Restricted Access Only
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-700">
                    <div className="space-y-6">
                        <div>
                            <button
                                onClick={() => loginWithRedirect({
                                    appState: { returnTo: '/admin/dashboard' }
                                })}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Log In as Admin
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
