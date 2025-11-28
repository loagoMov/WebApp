import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

const BecomeVendorPage = () => {
    const { currentUser, loading } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        companyName: '',
        taxId: '',
        address: '',
        contactPerson: '',
        phone: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        if (!currentUser) {
            navigate('/login', { state: { returnTo: '/vendor/apply' } });
            return;
        }

        try {
            // Update user document in Firestore with vendor application
            const userRef = doc(db, 'users', currentUser.uid);

            await updateDoc(userRef, {
                role: 'vendor',
                status: 'pending', // This is the key field admin dashboard looks for!
                companyName: formData.companyName,
                taxId: formData.taxId,
                fullName: formData.contactPerson,
                phone: formData.phone,
                location: formData.address,
                updatedAt: new Date().toISOString(),
                appliedAt: new Date().toISOString()
            });

            // Send email notification to admins
            try {
                await fetch('http://localhost:3000/api/users/notify-vendor-application', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        vendorData: {
                            userId: currentUser.uid,
                            email: currentUser.email,
                            fullName: formData.contactPerson,
                            companyName: formData.companyName,
                            phone: formData.phone,
                            createdAt: new Date().toISOString()
                        }
                    })
                });
            } catch (emailError) {
                console.error('Failed to send email notification:', emailError);
                // Don't fail the whole application if email fails
            }

            alert('Application submitted successfully! You will be notified once approved.');
            navigate('/');

        } catch (err) {
            console.error("Error applying for vendor:", err);

            // If updateDoc fails (document doesn't exist), try setDoc
            if (err.code === 'not-found') {
                try {
                    const userRef = doc(db, 'users', currentUser.uid);
                    await setDoc(userRef, {
                        email: currentUser.email,
                        role: 'vendor',
                        status: 'pending',
                        companyName: formData.companyName,
                        taxId: formData.taxId,
                        fullName: formData.contactPerson,
                        phone: formData.phone,
                        location: formData.address,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        appliedAt: new Date().toISOString()
                    });

                    // Send email notification to admins
                    try {
                        await fetch('http://localhost:3000/api/users/notify-vendor-application', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                vendorData: {
                                    userId: currentUser.uid,
                                    email: currentUser.email,
                                    fullName: formData.contactPerson,
                                    companyName: formData.companyName,
                                    phone: formData.phone,
                                    createdAt: new Date().toISOString()
                                }
                            })
                        });
                    } catch (emailError) {
                        console.error('Failed to send email notification:', emailError);
                    }

                    alert('Application submitted successfully! You will be notified once approved.');
                    navigate('/');
                } catch (setErr) {
                    console.error("Error creating vendor application:", setErr);
                    setError('Failed to submit application. Please try again.');
                }
            } else {
                setError('Failed to submit application. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F1E6] dark:bg-[#003366] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Apply to Become a Vendor
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Expand your business with CoverBots
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-[#002244] py-8 px-4 shadow sm:rounded-lg sm:px-10 transition-colors duration-300">
                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                                Company Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="companyName"
                                    name="companyName"
                                    type="text"
                                    required
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                                Tax ID / Registration Number
                            </label>
                            <div className="mt-1">
                                <input
                                    id="taxId"
                                    name="taxId"
                                    type="text"
                                    required
                                    value={formData.taxId}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                                Contact Person
                            </label>
                            <div className="mt-1">
                                <input
                                    id="contactPerson"
                                    name="contactPerson"
                                    type="text"
                                    required
                                    value={formData.contactPerson}
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
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Business Address
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="address"
                                    name="address"
                                    rows="3"
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting || loading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BecomeVendorPage;
