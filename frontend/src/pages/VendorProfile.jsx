import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const VendorProfile = () => {
    const { vendorId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVendorData = async () => {
            try {
                setLoading(true);

                // Fetch vendor information from users collection
                const vendorRef = doc(db, 'users', vendorId);
                const vendorSnap = await getDoc(vendorRef);

                if (!vendorSnap.exists()) {
                    setError('Vendor not found');
                    setLoading(false);
                    return;
                }

                const vendorData = vendorSnap.data();

                // Check if this is actually a vendor and approved
                if (vendorData.role !== 'vendor') {
                    setError('This user is not a vendor');
                    setLoading(false);
                    return;
                }

                if (vendorData.status !== 'approved') {
                    setError('This vendor is not currently active');
                    setLoading(false);
                    return;
                }

                setVendor({ id: vendorId, ...vendorData });

                // Fetch vendor's products
                const qProducts = query(
                    collection(db, 'insurance_products'),
                    where('vendorId', '==', vendorId),
                    where('status', '==', 'Active')
                );
                const productsSnap = await getDocs(qProducts);
                const productsList = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProducts(productsList);

                // Track profile view
                await trackProfileView();

                setLoading(false);
            } catch (err) {
                console.error('Error fetching vendor data:', err);
                setError('Failed to load vendor profile');
                setLoading(false);
            }
        };

        const trackProfileView = async () => {
            try {
                await addDoc(collection(db, 'profile_views'), {
                    vendorId: vendorId,
                    viewerId: currentUser?.uid || null,
                    timestamp: new Date(),
                    userAgent: navigator.userAgent,
                    referrer: document.referrer || null
                });
            } catch (err) {
                console.error('Error tracking profile view:', err);
                // Don't show error to user, just log it
            }
        };

        if (vendorId) {
            fetchVendorData();
        }
    }, [vendorId, currentUser]);

    const handleContactVendor = (type) => {
        if (type === 'email' && vendor.email) {
            const subject = encodeURIComponent(`Inquiry about ${vendor.companyName} insurance products`);
            const body = encodeURIComponent(`Hi,\n\nI am interested in learning more about your insurance products.\n\nBest regards`);
            window.location.href = `mailto:${vendor.email}?subject=${subject}&body=${body}`;
        } else if (type === 'whatsapp' && vendor.phone) {
            const message = encodeURIComponent(`Hi, I am interested in learning more about your insurance products.`);
            const phone = vendor.phone.replace(/[^0-9]/g, ''); // Remove non-numeric characters
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        }
    };

    // Group products by category
    const productsByCategory = products.reduce((acc, product) => {
        const category = product.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading vendor profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">{error}</h3>
                    <div className="mt-6">
                        <button
                            onClick={() => navigate('/vendors')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Browse All Vendors
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">{vendor.companyName}</h1>
                            {vendor.address && (
                                <p className="mt-2 text-sm text-gray-500 flex items-center">
                                    <svg className="mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {vendor.address}
                                </p>
                            )}
                            {vendor.taxId && (
                                <p className="mt-1 text-sm text-gray-500">Tax ID: {vendor.taxId}</p>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 ml-4">
                            {vendor.email && (
                                <button
                                    onClick={() => handleContactVendor('email')}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email
                                </button>
                            )}
                            {vendor.phone && (
                                <button
                                    onClick={() => handleContactVendor('whatsapp')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    WhatsApp
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Insurance Products</h2>

                {products.length === 0 ? (
                    <div className="bg-white shadow rounded-lg p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No products available</h3>
                        <p className="mt-1 text-sm text-gray-500">This vendor hasn't added any products yet.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                            <div key={category}>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm mr-3">
                                        {categoryProducts.length}
                                    </span>
                                    {category}
                                </h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {categoryProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
                                        >
                                            <div className="p-6">
                                                <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                                                <p className="mt-2 text-3xl font-bold text-primary">
                                                    BWP {product.premium}
                                                    <span className="text-sm font-normal text-gray-500">/month</span>
                                                </p>
                                                {product.description && (
                                                    <p className="mt-3 text-sm text-gray-500 line-clamp-3">{product.description}</p>
                                                )}
                                                {product.requirements && product.requirements.length > 0 && (
                                                    <div className="mt-4">
                                                        <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide">Requirements</h5>
                                                        <ul className="mt-2 space-y-1">
                                                            {product.requirements.slice(0, 3).map((req, idx) => (
                                                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                                                    <svg className="mr-1.5 h-5 w-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                    </svg>
                                                                    {req}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorProfile;
