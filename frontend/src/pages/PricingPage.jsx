import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PricingPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleSubscribe = async (tier) => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (tier === 'basic') {
            // Free tier logic (if any) or just redirect
            alert("You are on the Free plan.");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/subscriptions/initiate-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tier: tier,
                    userId: currentUser.uid,
                    userType: 'user',
                    email: currentUser.email,
                    firstName: currentUser.displayName?.split(' ')[0] || '',
                    lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || ''
                }),
            });

            const data = await response.json();
            if (data.paymentURL) {
                window.location.href = data.paymentURL;
            } else {
                alert('Failed to initiate payment: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error initiating payment:', error);
            alert('Failed to start subscription process.');
        }
    };

    const tiers = [
        {
            name: 'Free',
            price: 'Free',
            tierId: 'basic',
            features: ['Compare 3 policies', 'Save 5 quotes', 'Standard AI recommendations'],
            buttonText: 'Current Plan',
            recommended: false
        },
        {
            name: 'SmartPlan',
            price: 'BWP 150/mo',
            tierId: 'premium',
            features: ['Unlimited comparisons', 'Unlimited saved quotes', 'Savings suggestions', 'Early access'],
            buttonText: 'Subscribe',
            recommended: true
        },
        {
            name: 'ElitePlan',
            price: 'BWP 200/mo', // Matching backend TIER_MAP for vendor_basic just for demo, or add new tier
            tierId: 'vendor_basic', // Using existing backend tier for demo
            features: ['Advanced financial planning', 'Risk assessment', 'Priority support', 'Family profiles'],
            buttonText: 'Subscribe',
            recommended: false
        }
    ];

    return (
        <div className="bg-[#F5F1E6] dark:bg-[#003366] min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Choose Your Coverage Plan
                </h2>
                <p className="mt-4 text-xl text-gray-500">
                    Select the plan that fits your insurance management needs.
                </p>
            </div>

            <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-auto xl:grid-cols-3">
                {tiers.map((tier) => (
                    <div key={tier.name} className={`border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-[#002244] flex flex-col transition-colors duration-300 ${tier.recommended ? 'ring-2 ring-primary' : ''}`}>
                        <div className="p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{tier.name}</h3>
                            <p className="mt-4">
                                <span className="text-4xl font-extrabold text-gray-900">{tier.price}</span>
                                {tier.price !== 'Free' && <span className="text-sm text-gray-500 block mt-1">Billed Monthly</span>}
                            </p>
                            <button
                                onClick={() => handleSubscribe(tier.tierId)}
                                className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${tier.recommended ? 'bg-primary text-white hover:bg-blue-700' : 'bg-blue-50 text-primary hover:bg-blue-100'}`}
                            >
                                {tier.buttonText}
                            </button>
                        </div>
                        <div className="pt-6 pb-8 px-6 flex-1">
                            <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">What's included</h4>
                            <ul className="mt-6 space-y-4">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <p className="ml-3 text-base text-gray-500">{feature}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PricingPage;
