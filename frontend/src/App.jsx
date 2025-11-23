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
import AuthWrapper from './components/AuthWrapper';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AuthProvider from './auth/AuthProvider';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <AuthWrapper>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/admin/dashboard" element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } />
            <Route path="/vendor/login" element={<VendorLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/vendor/pricing" element={<VendorPricingPage />} />
            <Route path="/subscription/success" element={<SubscriptionSuccess />} />
            <Route path="/subscription/cancel" element={<SubscriptionCancel />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Routes>
        </AuthWrapper>
      </main>
      <Footer />
    </div>
  );
}

export default App;
