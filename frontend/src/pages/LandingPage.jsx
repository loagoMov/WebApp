import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Insurance made simple</span>{' '}
                                    <span className="block text-primary xl:inline">for you.</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Find the perfect insurance policy in minutes. Compare quotes from top insurers in Botswana, customized to your budget and lifestyle.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <Link
                                            to="/quiz"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <a
                                            href="#how-it-works"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                                        >
                                            Learn More
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-100 flex items-center justify-center">
                    {/* Placeholder for Hero Image or 3D Element */}
                    <div className="text-gray-400 font-bold text-xl">Hero Image / 3D Visual</div>
                </div>
            </div>

            {/* How It Works Section */}
            <div id="how-it-works" className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Process</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            How CoverBots Works
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            Three simple steps to get you covered.
                        </p>
                    </div>

                    <div className="mt-10">
                        <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                            <div className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                                        1
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Answer a few questions</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    Tell us about yourself and what you're looking for. Our AI understands your needs.
                                </dd>
                            </div>

                            <div className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                                        2
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Get ranked matches</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    We compare policies from top vendors and rank them by score, price, and coverage.
                                </dd>
                            </div>

                            <div className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                                        3
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Choose & Connect</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    Pick your favorite and we'll connect you directly with the insurer to finalize.
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
