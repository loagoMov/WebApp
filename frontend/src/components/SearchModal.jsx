import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SearchModal = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ vendors: [], products: [] });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'vendors', 'products'
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Debounce search
    useEffect(() => {
        if (query.trim().length === 0) {
            setResults({ vendors: [], products: [] });
            return;
        }

        if (query.trim().length <= 2) {
            // Don't search yet, but don't clear existing results either
            return;
        }

        const timer = setTimeout(() => {
            performSearch();
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current.focus();
            }, 100);
        }
    }, [isOpen]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const token = currentUser ? await currentUser.getIdToken() : null;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.post('http://localhost:3000/api/search', {
                query,
                filters: { type: 'all' }
            }, { headers });

            console.log('DEBUG Frontend: Received search results:', response.data);
            setResults(response.data);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
    };

    if (!isOpen) return null;

    const hasResults = results.vendors.length > 0 || results.products.length > 0;
    console.log('DEBUG: hasResults =', hasResults, 'vendors:', results.vendors, 'products:', results.products);


    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        {/* Search Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-lg"
                                placeholder="Search for vendors, products, or insurance types..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            {loading && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <div className="animate-spin h-5 w-5 text-primary border-b-2 border-current rounded-full"></div>
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        {hasResults && (
                            <div className="mt-4 border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                    <button
                                        onClick={() => setActiveTab('all')}
                                        className={`${activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        All Results
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('vendors')}
                                        className={`${activeTab === 'vendors' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        Vendors ({results.vendors.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('products')}
                                        className={`${activeTab === 'products' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        Products ({results.products.length})
                                    </button>
                                </nav>
                            </div>
                        )}

                        {/* Results */}
                        <div className="mt-4 max-h-96 overflow-y-auto">
                            {!hasResults && query.length > 2 && !loading && (
                                <div className="text-center py-8 text-gray-500">
                                    No results found for "{query}"
                                </div>
                            )}

                            {/* Vendors Section */}
                            {(() => {
                                const shouldShowVendors = (activeTab === 'all' || activeTab === 'vendors') && results.vendors.length > 0;
                                console.log('DEBUG: Should show vendors?', shouldShowVendors, 'activeTab=', activeTab, 'vendorsCount=', results.vendors.length);
                                return shouldShowVendors;
                            })() && (
                                    <div className="mb-6" style={{ border: '5px solid red', backgroundColor: 'yellow', padding: '20px' }}>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Vendors (DEBUG: THIS SHOULD BE VISIBLE)</h3>
                                        <ul className="divide-y divide-gray-200 bg-white border border-gray-200 rounded-md">
                                            {results.vendors.map((vendor) => (
                                                <li
                                                    key={vendor.id}
                                                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                                    onClick={() => handleNavigate(`/vendor/${vendor.id}`)}
                                                >
                                                    <div className="px-4 py-4 sm:px-6">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium text-primary truncate">{vendor.companyName}</p>
                                                            <div className="ml-2 flex-shrink-0 flex">
                                                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                    Vendor
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 sm:flex sm:justify-between">
                                                            <div className="sm:flex">
                                                                <p className="flex items-center text-sm text-gray-500">
                                                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    </svg>
                                                                    {vendor.address || 'No address'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                            {/* Products Section */}
                            {(activeTab === 'all' || activeTab === 'products') && results.products.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Products</h3>
                                    <ul className="divide-y divide-gray-200 bg-white border border-gray-200 rounded-md">
                                        {results.products.map((product) => (
                                            <li
                                                key={product.id}
                                                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                                onClick={() => handleNavigate(`/vendor/${product.vendorId}`)} // Navigate to vendor profile for now, ideally product detail
                                            >
                                                <div className="px-4 py-4 sm:px-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <p className="text-sm font-medium text-primary truncate">{product.name}</p>
                                                            <p className="text-xs text-gray-500">{product.category}</p>
                                                        </div>
                                                        <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                                                            <p className="text-sm font-bold text-gray-900">BWP {product.premium}/mo</p>
                                                            {product.compatibilityScore !== undefined && product.compatibilityScore !== null && (
                                                                <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.compatibilityScore >= 80 ? 'bg-green-100 text-green-800' :
                                                                    product.compatibilityScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {product.compatibilityScore}% Match
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {product.compatibilityReason && (
                                                        <div className="mt-2">
                                                            <p className="text-xs text-gray-500 italic">
                                                                "{product.compatibilityReason}"
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
