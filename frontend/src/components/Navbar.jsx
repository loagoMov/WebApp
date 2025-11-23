import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../context/UserContext';

import logo from '../assets/logo.png';

import { ADMIN_EMAILS } from './ProtectedAdminRoute';

// ...

const Navbar = () => {
    const { isAuthenticated, user } = useAuth0();
    const { userProfile } = useUser();
    const isAdmin = isAuthenticated && user?.email && ADMIN_EMAILS.includes(user.email);

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <img className="h-12 w-auto" src={logo} alt="CoverBots" />
                        </Link>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
                        <Link to="/" className="text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                            Home
                        </Link>
                        <Link to="/about" className="text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                            About Us
                        </Link>
                        {isAdmin && (
                            <Link to="/admin/dashboard" className="text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium">
                                Admin Dashboard
                            </Link>
                        )}

                        {/* Show Vendor Portal only if user is a vendor */}
                        {userProfile?.role === 'vendor' && (
                            <Link
                                to="/vendor/dashboard"
                                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Vendor Portal
                            </Link>
                        )}

                        {/* Show "Become a Vendor" if not logged in or not a vendor */}
                        {(!isAuthenticated || (userProfile && userProfile.role !== 'vendor')) && (
                            <Link
                                to={isAuthenticated ? "/vendor/register" : "/vendor/register"}
                                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Become a Vendor
                            </Link>
                        )}

                        <Link to="/quiz" className="bg-primary text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                            Get Recommended
                        </Link>
                        <AuthButtons />
                    </div>
                </div>
            </div>
        </nav>
    );
};

const AuthButtons = () => {
    const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

    if (isAuthenticated) {
        return (
            <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-sm text-gray-700 hover:text-primary font-medium">
                    Hi, {user.given_name || user.name}
                </Link>
                <button
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                    Log Out
                </button>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => loginWithRedirect()}
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
                Log In
            </button>
            <Link
                to="/register"
                className="bg-gray-100 text-gray-900 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium ml-2"
            >
                Register
            </Link>
        </>
    );
};

export default Navbar;
