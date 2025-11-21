import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

const VendorLogin = () => {
    const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to="/vendor/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Vendor Portal
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Grow your insurance business with CoverBots
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="space-y-6">
                        <div>
                            <button
                                onClick={() => loginWithRedirect({
                                    appState: { returnTo: '/vendor/dashboard' }
                                })}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Log In as Vendor
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    New to CoverBots?
                                </span>
                            </div>
                        </div>

                        <div>
                            <button
                                onClick={() => loginWithRedirect({
                                    authorizationParams: {
                                        screen_hint: 'signup',
                                    },
                                    appState: { returnTo: '/vendor/dashboard' }
                                })}
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Register your Company
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorLogin;
