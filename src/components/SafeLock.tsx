import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../hooks/useAuth';

const SafeLock: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/safelock/onboard');
    } else {
      navigate('/register');
    }
  };
  return (
    <DashboardLayout title="SafeLock">
      <main className="main">
      <div className="container py-120">
        <div className="row">
          <div className="col-lg-8 mx-auto text-center">
            <div className="site-heading mb-50">
              <span className="site-title-tagline">SafeLock</span>
              <h2 className="site-title">Lock Your Savings, Unlock Your Future</h2>
              <p>Secure your savings with our time-locked deposit feature and earn higher interest rates</p>
            </div>
          </div>
        </div>
        
        <div className="row align-items-center mb-5">
          <div className="col-lg-6 mb-4 mb-lg-0">
            <img src="/i/a2.jpg" alt="SafeLock Savings" style={{ width: '100%', height: 'auto', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
          </div>
          <div className="col-lg-6">
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
              <h4 style={{ color: '#0e2e50', marginBottom: '1.5rem', fontSize: '1.5rem' }}>How SafeLock Works</h4>
              <ul className="about-list">
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Choose your lock period (3, 6, or 12 months)</div></li>
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Deposit your desired amount</div></li>
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Earn higher interest rates for longer lock periods</div></li>
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Funds automatically unlock at maturity</div></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-lg-12">
            <div style={{ background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)', padding: '2.5rem', borderRadius: '15px', color: '#fff' }}>
              <h4 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Key Benefits</h4>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}></i>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>High Interest</strong>
                      <span style={{ opacity: 0.9 }}>Up to 15% annual returns</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}></i>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Forced Discipline</strong>
                      <span style={{ opacity: 0.9 }}>No early withdrawal temptation</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}></i>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Guaranteed Returns</strong>
                      <span style={{ opacity: 0.9 }}>Fixed interest rate locked in</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}></i>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Flexible Periods</strong>
                      <span style={{ opacity: 0.9 }}>Choose 3, 6, or 12 month terms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-5">
          <button onClick={handleGetStarted} className="theme-btn" style={{ padding: '1rem 3rem', fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}>
            {isAuthenticated ? 'Lock Your Savings' : 'Sign Up to Start'} <i className="far fa-arrow-right"></i>
          </button>
        </div>
        <div style={{ height: '4rem', background: '#eaf7f4' }}></div>
      </div>
    </main>
    </DashboardLayout>
  );
};

export default SafeLock;
