import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/vendor/login" element={<div className="p-10 text-center">Vendor Login (Coming Soon)</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
