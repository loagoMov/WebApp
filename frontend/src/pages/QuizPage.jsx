import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import CountryCodeSelect from '../components/CountryCodeSelect';

const QuizPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Combined form data for user info + quiz
    const [formData, setFormData] = useState({
        // User Info
        fullName: '',
        countryCode: '+267', // Default
        phone: '', // Just the number part
        location: '',

        // Quiz Data
        category: '',
        age: '',
        income: '',
        budget: '',
        dependents: '',
        riskTolerance: 3,
        // Auto specific
        vehicleMake: '',
        vehicleYear: '',
        vehicleValue: '',
        // Life specific
        smoker: false,
        conditions: false,
        coverageGoal: '',
    });

    // Fetch existing user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            if (isAuthenticated && user) {
                try {
                    const token = await getAccessTokenSilently();
                    const response = await axios.get(`http://localhost:3000/api/users/${user.sub}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.data) {
                        // Split phone if possible, or just set it
                        // Simple logic: if phone starts with +, try to extract code.
                        // For MVP, we might just load the whole string into phone if we didn't store it separately.
                        // Let's assume we store it as a full string. We'll try to parse it or just leave it.
                        // Better approach for now: just load it all into 'phone' if it exists,
                        // but for new inputs we use the selector.

                        setFormData(prev => ({
                            ...prev,
                            fullName: response.data.fullName || user.name || '',
                            phone: response.data.phone || '', // If existing data has full number, it might look weird in the split input.
                            // Ideally we'd parse it. For now, let's just load it.
                            location: response.data.location || ''
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching user data for quiz:", error);
                    // Fallback to Auth0 data
                    setFormData(prev => ({
                        ...prev,
                        fullName: user.name || ''
                    }));
                }
            }
        };
        fetchUserData();
    }, [isAuthenticated, user, getAccessTokenSilently]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    // Save user info when moving from Step 1 (UserInfo) to Step 2
    const handleUserInfoSubmit = async () => {
        if (!formData.fullName || !formData.location) {
            alert("Please provide at least your Name and Location to proceed.");
            return;
        }

        if (isAuthenticated && user) {
            try {
                // Background save - don't block UI too long
                const token = await getAccessTokenSilently();
                const apiFormData = new FormData();
                apiFormData.append('fullName', formData.fullName);
                // Combine code and number
                const fullPhone = formData.phone.startsWith('+') ? formData.phone : `${formData.countryCode}${formData.phone}`;
                apiFormData.append('phone', fullPhone);
                apiFormData.append('location', formData.location);

                // We don't await this strictly to block navigation, but good to fire it off
                axios.put(`http://localhost:3000/api/users/${user.sub}`, apiFormData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }).catch(err => console.error("Background profile update failed:", err));

            } catch (error) {
                console.error("Error preparing profile update:", error);
            }
        }
        nextStep();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Construct query from form data
            const query = `I am looking for ${formData.category} insurance. I am ${formData.age} years old, earning ${formData.income} BWP/month. My budget is ${formData.budget} BWP.`;

            const response = await fetch('http://localhost:3000/api/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_profile: formData,
                    query: query
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch recommendations');
            }

            const data = await response.json();
            navigate('/results', { state: { recommendations: data.recommendations } });
        } catch (error) {
            console.error("Error getting recommendations:", error);
            alert("Sorry, we couldn't generate recommendations at this time. Please try again.");
        } finally {
            setLoading(false);
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
                // Use OpenStreetMap Nominatim for free reverse geocoding
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

    const renderUserInfoStep = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Let's get to know you</h2>
            <p className="text-gray-500">We'll use this to personalize your insurance quotes.</p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                        placeholder="e.g. John Doe"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <CountryCodeSelect
                            value={formData.countryCode}
                            onChange={handleInputChange}
                            name="countryCode"
                        />
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                            placeholder="71234567"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                            placeholder="e.g. Gaborone"
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
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleUserInfoSubmit}
                    className="rounded-md bg-primary px-6 py-2 text-white hover:bg-blue-700"
                >
                    Next
                </button>
            </div>
        </div>
    );

    const renderCategoryStep = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">What are you looking to cover?</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {['Auto', 'Life', 'Funeral'].map((cat) => (
                    <div
                        key={cat}
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`cursor-pointer rounded-lg border p-6 text-center hover:border-primary hover:bg-blue-50 ${formData.category === cat ? 'border-primary bg-blue-50 ring-2 ring-primary' : 'border-gray-300'
                            }`}
                    >
                        <span className="block text-lg font-medium text-gray-900">{cat} Insurance</span>
                    </div>
                ))}
            </div>
            <div className="flex justify-between">
                <button onClick={prevStep} className="text-gray-600 hover:text-gray-900">Back</button>
                {formData.category && (
                    <button
                        onClick={nextStep}
                        className="rounded-md bg-primary px-6 py-2 text-white hover:bg-blue-700"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );

    const renderDetailsStep = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Tell us a bit about yourself</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Income (BWP)</label>
                    <input
                        type="number"
                        name="income"
                        value={formData.income}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Insurance Budget (BWP)</label>
                    <input
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Dependents</label>
                    <input
                        type="number"
                        name="dependents"
                        value={formData.dependents}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    />
                </div>
            </div>
            <div className="flex justify-between">
                <button onClick={prevStep} className="text-gray-600 hover:text-gray-900">Back</button>
                <button onClick={nextStep} className="rounded-md bg-primary px-6 py-2 text-white hover:bg-blue-700">Next</button>
            </div>
        </div>
    );

    const renderSpecificsStep = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Specific Details</h2>

            {formData.category === 'Auto' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle Make & Model</label>
                        <input type="text" name="vehicleMake" value={formData.vehicleMake} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle Year</label>
                        <input type="number" name="vehicleYear" value={formData.vehicleYear} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Estimated Value (BWP)</label>
                        <input type="number" name="vehicleValue" value={formData.vehicleValue} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                    </div>
                </div>
            )}

            {(formData.category === 'Life' || formData.category === 'Funeral') && (
                <div className="space-y-4">
                    <div className="flex items-center">
                        <input type="checkbox" name="smoker" checked={formData.smoker} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label className="ml-2 block text-sm text-gray-900">Do you smoke?</label>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" name="conditions" checked={formData.conditions} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label className="ml-2 block text-sm text-gray-900">Any pre-existing medical conditions?</label>
                    </div>
                </div>
            )}

            <div className="flex justify-between">
                <button onClick={prevStep} className="text-gray-600 hover:text-gray-900">Back</button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? 'Generating...' : 'Get Recommendations'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-white px-6 py-8 shadow sm:px-10">
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Step {step} of 4</span>
                            <div className="h-2 w-full max-w-xs rounded-full bg-gray-200 ml-4">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${(step / 4) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {step === 1 && renderUserInfoStep()}
                    {step === 2 && renderCategoryStep()}
                    {step === 3 && renderDetailsStep()}
                    {step === 4 && renderSpecificsStep()}
                </div>
            </div>
        </div>
    );
};

export default QuizPage;
