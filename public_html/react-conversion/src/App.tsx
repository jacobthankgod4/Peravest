import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { InvestmentProvider } from '../contexts/InvestmentContext';
import { WithdrawalProvider } from '../contexts/WithdrawalContext';

// Components
import Header from '../components/Header';
import Footer from '../components/Footer';
import Home from '../components/Home';
import Login from '../components/Login';
import Register from '../components/Register';
import Dashboard from '../components/Dashboard';
import UserDashboard from '../components/UserDashboard';
import AdminDashboard from '../components/AdminDashboard';
import Listings from '../components/Listings';
import ListingDetail from '../components/ListingDetail';
import InvestNow from '../components/InvestNow';
import Checkout from '../components/Checkout';
import Portfolio from '../components/Portfolio';
import Withdrawal from '../components/Withdrawal';
import Profile from '../components/Profile';
import AddProperty from '../components/AddProperty';
import PropertyManagement from '../components/PropertyManagement';
import ProtectedRoute from '../components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <InvestmentProvider>
        <WithdrawalProvider>
          <Router>
            <div className="App">
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/listings" element={<Listings />} />
                  <Route path="/listings/:id" element={<ListingDetail />} />
                  
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/user/dashboard" element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/dashboard" element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  
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
                  
                  <Route path="/portfolio" element={
                    <ProtectedRoute>
                      <Portfolio />
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
                  
                  <Route path="/admin/properties" element={
                    <ProtectedRoute adminOnly>
                      <PropertyManagement />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/properties/add" element={
                    <ProtectedRoute adminOnly>
                      <AddProperty />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </WithdrawalProvider>
      </InvestmentProvider>
    </AuthProvider>
  );
}

export default App;