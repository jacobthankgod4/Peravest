import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../hooks/useAuth';

const AjoSavings: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/ajo/onboard');
    } else {
      navigate('/register');
    }
  };
  return (
    <DashboardLayout title="Ajo Savings">
      <main className="main" style={{ paddingBottom: '6rem' }}>
      <div className="container py-120">
        <div className="row">
          <div className="col-lg-8 mx-auto text-center">
            <div className="site-heading mb-50">
              <span className="site-title-tagline">Ajo Savings</span>
              <h2 className="site-title">Traditional Savings, Modern Security</h2>
              <p>Join our secure Ajo savings circles and build wealth with your community</p>
            </div>
          </div>
        </div>
        
        <div className="row align-items-center mb-5">
          <div className="col-lg-6 mb-4 mb-lg-0">
            <img src="/i/ajo.png" alt="Ajo Savings" style={{ width: '100%', height: 'auto', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
          </div>
          <div className="col-lg-6">
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
              <h4 style={{ color: '#0e2e50', marginBottom: '1.5rem', fontSize: '1.5rem' }}>How Ajo Works</h4>
              <ul className="about-list">
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Join a savings circle with other members</div></li>
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Contribute a fixed amount monthly</div></li>
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Receive your payout when it's your turn</div></li>
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Build savings discipline and community</div></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-lg-12">
            <div style={{ background: 'linear-gradient(135deg, #09c398 0%, #08a57d 100%)', padding: '2.5rem', borderRadius: '15px', color: '#fff' }}>
              <h4 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Key Benefits</h4>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}></i>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Guaranteed Collections</strong>
                      <span style={{ opacity: 0.9 }}>Monthly payouts you can count on</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}></i>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Zero Fees</strong>
                      <span style={{ opacity: 0.9 }}>No interest charges or hidden costs</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}></i>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Flexible Amounts</strong>
                      <span style={{ opacity: 0.9 }}>Choose contribution that fits your budget</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}></i>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Secure Platform</strong>
                      <span style={{ opacity: 0.9 }}>Digital security meets tradition</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-5" style={{ marginBottom: '4rem' }}>
          <button onClick={handleGetStarted} className="theme-btn" style={{ padding: '1rem 3rem', fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}>
            {isAuthenticated ? 'Join Ajo Circle' : 'Sign Up to Join'} <i className="far fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </main>
    </DashboardLayout>
  );
};

export default AjoSavings;