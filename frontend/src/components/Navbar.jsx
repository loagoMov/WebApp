import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../context/UserContext';

import PrimeNavigation from './PrimeNavigation';

import logo from '../assets/logo.png';

import { ADMIN_EMAILS } from './ProtectedAdminRoute';

// ...

const Navbar = () => {
    const { isAuthenticated, user } = useAuth0();
    const { userProfile } = useUser();
    const isAdmin = isAuthenticated && user?.email && ADMIN_EMAILS.includes(user.email);

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
    } else if (!isAuthenticated || (userProfile && userProfile.role !== 'vendor')) {
        menuItems.push({ label: 'Become a Vendor', ariaLabel: 'Vendor Registration', link: isAuthenticated ? "/vendor/register" : "/vendor/register" });
    }

    if (isAuthenticated) {
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

                    {/* Desktop Menu (Hidden on mobile/tablet if you want full replacement, or keep for desktop) */}
                    {/* For this request, we are adding the feature to the nav. 
                        The StaggeredMenu is typically a full-screen overlay. 
                        We can place it here. It handles its own toggle button. */}

                    <div className="flex items-center">
                        <div className="hidden sm:flex sm:items-center sm:space-x-8 mr-8">
                            {/* Keep existing desktop links if desired, or remove to fully rely on StaggeredMenu. 
                                The user said "add this feature to the nav", implying integration. 
                                Let's keep the main CTA visible and put the rest in the menu or just add the menu icon.
                                Given the "StaggeredMenu" nature, it usually replaces standard nav or acts as a hamburger menu.
                                Let's keep the AuthButtons visible for easy access and use StaggeredMenu for navigation.
                            */}
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
