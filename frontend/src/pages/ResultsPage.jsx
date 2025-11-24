import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { Toast } from 'primereact/toast';

const ResultsPage = () => {
    const location = useLocation();
    const { user, getAccessTokenSilently, isAuthenticated } = useAuth0();
    const [subscription, setSubscription] = useState(null);
    const [selectedForCompare, setSelectedForCompare] = useState([]);
    const [savingQuoteId, setSavingQuoteId] = useState(null);
    const toast = useRef(null);

    // Mock data if no state passed (for direct access)
    const recommendations = location.state?.recommendations || [
        {
            id: 1,
            vendorName: 'Botswana Life',
            productName: 'Isago Investment Plan',
            score: 95,
            premium: 450,
            currency: 'BWP',
            frequency: 'Monthly',
            tags: ['High Return', 'Flexible'],
            matchBreakdown: {
                budgetFit: 90,
                coverageMatch: 100,
                vendorRating: 95,
            }
        },
        {
            id: 2,
            vendorName: 'Hollard',
            productName: 'Comprehensive Auto',
            score: 88,
            premium: 600,
            currency: 'BWP',
            frequency: 'Monthly',
            tags: ['Roadside Assist', 'Low Excess'],
            matchBreakdown: {
                budgetFit: 85,
                coverageMatch: 90,
                vendorRating: 88,
            }
        },
        {
            id: 3,
            vendorName: 'Old Mutual',
            productName: 'Funeral Care',
            score: 82,
            premium: 120,
            currency: 'BWP',
            frequency: 'Monthly',
            tags: ['Family Cover', 'Quick Payout'],
            matchBreakdown: {
                budgetFit: 95,
                coverageMatch: 80,
                vendorRating: 90,
            }
        }
    ];

    useEffect(() => {
        const fetchSubscription = async () => {
            if (user) {
                try {
                    const response = await axios.get(`http://localhost:3000/api/subscriptions/status/${user.sub}`);
                    setSubscription(response.data);
                } catch (error) {
                    console.error('Error fetching subscription:', error);
                    // Fallback to free tier limits
                    setSubscription({ limits: { compare: 3, save: 5 } });
                }
            }
        };
        fetchSubscription();
    }, [user]);

    const handleCompareToggle = (product) => {
        const isSelected = selectedForCompare.find(p => p.id === product.id);
        if (isSelected) {
            setSelectedForCompare(prev => prev.filter(p => p.id !== product.id));
        } else {
            const limit = subscription?.limits?.compare || 3;
            if (selectedForCompare.length >= limit) {
                toast.current.show({ severity: 'warn', summary: 'Limit Reached', detail: `You can only compare up to ${limit} policies on your current plan. Upgrade to compare more!`, life: 5000 });
                return;
            }
            setSelectedForCompare(prev => [...prev, product]);
        }
    };

    const handleSaveQuote = async (product) => {
        if (!isAuthenticated) {
            toast.current.show({ severity: 'info', summary: 'Login Required', detail: 'Please log in to save quotes.', life: 3000 });
            return;
        }

        setSavingQuoteId(product.id);
        try {
            const token = await getAccessTokenSilently();
            await axios.post(`http://localhost:3000/api/quotes/${user.sub}`, product, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Quote saved successfully!', life: 3000 });
        } catch (error) {
            console.error('Error saving quote:', error);
            if (error.response && error.response.status === 403) {
                toast.current.show({ severity: 'error', summary: 'Limit Reached', detail: `${error.response.data.error}. Please upgrade your plan.`, life: 5000 });
            } else {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to save quote. Please try again.', life: 3000 });
            }
        } finally {
            setSavingQuoteId(null);
        }
    };

    const handleContactVendor = (type, product) => {
        if (type === 'email') {
            const subject = encodeURIComponent(`Inquiry about ${product.productName}`);
            const body = encodeURIComponent(`Hi,\n\nI am interested in learning more about your ${product.productName} policy.\n\nBest regards`);
            window.location.href = `mailto:${product.vendorEmail}?subject=${subject}&body=${body}`;
        } else if (type === 'whatsapp') {
            const message = encodeURIComponent(`Hi, I am interested in learning more about your ${product.productName} policy.`);
            const phone = product.vendorPhone?.replace(/[^0-9]/g, '');
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#003366] py-12 transition-colors duration-300">
            <Toast ref={toast} />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Top Recommendations</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 dark:text-gray-300 sm:mt-4">
                        Based on your profile, here are the best matches for you.
                    </p>
                    {selectedForCompare.length > 0 && (
                        <div className="mt-4">
                            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Compare Selected ({selectedForCompare.length})
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-x-8">
                    {recommendations.map((product, index) => (
                        <div key={product.id} className={`relative flex flex-col rounded-2xl border bg-white dark:bg-[#002244] dark:border-gray-700 p-8 shadow-sm hover:shadow-lg transition-all duration-300 ${index === 0 ? 'border-primary ring-2 ring-primary' : 'border-gray-200'}`}>
                            {index === 0 && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-white shadow-sm">
                                    Best Match
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{product.productName}</h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{product.vendorName}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id={`compare-${product.id}`}
                                            name={`compare-${product.id}`}
                                            type="checkbox"
                                            checked={!!selectedForCompare.find(p => p.id === product.id)}
                                            onChange={() => handleCompareToggle(product)}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor={`compare-${product.id}`} className="ml-2 text-sm text-gray-500 dark:text-gray-400">Compare</label>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                                    <span className="text-4xl font-bold tracking-tight">{product.currency} {product.premium}</span>
                                    <span className="ml-1 text-xl font-semibold text-gray-500 dark:text-gray-400">/{product.frequency.toLowerCase()}</span>
                                </div>

                                <div className="mt-6">
                                    <div className="flex items-center">
                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${product.score}%` }}></div>
                                        </div>
                                        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{product.score}% Match</span>
                                    </div>

                                    {/* Requirements Display */}
                                    <div className="mt-4 space-y-2">
                                        {product.unmetRequirements && product.unmetRequirements.length > 0 && (
                                            <div className="text-xs">
                                                <span className="font-semibold text-red-500">Unmet Requirements:</span>
                                                <ul className="list-disc list-inside text-gray-500 dark:text-gray-400 ml-1">
                                                    {product.unmetRequirements.map((req, i) => (
                                                        <li key={i}>{req}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {product.metRequirements && product.metRequirements.length > 0 && (
                                            <div className="text-xs">
                                                <span className="font-semibold text-green-600">Met Requirements:</span>
                                                <ul className="list-disc list-inside text-gray-500 dark:text-gray-400 ml-1">
                                                    {product.metRequirements.map((req, i) => (
                                                        <li key={i}>{req}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <ul className="mt-6 space-y-4">
                                    {product.tags.map((tag) => (
                                        <li key={tag} className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <p className="ml-3 text-base text-gray-700 dark:text-gray-300">{tag}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-8 space-y-3">
                                <button
                                    className={`w-full rounded-md px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-opacity-90 ${index === 0 ? 'bg-primary hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600'}`}
                                    onClick={() => handleSaveQuote(product)}
                                    disabled={savingQuoteId === product.id}
                                >
                                    {savingQuoteId === product.id ? 'Saving...' : 'Save Quote'}
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleContactVendor('email', product)}
                                        disabled={!product.vendorEmail}
                                        className="flex-1 text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Email Vendor
                                    </button>
                                    <button
                                        onClick={() => handleContactVendor('whatsapp', product)}
                                        disabled={!product.vendorPhone}
                                        className="flex-1 text-sm bg-green-50 text-green-700 px-4 py-2 rounded border border-green-200 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        WhatsApp
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResultsPage;
