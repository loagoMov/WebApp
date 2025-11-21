import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const PricingPage = () => {
    const { user, isAuthenticated, loginWithRedirect } = useAuth0();

    const handleSubscribe = async (priceId) => {
        if (!isAuthenticated) {
            loginWithRedirect();
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/subscriptions/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    userId: user.sub,
                    userType: 'user',
                    successUrl: `${window.location.origin}/subscription/success`,
                    cancelUrl: window.location.href,
                }),
            });

            const { url } = await response.json();
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
            alert('Failed to start subscription process.');
        }
    };

    const tiers = [
        {
            name: 'LiteCover',
            price: 'Free',
            priceId: 'price_lite_id', // Replace with actual Stripe Price ID
            features: ['Compare 3 policies', 'Save 5 quotes', 'Standard AI recommendations'],
            buttonText: 'Get Started',
            recommended: false
        },
        {
            name: 'CoverPlus',
            price: 'BWP 99/mo',
            priceId: 'price_plus_id',
            features: ['Unlimited comparisons', 'Unlimited saved quotes', 'Savings suggestions', 'Early access'],
            buttonText: 'Subscribe',
            recommended: true
        },
        {
            name: 'UltimateCover',
            price: 'BWP 199/mo',
            priceId: 'price_ultimate_id',
            features: ['Advanced financial planning', 'Risk assessment', 'Priority support', 'Family profiles'],
            buttonText: 'Subscribe',
            recommended: false
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
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
                    <div key={tier.name} className={`border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white flex flex-col ${tier.recommended ? 'ring-2 ring-primary' : ''}`}>
                        <div className="p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{tier.name}</h3>
                            <p className="mt-4">
                                <span className="text-4xl font-extrabold text-gray-900">{tier.price}</span>
                            </p>
                            <button
                                onClick={() => handleSubscribe(tier.priceId)}
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
