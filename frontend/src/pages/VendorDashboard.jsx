import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';
import { db } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
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

    const [products, setProducts] = useState([
        { id: 1, name: 'Comprehensive Car Cover', category: 'Auto Insurance', premium: 450, status: 'Active' },
        { id: 2, name: 'Home Contents Basic', category: 'Home Insurance', premium: 200, status: 'Active' },
    ]);
    const [leads, setLeads] = useState([
        { id: 1, customer: 'Kabo D.', interest: 'Car Insurance', date: '2023-10-25', status: 'New' },
        { id: 2, customer: 'Tshepo M.', interest: 'Life Insurance', date: '2023-10-24', status: 'Contacted' },
    ]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const openAddModal = () => {
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const closeModal = () => {
        setIsProductModalOpen(false);
        setEditingProduct(null);
    };

    const handleSaveProduct = (productData) => {
        if (editingProduct) {
            setProducts(products.map(p => p.id === editingProduct.id ? { ...productData, id: p.id } : p));
        } else {
            setProducts([...products, { ...productData, id: products.length + 1, status: 'Active' }]);
        }
        closeModal();
    };

    if (!currentUser) {
        return <Navigate to="/vendor/login" replace />;
    }

    const isPending = vendorStatus === 'pending';

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
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Your account is awaiting approval. You can draft products but they won't be visible to users until approved.
                            </p>
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
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Bidding Dashboard</h3>
                        <p className="text-gray-500 mt-2">Manage your bids for premium placement.</p>
                        <button className="mt-4 bg-primary text-white px-4 py-2 rounded-md text-sm">Create New Bid</button>
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
        </div >
    );
};

export default VendorDashboard;
