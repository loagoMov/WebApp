import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { db, storage } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import CountryCodeSelect from '../components/CountryCodeSelect';
import { Skeleton } from 'primereact/skeleton';
import imageCompression from 'browser-image-compression';

const Profile = () => {
    const { currentUser, loading, logout, linkPhoneNumber } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        countryCode: '+267',
        phone: '',
        location: '',
        photoURL: '',
        dateOfBirth: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);

    const [subscription, setSubscription] = useState({ tier: 'free', status: 'inactive' });
    const [savedQuotes, setSavedQuotes] = useState([]);
    const [loadingQuotes, setLoadingQuotes] = useState(false);

    // Phone Linking State
    const [linkingPhone, setLinkingPhone] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [verificationId, setVerificationId] = useState(null);
    const [phoneToLink, setPhoneToLink] = useState('');

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                // Fetch Firestore Data
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();

                    // Construct fullName safely, avoiding "undefined" strings
                    let fullName = data.fullName || currentUser.displayName || '';
                    if (!fullName && data.firstName) {
                        fullName = `${data.firstName} ${data.lastName || ''}`.trim();
                    }

                    setFormData({
                        fullName: fullName,
                        email: currentUser.email || data.email || '',
                        countryCode: data.countryCode || '+267',
                        phone: data.phone || '',
                        location: data.location || '',
                        photoURL: data.photoURL || currentUser.photoURL || '',
                        dateOfBirth: data.dateOfBirth || ''
                    });
                } else {
                    // Initialize with Firebase Auth data if no Firestore doc exists
                    setFormData({
                        fullName: currentUser.displayName || '',
                        email: currentUser.email || '',
                        countryCode: '+267',
                        phone: '',
                        location: '',
                        photoURL: currentUser.photoURL || '',
                        dateOfBirth: ''
                    });
                }

                // Fetch Subscription Data
                try {
                    const subRes = await axios.get(`http://localhost:3000/api/subscriptions/status/${currentUser.uid}?type=user`);
                    if (subRes.data) setSubscription(subRes.data);
                } catch (error) {
                    console.error('Error fetching subscription:', error);
                }

                // Fetch Saved Quotes (using Firebase Auth token)
                try {
                    setLoadingQuotes(true);
                    const token = await currentUser.getIdToken();
                    const quotesRes = await axios.get(`http://localhost:3000/api/quotes/${currentUser.uid}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setSavedQuotes(quotesRes.data);
                } catch (error) {
                    console.error('Error fetching saved quotes:', error);
                } finally {
                    setLoadingQuotes(false);
                }
            }
        };

        fetchUserData();
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];

            try {
                // Compression options
                const options = {
                    maxSizeMB: 1, // Maximum size in MB
                    maxWidthOrHeight: 800, // Max dimension
                    useWebWorker: true,
                    fileType: 'image/jpeg' // Convert to JPEG for better compression
                };

                // Compress the image
                const compressedFile = await imageCompression(file, options);
                console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
                console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

                setFile(compressedFile);
                setFormData(prev => ({ ...prev, photoURL: URL.createObjectURL(compressedFile) }));
            } catch (error) {
                console.error('Error compressing image:', error);
                // Fallback to original file if compression fails
                setFile(file);
                setFormData(prev => ({ ...prev, photoURL: URL.createObjectURL(file) }));
            }
        }
    };

    const handleUseLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                    );
                    const data = await response.json();

                    // Extract readable address
                    const address = data.address;
                    let locationName = '';

                    // Build location string from most specific to least
                    if (address.suburb || address.neighbourhood) {
                        locationName = address.suburb || address.neighbourhood;
                    } else if (address.village || address.town || address.city) {
                        locationName = address.village || address.town || address.city;
                    }

                    // Add city if we have a suburb/neighbourhood
                    if ((address.suburb || address.neighbourhood) && address.city) {
                        locationName += `, ${address.city}`;
                    }

                    // Fallback to full display name if specific parts not available
                    if (!locationName) {
                        locationName = data.display_name;
                    }

                    setFormData(prev => ({ ...prev, location: locationName }));
                } catch (error) {
                    console.error('Error getting location name:', error);
                    // Fallback to coordinates if geocoding fails
                    setFormData(prev => ({
                        ...prev,
                        location: `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`
                    }));
                }
            }, (error) => {
                console.error("Error getting location:", error);
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let photoURL = formData.photoURL;
            if (file) {
                const storageRef = ref(storage, `profile_photos/${currentUser.uid}`);
                await uploadBytes(storageRef, file);
                photoURL = await getDownloadURL(storageRef);
            }

            const age = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : null;

            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                fullName: formData.fullName,
                phone: formData.phone,
                countryCode: formData.countryCode,
                location: formData.location,
                photoURL,
                dateOfBirth: formData.dateOfBirth,
                age: age,
                updatedAt: new Date().toISOString()
            });

            // Update local state
            setFormData(prev => ({ ...prev, photoURL }));
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error updating profile:", error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleManageSubscription = () => {
        window.location.href = '/pricing';
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            try {
                const token = await currentUser.getIdToken();
                await axios.delete(`http://localhost:3000/api/users/${currentUser.uid}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                await logout();
                window.location.href = '/';
            } catch (error) {
                console.error("Error deleting account:", error);
                alert('Failed to delete account. Please try again.');
            }
        }
    };

    const handleDeleteQuote = async (quoteId) => {
        if (window.confirm("Are you sure you want to delete this saved quote?")) {
            try {
                const token = await currentUser.getIdToken();
                await axios.delete(`http://localhost:3000/api/quotes/${quoteId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Remove from local state
                setSavedQuotes(prev => prev.filter(q => q.id !== quoteId));
                alert('Quote deleted successfully!');
            } catch (error) {
                console.error("Error deleting quote:", error);
                alert("Failed to delete quote. Please try again.");
            }
        }
    };

    const handleContactVendor = (type, quote) => {
        if (type === 'email') {
            const subject = encodeURIComponent(`Inquiry about ${quote.productName}`);
            const body = encodeURIComponent(`Hi,\n\nI am interested in learning more about your ${quote.productName} policy.\n\nBest regards`);
            window.location.href = `mailto:${quote.vendorEmail}?subject=${subject}&body=${body}`;
        } else if (type === 'whatsapp') {
            const message = encodeURIComponent(`Hi, I am interested in learning more about your ${quote.productName} policy.`);
            const phone = quote.vendorPhone?.replace(/[^0-9]/g, ''); // Remove non-numeric characters
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        }
    };

    const handleLinkPhone = async () => {
        if (!formData.phone) {
            alert("Please enter a phone number in your profile first.");
            setIsEditing(true);
            return;
        }

        // Sanitize and format phone number
        let phoneNumber = formData.phone.trim();

        // Remove all non-digit characters except the leading +
        phoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');

        // If phone already starts with +, use it as-is (it's already in E.164 format)
        let fullPhone;
        if (phoneNumber.startsWith('+')) {
            fullPhone = phoneNumber;
        } else {
            // Remove leading zeros
            phoneNumber = phoneNumber.replace(/^0+/, '');

            // Add country code
            let countryCode = formData.countryCode;
            if (!countryCode.startsWith('+')) {
                countryCode = '+' + countryCode;
            }

            fullPhone = `${countryCode}${phoneNumber}`;
        }

        console.log('Attempting to link phone:', fullPhone); // Debug log

        setPhoneToLink(fullPhone);
        setLinkingPhone(true);

        try {
            const confirmationResult = await linkPhoneNumber(fullPhone);
            setVerificationId(confirmationResult);
            setOtpSent(true);
            alert("OTP sent to your phone.");
        } catch (error) {
            console.error("Error sending OTP:", error);
            alert("Failed to send OTP. Please check your phone number format. Expected format: +26771234567");
            setLinkingPhone(false);
        }
    };

    const handleVerifyPhone = async () => {
        if (!verificationId || !otp) return;

        try {
            await verificationId.confirm(otp);
            alert("Phone number linked successfully!");
            setLinkingPhone(false);
            setOtpSent(false);
            setOtp('');
        } catch (error) {
            console.error("Error verifying OTP:", error);
            alert("Invalid OTP. Please try again.");
        }
    };

    // Render Logic
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Header Section */}
                    <div className="px-4 py-5 sm:px-6 bg-primary text-white flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-white">User Profile</h3>
                            <p className="mt-1 max-w-2xl text-sm text-blue-100">Personal details and application settings.</p>
                        </div>
                        <img
                            className="h-16 w-16 rounded-full border-4 border-white object-cover"
                            src={formData.photoURL || "https://via.placeholder.com/150"}
                            alt={formData.fullName}
                        />
                    </div>

                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* ... form fields ... */}
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
                                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        id="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    />
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
                                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.dateOfBirth || 'Not set'}</dd>
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

                                {/* Security Section */}
                                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Security</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Linked Providers</p>
                                                <div className="mt-1 flex space-x-2">
                                                    {currentUser.providerData.map(provider => (
                                                        <span key={provider.providerId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                            {provider.providerId.replace('.com', '')}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                {!currentUser.providerData.some(p => p.providerId === 'phone') && (
                                                    !linkingPhone ? (
                                                        <button
                                                            onClick={handleLinkPhone}
                                                            className="text-primary hover:text-blue-700 font-medium text-sm"
                                                        >
                                                            Link Phone Number
                                                        </button>
                                                    ) : (
                                                        <div className="flex flex-col space-y-2">
                                                            {otpSent ? (
                                                                <div className="flex space-x-2">
                                                                    <input
                                                                        type="text"
                                                                        value={otp}
                                                                        onChange={(e) => setOtp(e.target.value)}
                                                                        placeholder="Enter OTP"
                                                                        className="shadow-sm focus:ring-primary focus:border-primary block w-24 sm:text-sm border-gray-300 rounded-md"
                                                                    />
                                                                    <button
                                                                        onClick={handleVerifyPhone}
                                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                                    >
                                                                        Verify
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-gray-500">Sending OTP...</span>
                                                            )}
                                                            <button
                                                                onClick={() => setLinkingPhone(false)}
                                                                className="text-xs text-red-600 hover:text-red-800 text-right"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
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
                    </div >
                </div >

                {/* Saved Quotes Section */}
                < div className="bg-white rounded-lg shadow overflow-hidden" >
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Saved Quotes</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Policies you have saved for later.</p>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        {loadingQuotes ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="border rounded-lg p-4 shadow-sm">
                                        <div className="flex justify-between mb-2">
                                            <Skeleton width="60%" height="1.5rem" />
                                            <Skeleton width="20%" height="1.5rem" borderRadius="16px" />
                                        </div>
                                        <Skeleton width="40%" height="1rem" className="mb-4" />
                                        <Skeleton width="50%" height="2rem" className="mb-2" />
                                        <Skeleton width="30%" height="1rem" />
                                    </div>
                                ))}
                            </div>
                        ) : savedQuotes.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>You haven't saved any quotes yet.</p>
                                <a href="/quiz" className="mt-2 inline-block text-primary hover:underline">Get a recommendation</a>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {savedQuotes.map((quote) => (
                                    <div key={quote.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{quote.productName}</h4>
                                                <p className="text-sm text-gray-500">{quote.vendorName}</p>
                                            </div>
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                                {quote.score}% Match
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            <span className="text-2xl font-bold text-gray-900">{quote.currency} {quote.premium}</span>
                                            <span className="text-sm text-gray-500">/{quote.frequency?.toLowerCase()}</span>
                                        </div>
                                        <div className="mt-4 text-xs text-gray-400">
                                            Saved on {new Date(quote.savedAt).toLocaleDateString()}
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => handleContactVendor('email', quote)}
                                                disabled={!quote.vendorEmail}
                                                className="flex-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Email
                                            </button>
                                            <button
                                                onClick={() => handleContactVendor('whatsapp', quote)}
                                                disabled={!quote.vendorPhone}
                                                className="flex-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                WhatsApp
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuote(quote.id)}
                                                className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200 hover:bg-red-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div >
            </div >
            {/* Permanent reCAPTCHA container for phone linking */}
            <div id="recaptcha-container"></div>
        </div >
    );
};

export default Profile;
