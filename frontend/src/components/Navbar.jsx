import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

import PrimeNavigation from './PrimeNavigation';

import logo from '../assets/logo.png';

import { ADMIN_EMAILS } from './ProtectedAdminRoute';

// ...

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const { userProfile } = useUser();
    const isAdmin = currentUser?.email && ADMIN_EMAILS.includes(currentUser.email);

    const menuItems = [
        { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
        { label: 'About Us', ariaLabel: 'Learn about us', link: '/about' },
        { label: 'Get Recommended', ariaLabel: 'Take the quiz', link: '/quiz' },
    ];

    if (isAdmin) {
        menuItems.push({ label: 'Admin Dashboard', ariaLabel: 'Admin Dashboard', link: '/admin/dashboard' });
    }

    if (userProfile?.role === 'vendor') {
        menuItems.push({ label: 'Vendor Portal', ariaLabel: 'Vendor Portal', link: '/vendor/dashboard' });
    } else if (!currentUser || (userProfile && userProfile.role !== 'vendor')) {
        menuItems.push({ label: 'Become a Vendor', ariaLabel: 'Vendor Registration', link: currentUser ? "/vendor/register" : "/vendor/register" });
    }

    if (currentUser) {
        menuItems.push({ label: 'Profile', ariaLabel: 'User Profile', link: '/profile' });
    }

    const socialItems = [
        { label: 'Twitter', link: 'https://twitter.com' },
        { label: 'GitHub', link: 'https://github.com' },
        { label: 'LinkedIn', link: 'https://linkedin.com' }
    ];

    return (
        <nav className="bg-white dark:bg-[#003366] dark:text-white shadow-sm sticky top-0 z-50 h-16 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex justify-between items-center h-full">
                    <div className="flex items-center z-50">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <img className="h-12 w-auto" src={logo} alt="CoverBots" />
                        </Link>
                    </div>

                    <div className="flex items-center">
                        <div className="hidden sm:flex sm:items-center sm:space-x-8 mr-8">
                            <AuthButtons />
                        </div>

                        <div className="relative">
                            <PrimeNavigation />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const AuthButtons = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    if (currentUser) {
        return (
            <div className="flex items-center space-x-4">
                <Link
                    to="/profile"
                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    Profile
                </Link>
                <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                    Log Out
                </button>
            </div>
        );
    }

    return (
        <>
            <Link
                to="/login"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
                Log In
            </Link>
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
