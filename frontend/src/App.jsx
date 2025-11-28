import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VendorLogin from './pages/VendorLogin';
import AdminLogin from './pages/AdminLogin';
import Profile from './pages/Profile';
import PricingPage from './pages/PricingPage';
import VendorPricingPage from './pages/VendorPricingPage';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import SubscriptionCancel from './pages/SubscriptionCancel';
import OnboardingPage from './pages/OnboardingPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VendorRegisterPage from './pages/VendorRegisterPage';
import InactivityHandler from './components/InactivityHandler';
import AboutPage from './pages/AboutPage';
import ThemeToggle from './components/ThemeToggle';
import BecomeVendorPage from './pages/BecomeVendorPage';
import PhoneLoginPage from './pages/PhoneLoginPage';

import { AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import PageTransition from './components/PageTransition';

// ... imports ...

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/quiz" element={<PageTransition><QuizPage /></PageTransition>} />
        <Route path="/results" element={<PageTransition><ResultsPage /></PageTransition>} />
        <Route path="/vendor/dashboard" element={<PageTransition><VendorDashboard /></PageTransition>} />
        <Route path="/admin/dashboard" element={
          <PageTransition>
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          </PageTransition>
        } />
        <Route path="/vendor/login" element={<PageTransition><VendorLogin /></PageTransition>} />
        <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><PricingPage /></PageTransition>} />
        <Route path="/vendor/pricing" element={<PageTransition><VendorPricingPage /></PageTransition>} />
        <Route path="/subscription/success" element={<PageTransition><SubscriptionSuccess /></PageTransition>} />
        <Route path="/subscription/cancel" element={<PageTransition><SubscriptionCancel /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><OnboardingPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/vendor/register" element={<PageTransition><VendorRegisterPage /></PageTransition>} />
        <Route path="/vendor/apply" element={<PageTransition><BecomeVendorPage /></PageTransition>} />
        <Route path="/phone-login" element={<PageTransition><PhoneLoginPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <AnimatedRoutes />
        <InactivityHandler />
        <ThemeToggle />
      </main>
      <Footer />
    </div>
  );
}

export default App;
