import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import About from './pages/About';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import Packages from './pages/Packages';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import InvestNow from './pages/InvestNow';
import Checkout from './pages/Checkout';
import PaymentVerification from './pages/PaymentVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AccountActivation from './pages/AccountActivation';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Components
import AdminLayout from '../../src/components/admin/AdminLayout';
import AdminDashboard from '../../src/components_main/AdminDashboard';
import AdminPropertyManagement from '../../src/components/admin/AdminPropertyManagement';
import AdminUserManagement from '../../src/components/admin/AdminUserManagement';
import AdminAjoManagement from '../../src/components/admin/AdminAjoManagement';
import AdminAnalytics from '../../src/components/admin/AdminAnalytics';
import AdminNotifications from '../../src/components/admin/AdminNotifications';
import AdminAuditLogs from '../../src/components/admin/AdminAuditLogs';
import AdminWithdrawals from '../../src/components/admin/AdminWithdrawals';
import AdminKYC from '../../src/components/admin/AdminKYC';

import './App.css';
import './components.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/activate" element={<AccountActivation />} />
            <Route path="/invest/:id" element={<InvestNow />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-verification" element={<PaymentVerification />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><AdminDashboard /></AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/properties" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><AdminPropertyManagement /></AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><AdminUserManagement /></AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/ajo" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><AdminAjoManagement /></AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/analytics" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><AdminAnalytics /></AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/notifications" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><AdminNotifications /></AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/audit-logs" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><AdminAuditLogs /></AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/withdrawals" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><AdminWithdrawals /></AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/kyc" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><AdminKYC /></AdminLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;