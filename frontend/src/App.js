import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all pages
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Main from './pages/Main'; // <-- Import Main page
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import FeedbackModal from './pages/FeedbackModal';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import VerifyOTP from './pages/VerifyOTP';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import PcosRisk from './pages/PcosRisk';
import PcosBot from './pages/PcosBot';
import PcosJournal from './pages/PcosJournal';
import PcosCycleTracker from './pages/PcosCycleTracker';
import PcosRecomendations from './pages/PcosRecomendations';

function App() {
  return (
    <Router>
      <Routes>
        {/* Root/Main page */}
        <Route path="/" element={<Main />} /> 
        
        {/* Main User Routes */}
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Home" element={<Home />} />  

        {/* Auth & Security */}
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/reset/:token" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* Additional Pages */}
        <Route path="/privacy" element={<Privacy />} />

        {/* Modals / Special Components */}
        <Route path="/feedback" element={<FeedbackModal />} />
        <Route path="/profile" element={<Profile />} />

        {/* Feature Pages */}
        <Route path="/PcosRisk" element={<PcosRisk />} />
        <Route path="/PcosBot" element={<PcosBot />} />
        <Route path="/PcosJournal" element={<PcosJournal />} />
        <Route path="/PcosCycleTracker" element={<PcosCycleTracker />} />
        <Route path="/PcosRecomendations" element={<PcosRecomendations />} />

        {/* Admin Routes */}
        <Route path="/AdminLogin" element={<AdminLogin />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
