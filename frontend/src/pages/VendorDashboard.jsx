import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const VendorDashboard = () => {
    const { user, isAuthenticated } = useAuth0();
    const [activeTab, setActiveTab] = useState('products');

    // Mock Data
    const products = [
        { id: 1, name: 'Standard Auto Cover', category: 'Auto', premium: 450, status: 'Active' },
        { id: 2, name: 'Premium Life Plan', category: 'Life', premium: 1200, status: 'Draft' },
    ];

    const leads = [
        { id: 1, customer: 'Kealeboga M.', interest: 'Standard Auto Cover', date: '2023-10-25', status: 'New' },
        { id: 2, customer: 'Tshepo K.', interest: 'Premium Life Plan', date: '2023-10-24', status: 'Contacted' },
    ];

    if (!isAuthenticated) {
        return <div className="p-10 text-center">Please log in to access the Vendor Dashboard.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Vendor Portal</h1>
                        <div className="flex items-center">
                            <span className="text-gray-500 mr-4">{user.email}</span>
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Verified</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
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

                {activeTab === 'products' && (
                    <div>
                        <div className="flex justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-900">My Products</h2>
                            <button className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                                + Add Product
                            </button>
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
                                            <button className="ml-4 text-gray-400 hover:text-gray-500">Edit</button>
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
        </div>
    );
};

export default VendorDashboard;
