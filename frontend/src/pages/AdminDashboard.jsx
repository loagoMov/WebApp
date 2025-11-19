import React from 'react';

const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-gray-800 text-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <h1 className="text-2xl font-bold">CoverBots Admin</h1>
                        <button className="text-sm text-gray-300 hover:text-white">Logout</button>
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
