import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';
import { db, storage } from '../config/firebase';
import { doc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import BidForm from '../components/BidForm';
import { Chart } from 'primereact/chart';
import { Toast } from 'primereact/toast';

import { useUser } from '../context/UserContext';

const VendorDashboard = () => {
    const { currentUser, logout } = useAuth();
    const { userProfile } = useUser();
    const [activeTab, setActiveTab] = useState('products');
    const [subscription, setSubscription] = useState({ tier: 'free', status: 'inactive' });
    const toast = useRef(null);
    const [vendorStatus, setVendorStatus] = useState(userProfile?.status || 'pending');

    useEffect(() => {
        if (currentUser) {
            // Real-time listener for vendor status
            const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    const newStatus = data.status;

                    // Check if status changed from pending to approved
                    if (vendorStatus === 'pending' && newStatus === 'approved') {
                        toast.current.show({ severity: 'success', summary: 'Approved!', detail: 'Your vendor account has been approved. You can now publish active products.', life: 5000 });
                    }
                    setVendorStatus(newStatus);
                }
            });

            // Fetch subscription status
            fetch(`http://localhost:3000/api/subscriptions/status/${currentUser.uid}?type=vendor`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.tier) {
                        setSubscription(data);
                    } else {
                        // Keep default free tier
                    }
                })
                .catch(err => console.error('Error fetching subscription:', err));

            return () => unsubscribe();
        }
    }, [currentUser, vendorStatus]);

    const [products, setProducts] = useState([]);
    const [leads, setLeads] = useState([
        { id: 1, customer: 'Kabo D.', interest: 'Car Insurance', date: '2023-10-25', status: 'New' },
        { id: 2, customer: 'Tshepo M.', interest: 'Life Insurance', date: '2023-10-24', status: 'Contacted' },
    ]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);



    // Bidding State
    const [bids, setBids] = useState([]);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);

    // Fetch products and bids from Firestore
    useEffect(() => {
        const fetchData = async () => {
            if (currentUser) {
                try {
                    // Fetch Products
                    const qProducts = query(collection(db, 'insurance_products'), where('vendorId', '==', currentUser.uid));
                    const productsSnap = await getDocs(qProducts);
                    const productsList = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setProducts(productsList);

                    // Fetch Bids
                    const qBids = query(collection(db, 'bids'), where('vendorId', '==', currentUser.uid));
                    const bidsSnap = await getDocs(qBids);
                    const bidsList = bidsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setBids(bidsList);
                } catch (error) {
                    console.error("Error fetching data:", error);
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load dashboard data.' });
                }
            }
        };

        fetchData();
    }, [currentUser]);

    const openAddModal = () => {
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const openBidModal = () => {
        // Check Subscription Limits
        const tier = subscription.tier || 'free';
        const activeBidsCount = bids.filter(b => b.status === 'active' || b.status === 'pending').length;

        let limit = 0;
        if (tier === 'vendor_basic') limit = 5;
        else if (tier === 'vendor_pro') limit = 9999;

        if (activeBidsCount >= limit) {
            toast.current.show({
                severity: 'warn',
                summary: 'Limit Reached',
                detail: `You have reached your bid limit for the ${tier} plan. Upgrade to place more bids.`
            });
            return;
        }

        setIsBidModalOpen(true);
    };

    const handlePlaceBid = async (bidData) => {
        try {
            const newBid = {
                ...bidData,
                vendorId: currentUser.uid,
                vendorName: userProfile?.companyName || currentUser.email,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, 'bids'), newBid);
            setBids([...bids, { ...newBid, id: docRef.id }]);

            setIsBidModalOpen(false);
            toast.current.show({ severity: 'success', summary: 'Bid Placed', detail: 'Your bid has been submitted for approval.' });
        } catch (error) {
            console.error("Error placing bid:", error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to place bid.' });
        }
    };

    const closeModal = () => {
        setIsProductModalOpen(false);
        setEditingProduct(null);
    };

    const handleSaveProduct = async (productData) => {
        try {
            let policyUrl = productData.policyUrl || '';
            let policyFileName = productData.policyFileName || '';

            // 1. If there's a new policy file, upload it to Storage & AI Service
            if (productData.policyFile) {
                const file = productData.policyFile;
                const storageRef = ref(storage, `vendors/${currentUser.uid}/policies/${file.name}`);

                // Upload to Firebase Storage
                const snapshot = await uploadBytes(storageRef, file);
                policyUrl = await getDownloadURL(snapshot.ref);
                policyFileName = file.name;

                // Upload to AI Service
                const formData = new FormData();
                formData.append('file', file);
                formData.append('vendorId', currentUser.uid);

                try {
                    const uploadRes = await fetch('http://localhost:3000/api/upload-policy', {
                        method: 'POST',
                        body: formData
                    });

                    if (uploadRes.ok) {
                        toast.current.show({ severity: 'success', summary: 'Policy Processed', detail: 'AI ingestion successful.' });
                    } else {
                        console.warn("AI ingestion failed");
                    }
                } catch (aiError) {
                    console.error("AI Service upload error:", aiError);
                }
            } else if (productData.policyFile === null) {
                // Explicitly removed
                policyUrl = '';
                policyFileName = '';
            }

            // 2. Save product to Firestore
            const { policyFile, ...cleanProductData } = productData;
            const finalProductData = {
                ...cleanProductData,
                policyUrl,
                policyFileName
            };

            if (editingProduct) {
                const productRef = doc(db, 'insurance_products', editingProduct.id);
                await updateDoc(productRef, finalProductData);

                setProducts(products.map(p => p.id === editingProduct.id ? { ...finalProductData, id: p.id } : p));
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Product updated successfully.' });
            } else {
                const newProductData = {
                    ...finalProductData,
                    vendorId: currentUser.uid,
                    createdAt: new Date().toISOString()
                };
                const docRef = await addDoc(collection(db, 'insurance_products'), newProductData);

                setProducts([...products, { ...newProductData, id: docRef.id }]);
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Product created successfully.' });
            }
            closeModal();
        } catch (error) {
            console.error("Error saving product:", error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to save product.' });
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteDoc(doc(db, 'insurance_products', productId));
                setProducts(products.filter(p => p.id !== productId));
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Product deleted successfully.' });
            } catch (error) {
                console.error("Error deleting product:", error);
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete product.' });
            }
        }
    };

    if (!currentUser) {
        return <Navigate to="/vendor/login" replace />;
    }

    const isPending = vendorStatus === 'pending';

    const handleResendApplication = async () => {
        try {
            const token = await currentUser.getIdToken();

            await fetch('http://localhost:3000/api/users/notify-vendor-application', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    vendorData: {
                        userId: currentUser.uid,
                        email: currentUser.email,
                        fullName: userProfile?.fullName || '',
                        companyName: userProfile?.companyName || '',
                        phone: userProfile?.phone || '',
                        createdAt: userProfile?.appliedAt || new Date().toISOString()
                    }
                })
            });
            toast.current.show({ severity: 'success', summary: 'Notification Sent', detail: 'Admin has been notified of your application.' });
        } catch (error) {
            console.error('Failed to resend application:', error);
            toast.current.show({ severity: 'error', summary: 'Failed', detail: 'Could not send notification. Please try again.' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Toast ref={toast} />
            {isPending && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 fixed top-20 right-4 z-50 shadow-lg max-w-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm text-yellow-700">
                                Your account is awaiting approval. You can draft products but they won't be visible to users until approved.
                            </p>
                            <button
                                onClick={handleResendApplication}
                                className="mt-2 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium px-3 py-1 rounded border border-yellow-300 transition-colors"
                            >
                                📧 Resend Notification to Admin
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Vendor Portal</h1>
                        <div className="flex items-center">
                            <Link to="/profile" className="text-gray-500 mr-4 hover:text-gray-900 flex items-center">
                                <span className="mr-2">{currentUser.email}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </Link>
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${subscription.tier.includes('gold') ? 'bg-yellow-100 text-yellow-800' : subscription.tier.includes('silver') ? 'bg-gray-100 text-gray-800' : 'bg-orange-100 text-orange-800'}`}>
                                {(subscription.schemaTier || subscription.tier.replace('vendor_', '')).toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Leads</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{leads.length}</dd>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Active Products</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{products.filter(p => p.status === 'Active').length}</dd>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Profile Views</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">124</dd>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-4 mb-8 border-b border-gray-200">
                    {['products', 'leads', 'bids', 'settings'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-2 text-sm font-medium capitalize ${activeTab === tab
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                {activeTab === 'settings' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription Settings</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Current Plan</h3>
                                <div className="mt-2 flex items-center">
                                    <span className="text-2xl font-bold text-gray-900 capitalize">
                                        {subscription.schemaTier || subscription.tier.replace('vendor_', '')}
                                    </span>
                                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {subscription.status}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    {subscription.tier === 'free' ? 'Basic access with limited product listings.' : 'Premium access with enhanced features.'}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Usage</h3>
                                <dl className="mt-2 divide-y divide-gray-200">
                                    <div className="py-2 flex justify-between text-sm">
                                        <dt className="text-gray-500">Products Listed</dt>
                                        <dd className="font-medium text-gray-900">{products.length} / {subscription.limits?.products || 3}</dd>
                                    </div>
                                    <div className="py-2 flex justify-between text-sm">
                                        <dt className="text-gray-500">Bidding Access</dt>
                                        <dd className="font-medium text-gray-900">{subscription.limits?.bidding ? 'Enabled' : 'Disabled'}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Available Plans</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {['vendor_bronze', 'vendor_silver', 'vendor_gold'].map((tier) => (
                                    <div key={tier} className={`border rounded-lg p-4 ${subscription.tier === tier ? 'border-primary ring-1 ring-primary' : 'border-gray-200'}`}>
                                        <h4 className="font-bold text-gray-900 capitalize">{tier.replace('vendor_', '')}</h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {tier === 'vendor_bronze' ? 'BWP 450/mo' : tier === 'vendor_silver' ? 'BWP 850/mo' : 'BWP 1500/mo'}
                                        </p>
                                        <button
                                            onClick={() => {
                                                // Initiate DPO Payment
                                                fetch('http://localhost:3000/api/subscriptions/initiate-payment', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        // 'Authorization': `Bearer ${token}` // Add token if needed
                                                    },
                                                    body: JSON.stringify({
                                                        tier: tier,
                                                        userId: currentUser.uid,
                                                        userType: 'vendor',
                                                        redirectUrl: window.location.href,
                                                        backUrl: window.location.href
                                                    })
                                                })
                                                    .then(res => res.json())
                                                    .then(data => {
                                                        if (data.paymentUrl) window.location.href = data.paymentUrl;
                                                        else alert('Failed to initiate payment');
                                                    })
                                                    .catch(err => console.error('Payment Error:', err));
                                            }}
                                            disabled={subscription.tier === tier}
                                            className={`mt-4 w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${subscription.tier === tier ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-700'}`}
                                        >
                                            {subscription.tier === tier ? 'Current Plan' : 'Upgrade'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'products' && (
                    <div>
                        <div className="flex justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-900">My Products</h2>
                            {subscription.limits && products.length >= subscription.limits.products ? (
                                <div className="flex items-center">
                                    <span className="text-sm text-red-500 mr-4">Product limit reached ({subscription.limits.products})</span>
                                    <a href="/vendor/pricing" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
                                        Upgrade Plan
                                    </a>
                                </div>
                            ) : (
                                <button
                                    onClick={openAddModal}
                                    disabled={isPending}
                                    className={`px-4 py-2 rounded-md text-sm ${isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-700'} text-white`}
                                    title={isPending ? "Account pending approval" : "Add new product"}
                                >
                                    + Add Product
                                </button>
                            )}
                        </div>
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {products.map((product) => (
                                    <li key={product.id} className="px-6 py-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-primary truncate">{product.name}</p>
                                            <p className="text-sm text-gray-500">{product.category} | BWP {product.premium}/mo</p>
                                        </div>
                                        <div className="flex items-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {product.status}
                                            </span>
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="ml-4 text-gray-400 hover:text-gray-500"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="ml-4 text-red-400 hover:text-red-500"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'leads' && (
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Leads</h2>
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {leads.map((lead) => (
                                    <li key={lead.id} className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{lead.customer}</p>
                                                <p className="text-sm text-gray-500">Interested in: {lead.interest}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">{lead.date}</p>
                                                <span className="text-xs font-medium text-blue-600">{lead.status}</span>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex space-x-2">
                                            <button className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">WhatsApp</button>
                                            <button className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded border border-gray-200">Email</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'bids' && (
                    <div>
                        <div className="flex justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-900">My Bids</h2>
                            <button
                                onClick={openBidModal}
                                className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                            >
                                + Place Bid
                            </button>
                        </div>
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            {bids.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">No bids placed yet.</div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (BWP)</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {bids.map((bid) => (
                                            <tr key={bid.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bid.productName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bid.bidAmount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bid.duration} Days</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bid.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {bid.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {bid.createdAt ? new Date(bid.createdAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Analytics</h2>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{products.length}</dd>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Leads</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{leads.length}</dd>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Bids</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{bids.filter(b => b.status === 'active').length}</dd>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Est. Revenue</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">BWP {leads.length * 50}</dd>
                                    <p className="text-xs text-gray-400 mt-2">Based on avg lead value</p>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Conversion Funnel</h3>
                                <div className="h-64 flex justify-center">
                                    <Chart type="bar" data={{
                                        labels: ['Views', 'Quotes', 'Leads'],
                                        datasets: [{
                                            label: 'Funnel',
                                            backgroundColor: '#42A5F5',
                                            data: [products.length * 50, products.length * 10, leads.length] // Mock data based on products
                                        }]
                                    }} options={{ maintainAspectRatio: false }} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Categories</h3>
                                <div className="h-64 flex justify-center">
                                    <Chart type="pie" data={{
                                        labels: [...new Set(products.map(p => p.category))],
                                        datasets: [{
                                            data: [...new Set(products.map(p => p.category))].map(cat => products.filter(p => p.category === cat).length),
                                            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
                                        }]
                                    }} options={{ maintainAspectRatio: false }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isProductModalOpen}
                onClose={closeModal}
                title={editingProduct ? "Edit Product" : "Add New Product"}
            >
                {/* Key ensures form resets when switching between add/edit or different products */}
                <ProductForm
                    key={editingProduct ? editingProduct.id : 'new'}
                    initialData={editingProduct}
                    onSubmit={handleSaveProduct}
                    onCancel={closeModal}
                />
            </Modal>

            <Modal
                isOpen={isBidModalOpen}
                onClose={() => setIsBidModalOpen(false)}
                title="Place a Bid"
            >
                <BidForm
                    products={products}
                    onSubmit={handlePlaceBid}
                    onCancel={() => setIsBidModalOpen(false)}
                />
            </Modal>
        </div >
    );
};

export default VendorDashboard;
