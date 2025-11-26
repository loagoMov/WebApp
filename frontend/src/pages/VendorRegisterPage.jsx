import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Toast } from 'primereact/toast';

const VendorRegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const toast = useRef(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
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

        if (formData.password !== formData.confirmPassword) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Passwords do not match' });
            return;
        }

        setLoading(true);

        try {
            // 1. Create User in Firebase Auth
            const userCredential = await register(formData.email, formData.password);
            const user = userCredential.user;

            // 2. Create Vendor Profile in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: formData.email,
                role: 'vendor',
                status: 'pending', // Pending approval
                companyName: formData.companyName,
                taxId: formData.taxId,
                address: formData.address,
                contactPerson: formData.contactPerson,
                phone: formData.phone,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            // 3. Show Success Toast
            toast.current.show({ severity: 'success', summary: 'Application Sent', detail: 'Your vendor application has been submitted for approval.' });

            // 4. Redirect to Dashboard after a short delay
            setTimeout(() => {
                navigate('/vendor/dashboard');
            }, 2000);

        } catch (error) {
            console.error("Registration error:", error);
            toast.current.show({ severity: 'error', summary: 'Registration Failed', detail: error.message });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Toast ref={toast} />
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Become a Vendor
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Register your insurance company with CoverBots
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Account Info */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                            <div className="mt-1">
                                <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1">
                                <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <div className="mt-1">
                                <input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                        </div>

                        {/* Company Info */}
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                            <div className="mt-1">
                                <input id="companyName" name="companyName" type="text" required value={formData.companyName} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">Tax ID / Registration Number</label>
                            <div className="mt-1">
                                <input id="taxId" name="taxId" type="text" required value={formData.taxId} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Contact Person</label>
                            <div className="mt-1">
                                <input id="contactPerson" name="contactPerson" type="text" required value={formData.contactPerson} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <div className="mt-1">
                                <input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Business Address</label>
                            <div className="mt-1">
                                <textarea id="address" name="address" rows="3" required value={formData.address} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-gray-400' : 'bg-primary hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                            >
                                {loading ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VendorRegisterPage;
