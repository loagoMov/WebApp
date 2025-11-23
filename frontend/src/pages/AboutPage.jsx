import React from 'react';

const AboutPage = () => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative bg-primary py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        About CoverBots
                    </h1>
                    <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
                        Your trusted partner in navigating the world of insurance in Botswana.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-16">

                {/* 1. Introduction */}
                <section>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Who We Are</h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        CoverBots is Botswana’s first intelligent insurance marketplace, designed to make finding the right coverage simple, fast, and fair. We are a central hub where technology meets trust, using advanced AI to analyze your unique needs—income, lifestyle, and budget—and recommend the best policies from top local vendors. Whether you need car, home, or life insurance, CoverBots helps you compare options side-by-side, ensuring you get the protection you need without the confusion. We are here to bridge the gap between insurance companies and the people they serve.
                    </p>
                </section>

                {/* 2. Our Story */}
                <section className="bg-gray-50 p-8 rounded-2xl">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        The idea for CoverBots was born from a common frustration in Botswana: insurance information is everywhere, yet nowhere. People struggle to find policies that truly fit their lives, often relying on word-of-mouth or visiting multiple offices. At the same time, insurance vendors find it hard to reach the younger, digital-first generation. We realized there was no "one place" to understand and compare all insurance types. CoverBots was created to solve this—to bring clarity, simplicity, and fairness to the insurance world, making it accessible to everyone.
                    </p>
                </section>

                {/* 3. Our Mission */}
                <section>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                    <ul className="list-disc list-inside text-lg text-gray-600 space-y-2">
                        <li><strong>Make insurance simple and accessible</strong> for every Motswana.</li>
                        <li><strong>Empower people</strong> to make informed financial decisions with confidence.</li>
                        <li><strong>Bring transparency</strong> to the insurance ecosystem by removing hidden complexities.</li>
                        <li><strong>Bridge customers and vendors</strong> through smart, user-friendly technology.</li>
                    </ul>
                </section>

                {/* 4. Our Vision */}
                <section>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        We aim to become the leading insurance comparison and recommendation platform in Africa. Our vision extends beyond borders—starting in Botswana, we plan to expand into South Africa, Namibia, Zambia, and across the region. We want to build lasting trust between customers and vendors and make insurance literacy a natural part of daily life for all Africans.
                    </p>
                </section>

                {/* 5. What We Do */}
                <section className="bg-blue-50 p-8 rounded-2xl">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Do</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary mt-1"></div>
                            <p className="ml-4 text-lg text-gray-700"><strong>AI-Based Recommendations:</strong> Smart matching based on your profile.</p>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary mt-1"></div>
                            <p className="ml-4 text-lg text-gray-700"><strong>Vendor Marketplace:</strong> A comprehensive listing of all insurance categories.</p>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary mt-1"></div>
                            <p className="ml-4 text-lg text-gray-700"><strong>Policy Comparisons:</strong> Compare features and prices side-by-side.</p>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary mt-1"></div>
                            <p className="ml-4 text-lg text-gray-700"><strong>Secure Payments:</strong> Integrated with DPO and Stripe for safety.</p>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary mt-1"></div>
                            <p className="ml-4 text-lg text-gray-700"><strong>"Top Pick" AI Ranking:</strong> Unbiased scoring to find the best value.</p>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary mt-1"></div>
                            <p className="ml-4 text-lg text-gray-700"><strong>Vendor Analytics:</strong> Tools for insurers to understand market needs.</p>
                        </div>
                    </div>
                </section>

                {/* 6. Why Choose CoverBots */}
                <section>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CoverBots?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        <div className="p-4">
                            <h3 className="text-xl font-semibold text-primary">Transparency</h3>
                            <p className="mt-2 text-gray-600">No hidden fees or confusing jargon.</p>
                        </div>
                        <div className="p-4">
                            <h3 className="text-xl font-semibold text-primary">Fairness</h3>
                            <p className="mt-2 text-gray-600">Unbiased recommendations for everyone.</p>
                        </div>
                        <div className="p-4">
                            <h3 className="text-xl font-semibold text-primary">Security</h3>
                            <p className="mt-2 text-gray-600">Your data is protected with top-tier tech.</p>
                        </div>
                        <div className="p-4">
                            <h3 className="text-xl font-semibold text-primary">Locally Built</h3>
                            <p className="mt-2 text-gray-600">Designed specifically for Botswana.</p>
                        </div>
                    </div>
                </section>

                {/* 7. Our Commitment to Botswana */}
                <section className="bg-gray-50 p-8 rounded-2xl">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Commitment to Botswana</h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        CoverBots is proudly built with Botswana’s unique insurance ecosystem in mind. We understand the local financial realities and needs. We are committed to supporting local vendors, both big and small, and helping to educate young people about financial responsibility. We plan to partner with schools, universities, and insurance educators to drive financial literacy across the nation.
                    </p>
                </section>

                {/* 8. Meet the Technology */}
                <section>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet the Technology</h2>
                    <p className="text-lg text-gray-600 leading-relaxed mb-4">
                        Our platform is powered by cutting-edge technology to ensure speed, accuracy, and security:
                    </p>
                    <ul className="list-disc list-inside text-lg text-gray-600 space-y-2">
                        <li><strong>AI Recommendation Engines:</strong> To personalize your experience.</li>
                        <li><strong>Secure Cloud Infrastructure:</strong> Ensuring 24/7 availability.</li>
                        <li><strong>Auth0 Authentication:</strong> World-class security for your account.</li>
                        <li><strong>Firebase & Firestore:</strong> Real-time data processing.</li>
                        <li><strong>DPO Payments:</strong> Trusted African payment gateway.</li>
                    </ul>
                </section>

                {/* 9. Future Plans */}
                <section>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Future Plans</h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        We are just getting started. Coming soon:
                    </p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">Mobile App</div>
                        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">Cross-border Insurance Support</div>
                        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">Insurance Literacy Courses</div>
                        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">Personalized AI Assistants</div>
                    </div>
                </section>

                {/* 10. Closing Statement */}
                <section className="text-center py-12">
                    <h2 className="text-3xl font-bold text-primary mb-4">Protecting Your Future</h2>
                    <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                        CoverBots is here to help you protect your future. Insurance should never be confusing, and financial safety should be available to everyone. We are here to make that possible.
                    </p>
                </section>

            </div>
        </div>
    );
};

export default AboutPage;
