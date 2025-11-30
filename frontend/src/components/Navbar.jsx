import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import SearchModal from './SearchModal';

import PrimeNavigation from './PrimeNavigation';

import logo from '../assets/logo.png';

import { ADMIN_EMAILS } from './ProtectedAdminRoute';

// ...

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const { userProfile } = useUser();
    const isAdmin = currentUser?.email && ADMIN_EMAILS.includes(currentUser.email);
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);

    // Keyboard shortcut for search
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const menuItems = [
        { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
        { label: 'About Us', ariaLabel: 'Learn about us', link: '/about' },
        { label: 'Vendors', ariaLabel: 'Browse vendors', link: '/vendors' },
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
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none mr-4"
                            aria-label="Search"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        <div className="hidden sm:flex sm:items-center sm:space-x-8 mr-8">
                            <AuthButtons />
                        </div>

                        <div className="relative">
                            <PrimeNavigation />
                        </div>
                    </div>
                </div>
            </div>
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
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
