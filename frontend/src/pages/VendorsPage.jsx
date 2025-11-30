import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const VendorsPage = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                setLoading(true);
                // Fetch all approved vendors
                const qVendors = query(
                    collection(db, 'users'),
                    where('role', '==', 'vendor'),
                    where('status', '==', 'approved')
                );
                const vendorsSnap = await getDocs(qVendors);
                const vendorsList = vendorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Fetch product counts for each vendor
                const vendorsWithCounts = await Promise.all(
                    vendorsList.map(async (vendor) => {
                        const qProducts = query(
                            collection(db, 'insurance_products'),
                            where('vendorId', '==', vendor.id),
                            where('status', '==', 'Active')
                        );
                        const productsSnap = await getDocs(qProducts);
                        return {
                            ...vendor,
                            productCount: productsSnap.size
                        };
                    })
                );

                setVendors(vendorsWithCounts);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching vendors:', err);
                setLoading(false);
            }
        };

        fetchVendors();
    }, []);

    const filteredVendors = vendors.filter(vendor =>
        vendor.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading vendors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900">Insurance Vendors</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Browse our network of trusted insurance providers
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Bar */}
                <div className="mb-8">
                    <div className="max-w-xl">
                        <label htmlFor="search" className="sr-only">Search vendors</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="search"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Search by company name or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-6">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-medium">{filteredVendors.length}</span> vendor{filteredVendors.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Vendors Grid */}
                {filteredVendors.length === 0 ? (
                    <div className="bg-white shadow rounded-lg p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredVendors.map((vendor) => (
                            <Link
                                key={vendor.id}
                                to={`/vendor/${vendor.id}`}
                                className="bg-white shadow rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-200 flex flex-col"
                            >
                                <div className="p-6 flex-1">
                                    <div className="flex items-start justify-between">
                                        <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                                            {vendor.companyName}
                                        </h3>
                                        {vendor.productCount > 0 && (
                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                                                {vendor.productCount} {vendor.productCount === 1 ? 'product' : 'products'}
                                            </span>
                                        )}
                                    </div>

                                    {vendor.address && (
                                        <p className="mt-3 text-sm text-gray-500 flex items-start">
                                            <svg className="mr-1.5 h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="line-clamp-2">{vendor.address}</span>
                                        </p>
                                    )}

                                    {vendor.email && (
                                        <p className="mt-2 text-sm text-gray-500 flex items-center">
                                            <svg className="mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span className="truncate">{vendor.email}</span>
                                        </p>
                                    )}

                                    {vendor.phone && (
                                        <p className="mt-2 text-sm text-gray-500 flex items-center">
                                            <svg className="mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {vendor.phone}
                                        </p>
                                    )}
                                </div>

                                <div className="bg-gray-50 px-6 py-4">
                                    <span className="text-sm font-medium text-primary flex items-center">
                                        View Profile
                                        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorsPage;
