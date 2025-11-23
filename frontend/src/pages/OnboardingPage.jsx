import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OnboardingPage = () => {
    const { user, getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        location: '',
        role: 'user' // Default to 'user'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('OnboardingPage mounted');
        const fetchExistingData = async () => {
            if (user) {
                // Pre-fill from Auth0
                let initialData = {
                    fullName: user.name || '',
                    email: user.email,
                    phone: '',
                    location: '',
                    role: 'user'
                };

                // Try to fetch from Firestore in case they have partial data
                try {
                    // We need to import db and doc/getDoc here or use axios if we want to stick to API
                    // Let's use the API since we have the token
                    const token = await getAccessTokenSilently();
                    const response = await axios.get(`http://localhost:3000/api/users/${user.sub}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.data) {
                        initialData = { ...initialData, ...response.data };
                    }
                } catch (error) {
                    // Ignore 404 or other errors, just use Auth0 data
                    console.log('No existing profile data found or error fetching it');
                }

                setFormData(prev => ({
                    ...prev,
                    ...initialData
                }));
            }
        };

        fetchExistingData();
    }, [user, getAccessTokenSilently]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = await getAccessTokenSilently();

            // Create FormData object for multipart/form-data request
            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('phone', formData.phone);
            data.append('location', formData.location);
            data.append('role', formData.role);
            // Note: photo upload is not yet implemented in the form, but backend supports it

            // We use the update endpoint, which acts as create/update with merge: true
            // Ensure user.sub is URL encoded to handle characters like '|'
            await axios.put(`http://localhost:3000/api/users/${encodeURIComponent(user.sub)}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Redirect based on role
            if (formData.role === 'vendor') {
                navigate('/vendor/dashboard');
            } else {
                navigate('/profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Welcome to CoverBots!
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Please complete your profile to get started.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <div className="mt-1">
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                Location (City/Town)
                            </label>
                            <div className="mt-1">
                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                I am a...
                            </label>
                            <div className="mt-1">
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                                >
                                    <option value="user">Regular User (Looking for Insurance)</option>
                                    <option value="vendor">Insurance Vendor (Selling Policies)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                            >
                                {loading ? 'Setting up...' : 'Complete Setup'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;
