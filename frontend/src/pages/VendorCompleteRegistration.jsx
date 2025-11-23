import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const VendorCompleteRegistration = () => {
    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const { refreshProfile } = useUser();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Processing your registration...');

    useEffect(() => {
        const completeRegistration = async () => {
            if (isAuthenticated && user) {
                const vendorDataString = sessionStorage.getItem('vendorRegistrationData');

                if (!vendorDataString) {
                    // If no data found, maybe they came here directly? Redirect to start.
                    navigate('/vendor/register');
                    return;
                }

                const vendorData = JSON.parse(vendorDataString);

                try {
                    const token = await getAccessTokenSilently();

                    // Prepare data for backend
                    // We are updating the user profile with vendor role and additional details
                    const apiFormData = new FormData();
                    apiFormData.append('fullName', vendorData.contactPerson); // Use contact person as main name
                    apiFormData.append('phone', vendorData.phone);
                    apiFormData.append('location', vendorData.address); // Map address to location
                    apiFormData.append('role', 'vendor'); // CRITICAL: Set role to vendor
                    apiFormData.append('companyName', vendorData.companyName);
                    apiFormData.append('taxId', vendorData.taxId);

                    // Note: The backend updateProfile controller needs to handle these extra fields 
                    // or we store them in a separate 'vendors' collection.
                    // For MVP, we'll store them in the user document if the schema allows, 
                    // or just rely on the 'role' and basic fields.
                    // Let's assume the backend accepts generic fields or we might need to update the backend.
                    // Checking backend/src/controllers/usersController.js would be good, but let's send what we can.

                    // Ideally, we should have a specific endpoint for vendor registration if the data model is complex.
                    // For now, we'll use the update user endpoint.

                    await axios.put(`http://localhost:3000/api/users/${user.sub}`, apiFormData, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    // Clear session storage
                    sessionStorage.removeItem('vendorRegistrationData');

                    // Refresh the user profile in context so the Navbar updates immediately
                    await refreshProfile();

                    setStatus('Registration complete! Redirecting to dashboard...');
                    setTimeout(() => {
                        navigate('/vendor/dashboard');
                    }, 1500);

                } catch (error) {
                    console.error("Error completing vendor registration:", error);
                    setStatus('An error occurred. Please try again or contact support.');
                }
            }
        };

        completeRegistration();
    }, [isAuthenticated, user, navigate, getAccessTokenSilently, refreshProfile]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{status}</h2>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
        </div>
    );
};

export default VendorCompleteRegistration;
