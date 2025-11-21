import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-primary text-white">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">CoverBots</h3>
                        <p className="text-gray-400 text-sm">
                            Intelligent insurance recommendations for Botswana's youth.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-white">About Us</a></li>
                            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <p className="text-gray-400 text-sm">
                            Gaborone, Botswana<br />
                            support@coverbots.bw
                        </p>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} CoverBots. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
