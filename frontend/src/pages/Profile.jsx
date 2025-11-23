import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { db, storage } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import CountryCodeSelect from '../components/CountryCodeSelect';

const Profile = () => {
    const { user, isAuthenticated, isLoading, getAccessTokenSilently, logout } = useAuth0();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        countryCode: '+267',
        phone: '',
        location: '',
        photoURL: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);

    const [subscription, setSubscription] = useState({ tier: 'free', status: 'inactive' });

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                // Fetch Firestore Data
                const userRef = doc(db, 'users', user.sub);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setFormData({
                        fullName: data.fullName || user.name || '',
                        email: user.email || '',
                        countryCode: '+267', // Default, or logic to extract if needed
                        phone: data.phone || '',
                        location: data.location || '',
                        photoURL: data.photoURL || user.picture || ''
                    });
                } else {
                    // Initialize with Auth0 data if no Firestore doc exists
                    setFormData({
                        fullName: user.name || '',
                        email: user.email || '',
                        countryCode: '+267',
                        phone: '',
                        location: '',
                        photoURL: user.picture || ''
                    });
                }

                // Fetch Subscription Data
                try {
                    const subRes = await axios.get(`http://localhost:3000/api/subscriptions/status/${user.sub}?type=user`);
                    if (subRes.data) setSubscription(subRes.data);
                } catch (error) {
                    console.error('Error fetching subscription:', error);
                }
            }
        };

        fetchUserData();
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            // Create preview
            setFormData(prev => ({
                ...prev,
                photoURL: URL.createObjectURL(e.target.files[0])
            }));
        }
    };

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const address = response.data.address;
                const city = address.city || address.town || address.village || address.state || '';

                if (city) {
                    setFormData(prev => ({ ...prev, location: city }));
                } else {
                    alert("Could not determine city from your location.");
                }
            } catch (error) {
                console.error("Error getting location:", error);
                alert("Failed to get location details.");
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            alert("Unable to retrieve your location. Please enter it manually.");
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setUploading(true);

        try {
            const token = await getAccessTokenSilently();
            const apiFormData = new FormData();
            apiFormData.append('fullName', formData.fullName);

            const fullPhone = formData.phone.startsWith('+') ? formData.phone : `${formData.countryCode}${formData.phone}`;
            apiFormData.append('phone', fullPhone);
            apiFormData.append('location', formData.location);

            if (file) {
                apiFormData.append('photo', file);
            }

            const response = await axios.put(`http://localhost:3000/api/users/${user.sub}`, apiFormData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setFormData(prev => ({ ...prev, ...formData, photoURL: response.data.photoURL || prev.photoURL }));
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error updating profile:", error);
            alert(`Failed to update profile: ${error.response?.data?.error || error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleManageSubscription = async () => {
        window.location.href = '/pricing';
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action is irreversible.')) {
            try {
                const token = await getAccessTokenSilently();
                await axios.delete(`http://localhost:3000/api/users/${user.sub}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Account deleted successfully.');
                logout({ returnTo: window.location.origin });
            } catch (error) {
                console.error('Error deleting account:', error);
                alert('Failed to delete account. Please try again.');
            }
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <div className="flex justify-center items-center h-screen">Please log in to view your profile.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow overflow-hidden">
                {/* Header Section */}
                <div className="px-4 py-5 sm:px-6 bg-primary text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-white">User Profile</h3>
                        <p className="mt-1 max-w-2xl text-sm text-blue-100">Personal details and application settings.</p>
                    </div>
                    <img
                        className="h-16 w-16 rounded-full border-4 border-white object-cover"
                        src={formData.photoURL}
                        alt={formData.fullName}
                    />
                </div>

                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="flex items-center space-x-6">
                                <div className="shrink-0">
                                    <img className="h-16 w-16 object-cover rounded-full" src={formData.photoURL} alt="Current profile photo" />
                                </div>
                                <label className="block">
                                    <span className="sr-only">Choose profile photo</span>
                                    <input type="file" onChange={handleFileChange} className="block w-full text-sm text-slate-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-full file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-violet-50 file:text-violet-700
                                      hover:file:bg-violet-100
                                    "/>
                                </label>
                            </div>

                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    disabled
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-500 sm:text-sm cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Contact Number</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <CountryCodeSelect
                                        value={formData.countryCode}
                                        onChange={handleChange}
                                        name="countryCode"
                                    />
                                    <input
                                        type="tel"
                                        name="phone"
                                        id="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                        placeholder="71234567"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        name="location"
                                        id="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleUseLocation}
                                        className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Locate Me</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={handleDeleteAccount}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                    Delete Account
                                </button>
                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                                    >
                                        {uploading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <dl className="sm:divide-y sm:divide-gray-200">
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.fullName}</dd>
                            </div>
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.email}</dd>
                            </div>
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.phone || 'Not set'}</dd>
                            </div>
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Location</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.location || 'Not set'}</dd>
                            </div>

                            {/* Subscription Section */}
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                                <dt className="text-sm font-medium text-gray-500">Subscription Plan</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center justify-between">
                                    <div>
                                        <span className="font-semibold capitalize">{subscription.tier.replace('user_', '')} Plan</span>
                                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {subscription.status}
                                        </span>
                                    </div>
                                    <div>
                                        {subscription.tier === 'free' || subscription.status !== 'active' ? (
                                            <a href="/pricing" className="text-primary hover:text-blue-700 font-medium text-sm">
                                                Upgrade Plan
                                            </a>
                                        ) : (
                                            <button
                                                onClick={handleManageSubscription}
                                                className="text-primary hover:text-blue-700 font-medium text-sm"
                                            >
                                                Manage Subscription
                                            </button>
                                        )}
                                    </div>
                                </dd>
                            </div>

                            <div className="py-4 sm:py-5 sm:px-6 flex justify-end">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </dl>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
