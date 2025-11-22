import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { db } from '../config/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

const AdminDashboard = () => {
    const { user, logout } = useAuth0();
    const [activeTab, setActiveTab] = useState('overview');
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchTransactions();
        }
    }, [activeTab]);

    const fetchTransactions = async () => {
        setLoadingTransactions(true);
        try {
            const q = query(collection(db, 'payments'), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            const txs = [];
            querySnapshot.forEach((doc) => {
                txs.push({ id: doc.id, ...doc.data() });
            });
            setTransactions(txs);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoadingTransactions(false);
        }
    };

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
                            {/* Tabs */}
                            <nav className="flex space-x-4">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'overview' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('transactions')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'transactions' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                >
                                    Transactions
                                </button>
                            </nav>
                            <span className="text-sm text-gray-300 border-l border-gray-600 pl-4">{user?.email}</span>
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
                {activeTab === 'overview' && (
                    <>
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
                    </>
                )}

                {activeTab === 'transactions' && (
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Transaction History</h2>
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            {loadingTransactions ? (
                                <div className="p-6 text-center">Loading transactions...</div>
                            ) : transactions.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">No transactions found.</div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {tx.timestamp ? new Date(tx.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {tx.userId} <span className="text-xs text-gray-500">({tx.userType})</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                    {tx.tier?.replace('vendor_', '').replace('user_', '')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {tx.currency} {tx.amount}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {tx.transactionToken?.substring(0, 8)}...
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
