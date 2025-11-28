import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const { currentUser, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect non-logged-in users to login page
        if (!loading && !currentUser) {
            navigate('/login', { state: { returnTo: '/admin' } });
        }
    }, [currentUser, loading, navigate]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (currentUser) {
        return <Navigate to="/admin" replace />;
    }

    return null; // Will redirect via useEffect
};

export default AdminLogin;
