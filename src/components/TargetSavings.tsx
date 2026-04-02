import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../hooks/useAuth';

const TargetSavings: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [targetAmount, setTargetAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [frequency, setFrequency] = useState('monthly');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/target-savings/onboard');
    } else {
      navigate('/register');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Target Savings:', { targetAmount, duration, frequency });
  };

  return (
    <DashboardLayout title="Target Savings">
      <main className="main">
      <div className="container py-120">
        <div className="row">
          <div className="col-lg-8 mx-auto text-center">
            <div className="site-heading mb-50">
              <span className="site-title-tagline">Target Savings</span>
              <h2 className="site-title">Save Towards Your Goals</h2>
              <p>Set specific financial goals and save automatically to achieve them</p>
            </div>
          </div>
        </div>
        
        <div className="row align-items-center mb-5">
          <div className="col-lg-6 mb-4 mb-lg-0">
            <img src="/i/target_savings.png" alt="Target Savings" style={{ width: '100%', height: 'auto', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
          </div>
          <div className="col-lg-6">
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
              <h4 style={{ color: '#0e2e50', marginBottom: '1.5rem', fontSize: '1.5rem' }}>How Target Savings Works</h4>
              <ul className="about-list">
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Set your savings goal and target amount</div></li>
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Choose your savings frequency (daily, weekly, monthly)</div></li>
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Automated deductions from your account</div></li>
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Track your progress in real-time</div></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-lg-12">
            <div style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)', padding: '2.5rem', borderRadius: '15px', color: '#fff' }}>
              <h4 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Key Benefits</h4>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}></i>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Disciplined Approach</strong>
                      <span style={{ opacity: 0.9 }}>Automated savings build consistency</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}></i>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Competitive Rates</strong>
                      <span style={{ opacity: 0.9 }}>Earn interest while you save</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}></i>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Flexible Withdrawals</strong>
                      <span style={{ opacity: 0.9 }}>Access your funds when needed</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}></i>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Goal Tracking</strong>
                      <span style={{ opacity: 0.9 }}>Monitor progress with dashboard</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-5 mb-5">
          <button onClick={handleGetStarted} className="theme-btn" style={{ padding: '1rem 3rem', fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}>
            {isAuthenticated ? 'Create Savings Goal' : 'Sign Up to Start'} <i className="far fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </main>
    </DashboardLayout>
  );
};

export default TargetSavings;