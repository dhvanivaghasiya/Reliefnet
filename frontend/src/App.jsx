import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import Home from './pages/Home';
import CampaignListing from './pages/CampaignListing';
import CampaignDetails from './pages/CampaignDetails';
import CampDetails from './pages/CampDetails';
import Camps from './pages/Camps';
import RegisterVolunteer from './pages/RegisterVolunteer';
import RegisterLeader from './pages/RegisterLeader';
import AdminApprovals from './pages/AdminApprovals';
import Donate from './pages/Donate';
import DonationHistory from './pages/DonationHistory';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';
import ChangePassword from './pages/ChangePassword';
import About from './pages/About';
import Contact from './pages/Contact';
import './App.css';

// Guard component to redirect unauthenticated users to login page
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-zinc-500 font-semibold font-['Inter',sans-serif]">
        <span>Loading session...</span>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppContent() {
  const { user } = useAuth();

  if (user && user.must_change_password) {
    return <ChangePassword />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 flex flex-col font-['Inter',sans-serif]">
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/volunteer/register" element={<RegisterVolunteer />} />
          <Route path="/leader/register" element={<RegisterLeader />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/campaigns" element={<CampaignListing />} />
          <Route path="/campaigns/:id" element={<CampaignDetails />} />
          <Route path="/camps" element={<Camps />} />
          <Route path="/camps/:id" element={<CampDetails />} />

          {/* Legacy redirect routes for old registrations */}
          <Route path="/register/volunteer" element={<Navigate to="/volunteer/register" replace />} />
          <Route path="/register/leader" element={<Navigate to="/leader/register" replace />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leader" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/volunteer" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/approvals" 
            element={
              <ProtectedRoute>
                <AdminApprovals />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <DonationHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
