import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, orderBy, getDocs, where, onSnapshot } from 'firebase/firestore';
import Modal from '../components/Modal';
import { getDashboardStats } from '../services/analytics';
import { Chart } from 'primereact/chart';
import { Toast } from 'primereact/toast';

const AdminDashboard = () => {
    const { currentUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [pendingVendors, setPendingVendors] = useState([]);
    const [loadingVendors, setLoadingVendors] = useState(false);
    const [expandedCard, setExpandedCard] = useState(null);
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const toast = useRef(null);

    // CAC/LTV Calculator State
    const [marketingSpend, setMarketingSpend] = useState(1000);
    const [cac, setCac] = useState(0);
    const [ltv, setLtv] = useState(0);

    const [bids, setBids] = useState([
        { id: 1, vendor: 'AutoSure', amount: 500, status: 'pending', placement: 'Top Banner' },
        { id: 2, vendor: 'HomeGuard', amount: 300, status: 'approved', placement: 'Sidebar' }
    ]);

    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchTransactions();
        } else if (activeTab === 'overview') {
            // fetchPendingVendors(); // Handled by real-time listener
            fetchStats();
        }
    }, [activeTab]);

    useEffect(() => {
        if (stats && stats.newUsersCount > 0) {
            const calculatedCac = marketingSpend / stats.newUsersCount;
            setCac(calculatedCac.toFixed(2));

            // Simple LTV assumption: Avg Lead Value (50) * Avg Leads per User (0.5) * 12 months (Retention)
            // This is a placeholder model.
            const avgLeadValue = 50;
            const avgLeadsPerUser = stats.funnel.leads / (stats.newUsersCount || 1);
            const retention = 12;
            const calculatedLtv = avgLeadValue * avgLeadsPerUser * retention;
            setLtv(calculatedLtv.toFixed(2));
        }
    }, [marketingSpend, stats]);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const token = await currentUser.getIdToken();
            const data = await getDashboardStats(token);
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoadingStats(false);
        }
    };

    // Ref to track if initial load is done
    const isInitialLoad = useRef(true);

    useEffect(() => {
        if (activeTab === 'overview') {
            setLoadingVendors(true); // Added this back for initial loading state
            const q = query(
                collection(db, 'users'),
                where('role', '==', 'vendor'),
                where('status', '==', 'pending')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const vendors = [];
                snapshot.forEach((doc) => {
                    vendors.push({ id: doc.id, ...doc.data() });
                });

                if (!isInitialLoad.current) {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === "added") {
                            toast.current.show({ severity: 'info', summary: 'New Application', detail: 'A new vendor has registered.', life: 5000 });
                        }
                    });
                } else {
                    isInitialLoad.current = false;
                }

                setPendingVendors(vendors);
                setLoadingVendors(false);
            }, (error) => { // Added error handling for onSnapshot
                console.error("Error listening to pending vendors:", error);
                setLoadingVendors(false);
            });

            return () => unsubscribe();
        }
    }, [activeTab]);

    // Removed manual fetchPendingVendors as we now use real-time listener
    // const fetchPendingVendors = async () => { ... }

    const handleVendorAction = async (userId, status) => {
        try {
            const token = await currentUser.getIdToken();
            await fetch(`http://localhost:3000/api/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            // fetchPendingVendors(); // Real-time listener will update UI automatically
        } catch (error) {
            console.error(`Error ${status} vendor:`, error);
        }
    };

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

    // Chart Data
    const funnelChartData = {
        labels: ['Views', 'Quotes', 'Leads'],
        datasets: [
            {
                label: 'Conversion Funnel',
                backgroundColor: '#42A5F5',
                data: stats ? [stats.funnel.views, stats.funnel.quotes, stats.funnel.leads] : [0, 0, 0]
            }
        ]
    };

    const categoryChartData = {
        labels: stats ? stats.categoryStats.map(s => s.name) : [],
        datasets: [
            {
                data: stats ? stats.categoryStats.map(s => s.value) : [],
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF"
                ],
                hoverBackgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF"
                ]
            }
        ]
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Toast ref={toast} />
            <div className="bg-gray-800 text-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center">
                            <img className="h-8 w-auto mr-3" src="/logo.png" alt="CoverBots Logo" />
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
                                <button
                                    onClick={() => setActiveTab('bids')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'bids' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                >
                                    Bids
                                </button>
                            </nav>
                            <span className="text-sm text-gray-300 border-l border-gray-600 pl-4">{currentUser?.email}</span>
                            <button
                                onClick={() => logout()}
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
                        {/* Analytics Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Funnel</h3>
                                <div className="h-64 flex justify-center">
                                    <Chart type="bar" data={funnelChartData} options={{ maintainAspectRatio: false }} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Category Popularity</h3>
                                <div className="h-64 flex justify-center">
                                    <Chart type="pie" data={categoryChartData} options={{ maintainAspectRatio: false }} />
                                </div>
                            </div>
                        </div>

                        {/* CAC/LTV Calculator */}
                        <div className="bg-white p-6 rounded-lg shadow mb-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Business Health Calculator</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Monthly Marketing Spend (BWP)</label>
                                    <input
                                        type="number"
                                        value={marketingSpend}
                                        onChange={(e) => setMarketingSpend(parseFloat(e.target.value))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                    />
                                </div>
                                <div className="bg-blue-50 p-4 rounded-md">
                                    <dt className="text-sm font-medium text-blue-800">Est. CAC (Cost Per Acquisition)</dt>
                                    <dd className="mt-1 text-2xl font-semibold text-blue-900">BWP {cac}</dd>
                                    <p className="text-xs text-blue-600 mt-1">Spend / New Users ({stats?.newUsersCount || 0})</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-md">
                                    <dt className="text-sm font-medium text-green-800">Est. LTV (Lifetime Value)</dt>
                                    <dd className="mt-1 text-2xl font-semibold text-green-900">BWP {ltv}</dd>
                                    <p className="text-xs text-green-600 mt-1">Based on avg lead value & retention</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                            {/* Stats Cards */}
                            <div onClick={() => setExpandedCard('vendors')} className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Vendors</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">12</dd>
                                    <p className="text-xs text-gray-400 mt-2">Click for analysis</p>
                                </div>
                            </div>
                            <div onClick={() => setExpandedCard('leads')} className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Leads</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">48</dd>
                                    <p className="text-xs text-gray-400 mt-2">Click for analysis</p>
                                </div>
                            </div>
                            <div onClick={() => setExpandedCard('revenue')} className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">BWP 12.5k</dd>
                                    <p className="text-xs text-gray-400 mt-2">Click for analysis</p>
                                </div>
                            </div>
                            <div onClick={() => setExpandedCard('recommendations')} className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Recommendations Made</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">156</dd>
                                    <p className="text-xs text-gray-400 mt-2">Click for analysis</p>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-lg font-medium text-gray-900 mb-4">Pending Approvals</h2>
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            {loadingVendors ? (
                                <div className="p-6 text-center">Loading pending vendors...</div>
                            ) : pendingVendors.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">No pending vendor requests.</div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {pendingVendors.map((vendor) => (
                                        <li key={vendor.id} className="px-6 py-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">New Vendor: {vendor.companyName || vendor.fullName || vendor.email}</p>
                                                <p className="text-sm text-gray-500">Email: {vendor.email}</p>
                                                <p className="text-sm text-gray-500">Submitted: {vendor.updatedAt ? new Date(vendor.updatedAt).toLocaleString() : 'N/A'}</p>
                                            </div>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => handleVendorAction(vendor.id, 'approved')}
                                                    className="text-green-600 hover:text-green-900 text-sm font-medium bg-green-50 px-3 py-1 rounded border border-green-200"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleVendorAction(vendor.id, 'rejected')}
                                                    className="text-red-600 hover:text-red-900 text-sm font-medium bg-red-50 px-3 py-1 rounded border border-red-200"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'bids' && (
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Bid Management</h2>
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (BWP)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placement</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bids.map((bid) => (
                                        <tr key={bid.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bid.vendor}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bid.amount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bid.placement}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bid.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {bid.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {bid.status === 'pending' && (
                                                    <>
                                                        <button className="text-green-600 hover:text-green-900 mr-4">Approve</button>
                                                        <button className="text-red-600 hover:text-red-900">Reject</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
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
            <Modal
                isOpen={!!expandedCard}
                onClose={() => setExpandedCard(null)}
                title={
                    expandedCard === 'vendors' ? 'Vendor Analysis' :
                        expandedCard === 'leads' ? 'Lead Generation Analysis' :
                            expandedCard === 'revenue' ? 'Revenue Breakdown' :
                                'Recommendation Insights'
                }
            >
                <div className="p-4">
                    <p className="text-gray-600 mb-4">Detailed analytics and charts for {expandedCard} would appear here.</p>
                    {/* Placeholder for charts */}
                    <div className="h-48 bg-gray-100 rounded flex items-end justify-around p-4">
                        <div className="w-8 bg-blue-500 h-1/3 rounded-t"></div>
                        <div className="w-8 bg-blue-500 h-1/2 rounded-t"></div>
                        <div className="w-8 bg-blue-500 h-2/3 rounded-t"></div>
                        <div className="w-8 bg-blue-500 h-full rounded-t"></div>
                        <div className="w-8 bg-blue-500 h-3/4 rounded-t"></div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                            <span className="block text-xs text-gray-500">Growth (MoM)</span>
                            <span className="block text-lg font-bold text-green-600">+12%</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <span className="block text-xs text-gray-500">Projection</span>
                            <span className="block text-lg font-bold text-blue-600">High</span>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
