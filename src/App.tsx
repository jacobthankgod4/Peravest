import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { InvestmentProvider } from './contexts/InvestmentContext';
import { ReferralProvider } from './contexts/ReferralContext';
import TestHome from './pages/TestHome';
import Login from './pages/Login';
import Register from './pages/Register';
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
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute';

import Notifications from './pages/Notifications';
import KYC from './pages/KYC';
import Withdrawal from './pages/Withdrawal';
import Profile from './pages/Profile';
import Portfolio from './pages/Portfolio';
import ReferAndEarn from './pages/ReferAndEarn';
import AjoOnboarding from './components/AjoOnboarding';
import TargetSavingsOnboarding from './components/TargetSavingsOnboarding';
import PackageDetail from './pages/PackageDetail';
import AdminRegister from './components_main/AdminRegister';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components_main/AdminDashboard';
import AdminPropertyManagement from './components/admin/AdminPropertyManagement';
import AdminUserManagement from './components/admin/AdminUserManagement';
import AdminAjoManagement from './components/admin/AdminAjoManagement';
import AdminAnalytics from './components/admin/AdminAnalytics';
import AdminNotifications from './components/admin/AdminNotifications';
import AdminAuditLogs from './components/admin/AdminAuditLogs';
import AdminWithdrawals from './components/admin/AdminWithdrawals';
import AdminKYC from './components/admin/AdminKYC';
import TransactionHistory from './components/admin/TransactionHistory';
import DashboardAnalytics from './components/admin/DashboardAnalytics';
import RevenueReports from './components/admin/RevenueReports';
import UserActivityReports from './components/admin/UserActivityReports';
import NotificationManagement from './components/admin/NotificationManagement';
import EmailTemplates from './components/admin/EmailTemplates';
import SystemSettings from './components/admin/SystemSettings';
import BlogManagement from './components/admin/BlogManagement';
import AjoSavings from './pages/AjoSavings';
import SafeLock from './components/SafeLock';
import SafeLockOnboarding from './components/SafeLockOnboarding';
import TargetSavings from './components/TargetSavings';

import './App.css';
import './components.css';

function App() {
  return (
    <HelmetProvider>
    <AuthProvider>
      <InvestmentProvider>
        <ReferralProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<TestHome />} />
            <Route path="/about" element={<About />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/packages/:packageId" element={<PackageDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            } />
            <Route path="/register" element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            } />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/activate" element={<AccountActivation />} />
            <Route path="/invest/:id" element={
              <ProtectedRoute>
                <InvestNow />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/payment-verification" element={
              <ProtectedRoute>
                <PaymentVerification />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/portfolio" element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            } />
            <Route path="/ajo/onboard" element={
              <ProtectedRoute>
                <AjoOnboarding />
              </ProtectedRoute>
            } />
            <Route path="/ajo" element={
              <ProtectedRoute>
                <AjoSavings />
              </ProtectedRoute>
            } />
            <Route path="/target-savings/onboard" element={
              <ProtectedRoute>
                <TargetSavingsOnboarding />
              </ProtectedRoute>
            } />
            <Route path="/target-savings" element={
              <ProtectedRoute>
                <TargetSavings />
              </ProtectedRoute>
            } />
            <Route path="/safelock" element={
              <ProtectedRoute>
                <SafeLock />
              </ProtectedRoute>
            } />
            <Route path="/safelock/onboard" element={
              <ProtectedRoute>
                <SafeLockOnboarding />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/kyc" element={
              <ProtectedRoute>
                <KYC />
              </ProtectedRoute>
            } />
            <Route path="/withdrawal" element={
              <ProtectedRoute>
                <Withdrawal />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/refer" element={
              <ProtectedRoute>
                <ReferAndEarn />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/register" element={<AdminRegister />} />
            
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
            
            <Route path="/admin/properties/add" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><AddProperty /></AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/properties/edit/:id" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><EditProperty /></AdminLayout>
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
            
            <Route path="/admin/transactions" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><TransactionHistory /></AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/analytics/dashboard" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><DashboardAnalytics /></AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/analytics/revenue" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><RevenueReports /></AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/analytics/user-activity" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><UserActivityReports /></AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/email-templates" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><EmailTemplates /></AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/settings" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><SystemSettings /></AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/blogs" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><BlogManagement /></AdminLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
        </Router>
        </ReferralProvider>
      </InvestmentProvider>
    </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
