import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

const LoginPage = () => {
    const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to="/profile" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <button
                        onClick={() => loginWithRedirect({ screen_hint: 'signup' })}
                        className="font-medium text-primary hover:text-blue-500"
                    >
                        create a new account
                    </button>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div>
                        <button
                            onClick={() => loginWithRedirect()}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Sign in with Auth0
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
