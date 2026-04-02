import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';

const SafeLockOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    lockPeriod: '6',
    interestRate: '10'
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const calculateMaturityAmount = () => {
    const principal = parseFloat(formData.amount) || 0;
    const rate = parseFloat(formData.interestRate) / 100;
    const months = parseInt(formData.lockPeriod);
    const interest = principal * rate * (months / 12);
    return principal + interest;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const lockAmount = Number(formData.amount);
    const maturityAmount = calculateMaturityAmount();
    
    navigate('/checkout', {
      state: {
        type: 'safelock',
        amount: lockAmount,
        lockPeriod: formData.lockPeriod,
        interestRate: formData.interestRate,
        maturityAmount: maturityAmount,
        firstPayment: lockAmount
      }
    });
  };

  return (
    <DashboardLayout title="Lock Your Savings">
      <main className="main">
      <div className="container py-120">
        <div className="row">
          <div className="col-lg-6 mx-auto">
            <div className="text-center mb-5">
              <h2 style={{ color: '#0e2e50', marginBottom: '0.75rem', fontSize: '2.5rem', fontWeight: 700 }}>Lock Your Savings</h2>
              <p style={{ color: '#757f95', fontSize: '1.1rem' }}>Secure your funds and earn higher interest rates</p>
            </div>
            
            <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#0e2e50', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Lock Your Savings</h3>
              <p style={{ color: '#757f95', marginBottom: '2rem' }}>Earn higher interest by locking your funds</p>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Amount to Lock</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter amount (₦)"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                    min="10000"
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                  <small style={{ color: '#757f95' }}>Minimum: ₦10,000</small>
                </div>

                <div className="form-group mb-3">
                  <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Lock Period</label>
                  <select
                    className="form-control"
                    value={formData.lockPeriod}
                    onChange={(e) => {
                      const period = e.target.value;
                      let rate = '10';
                      if (period === '6') rate = '10';
                      if (period === '9') rate = '12';
                      if (period === '12') rate = '15';
                      setFormData({...formData, lockPeriod: period, interestRate: rate});
                    }}
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  >
                    <option value="3">3 Months (8% p.a.)</option>
                    <option value="6">6 Months (10% p.a.)</option>
                    <option value="9">9 Months (12% p.a.)</option>
                    <option value="12">12 Months (15% p.a.)</option>
                  </select>
                  <small style={{ color: '#757f95' }}>Longer periods earn higher interest</small>
                </div>

                {formData.amount && (
                  <div style={{ background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', color: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Principal Amount:</span>
                      <strong>₦{parseFloat(formData.amount).toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Interest Rate:</span>
                      <strong>{formData.interestRate}% p.a.</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Lock Period:</span>
                      <strong>{formData.lockPeriod} months</strong>
                    </div>
                    <hr style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '1rem 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
                      <span>Maturity Amount:</span>
                      <strong>₦{calculateMaturityAmount().toLocaleString('en-NG', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>
                )}

                <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #ffc107' }}>
                  <small style={{ color: '#856404' }}>
                    <i className="fas fa-info-circle"></i> <strong>Note:</strong> Funds will be locked and cannot be withdrawn until maturity date.
                  </small>
                </div>

                <button type="submit" className="theme-btn w-100" style={{ padding: '1rem', fontSize: '1.1rem', border: 'none' }}>
                  Lock Funds <i className="fas fa-lock"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
    </DashboardLayout>
  );
};

export default SafeLockOnboarding;
