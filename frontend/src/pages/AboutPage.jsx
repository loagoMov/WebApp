import React from 'react';
import MagicBento from '../components/MagicBento';

const AboutPage = () => {
    const aboutCards = [
        // 1. Introduction (Large, Top Left)
        {
            title: 'Who We Are',
            description: 'CoverBots is Botswana’s first intelligent insurance marketplace. We bridge the gap between insurance companies and the people they serve, using advanced AI to analyze your unique needs and recommend the best policies.',
            label: 'The Future of Insurance',
            className: 'md:col-span-2 md:row-span-2 min-h-[300px]',
            color: '#003366'
        },
        // 2. Mission (Top Right)
        {
            title: 'Our Mission',
            label: 'Purpose',
            className: 'md:col-span-2 min-h-[200px]',
            color: '#003366',
            customContent: (
                <div className="h-full flex flex-col justify-center">
                    <h3 className="text-xl font-bold mb-3 text-white">Our Mission</h3>
                    <ul className="space-y-2 text-sm text-gray-200">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                            Make insurance simple & accessible
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                            Empower informed decisions
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                            Bring transparency to the ecosystem
                        </li>
                    </ul>
                </div>
            )
        },
        // 3. Vision (Middle Right)
        {
            title: 'Our Vision',
            description: 'To become the leading insurance comparison platform in Africa, starting in Botswana and expanding to South Africa, Namibia, and Zambia.',
            label: 'Growth',
            className: 'md:col-span-1 min-h-[200px]',
            color: '#003366'
        },
        // 4. Values (Middle Right)
        {
            title: 'Core Values',
            label: 'Principles',
            className: 'md:col-span-1 min-h-[200px]',
            color: '#003366',
            customContent: (
                <div className="h-full flex flex-col justify-center">
                    <h3 className="text-xl font-bold mb-2 text-white">Values</h3>
                    <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-white/10 p-2 rounded-lg text-xs">Transparency</div>
                        <div className="bg-white/10 p-2 rounded-lg text-xs">Fairness</div>
                        <div className="bg-white/10 p-2 rounded-lg text-xs">Security</div>
                        <div className="bg-white/10 p-2 rounded-lg text-xs">Community</div>
                    </div>
                </div>
            )
        },
        // 5. Our Story (Large, Middle)
        {
            title: 'Our Story',
            description: 'Born from frustration with confusing insurance policies, CoverBots was created to bring clarity. We realized there was no "one place" to compare options. So we built it.',
            label: 'Origins',
            className: 'md:col-span-2 md:row-span-1 min-h-[200px]',
            color: '#003366'
        },
        // 6. Tech Stack (Bottom Left)
        {
            title: 'Powered By',
            label: 'Technology',
            className: 'md:col-span-2 min-h-[200px]',
            color: '#003366',
            customContent: (
                <div className="h-full flex flex-col justify-center">
                    <h3 className="text-xl font-bold mb-3 text-white">Powered By</h3>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs border border-teal-500/30">AI Engine</span>
                        <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs border border-teal-500/30">Auth0</span>
                        <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs border border-teal-500/30">Firebase</span>
                        <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs border border-teal-500/30">DPO Pay</span>
                        <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs border border-teal-500/30">React</span>
                        <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs border border-teal-500/30">Node.js</span>
                    </div>
                </div>
            )
        },
        // 7. Commitment (Bottom Middle)
        {
            title: 'Local Commitment',
            description: 'Built for Botswana. We support local vendors and drive financial literacy in schools and universities.',
            label: 'Community',
            className: 'md:col-span-1 min-h-[200px]',
            color: '#003366'
        },
        // 8. Future (Bottom Right)
        {
            title: 'The Future',
            description: 'Coming soon: Mobile App, Cross-border support, and AI Personal Assistants.',
            label: 'Roadmap',
            className: 'md:col-span-1 min-h-[200px]',
            color: '#003366'
        }
    ];

    return (
        <div className="min-h-screen bg-[#002244] py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl mb-4">
                    About CoverBots
                </h1>
                <p className="text-xl text-blue-200 max-w-3xl mx-auto">
                    Navigating the future of insurance in Botswana with intelligence and trust.
                </p>
            </div>

            <MagicBento
                cards={aboutCards}
                textAutoHide={false}
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={true}
                enableMagnetism={true}
                clickEffect={true}
                spotlightRadius={300}
                particleCount={15}
                glowColor="80, 140, 126" // Teal
            />
        </div>
    );
};

export default AboutPage;
