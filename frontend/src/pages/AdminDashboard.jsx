import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AdminDashboard = () => {
    const { user, logout } = useAuth0();

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-gray-800 text-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold mr-4">CoverBots Admin</h1>
                            <span className="text-xs bg-red-900 text-red-200 px-2 py-1 rounded">Restricted</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-300">{user?.email}</span>
                            <button
                                onClick={() => logout({ logoutParams: { returnTo: window.location.origin + '/admin/login' } })}
                                className="text-sm text-gray-300 hover:text-white border border-gray-600 px-3 py-1 rounded hover:bg-gray-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    {/* Stats Cards */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Vendors</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">12</dd>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Active Leads</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">48</dd>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">BWP 12.5k</dd>
                        </div>
                    </div>
                </div>

                <h2 className="text-lg font-medium text-gray-900 mb-4">Pending Approvals</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        <li className="px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">New Vendor: SafeGuard Insure</p>
                                <p className="text-sm text-gray-500">Submitted: 2 hours ago</p>
                            </div>
                            <div className="flex space-x-3">
                                <button className="text-green-600 hover:text-green-900 text-sm font-medium">Approve</button>
                                <button className="text-red-600 hover:text-red-900 text-sm font-medium">Reject</button>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
