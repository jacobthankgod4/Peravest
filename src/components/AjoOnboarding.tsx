import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';

const AjoOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [ajoType, setAjoType] = useState<'group' | 'personal'>('group');
  const [formData, setFormData] = useState({
    contributionAmount: '',
    frequency: 'monthly',
    duration: '12',
    startDate: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTypeSelect = (type: 'group' | 'personal') => {
    setAjoType(type);
    setStep('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate first payment amount based on frequency
    const firstPayment = Number(formData.contributionAmount);
    const totalCommitment = firstPayment * Number(formData.duration);
    
    // Navigate to checkout with Ajo data
    navigate('/checkout', {
      state: {
        type: 'ajo',
        ajoType: ajoType,
        contributionAmount: firstPayment,
        frequency: formData.frequency,
        duration: Number(formData.duration),
        startDate: formData.startDate,
        totalCommitment: totalCommitment,
        firstPayment: firstPayment
      }
    });
  };

  if (step === 'select') {
    return (
      <DashboardLayout title="Ajo Savings Setup">
        <main className="main">
          <div className="container py-120">
            <div className="row">
              <div className="col-lg-10 mx-auto">
                <div className="text-center mb-5">
                  <h2 style={{ color: '#0e2e50', marginBottom: '0.75rem', fontSize: '2.5rem', fontWeight: 700 }}>Start Your Ajo Journey</h2>
                  <p style={{ color: '#757f95', fontSize: '1.1rem' }}>Choose how you want to save with Ajo</p>
                </div>
                
                <div className="text-center mb-5">
                  <span style={{ background: 'linear-gradient(135deg, #09c398 0%, #08a57d 100%)', color: '#fff', padding: '0.5rem 1.5rem', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Step 1 of 2</span>
                  <h3 style={{ color: '#0e2e50', marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.75rem', fontWeight: 700 }}>Choose Your Ajo Type</h3>
                  <p style={{ color: '#757f95', fontSize: '1rem' }}>Select the savings plan that best fits your goals</p>
                </div>
              
              <div className="row g-4 mb-5">
                <div className="col-md-6">
                  <div 
                    onClick={() => handleTypeSelect('group')}
                    style={{ 
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', 
                      padding: '3rem 2rem', 
                      borderRadius: '20px', 
                      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '2px solid transparent',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 20px 60px rgba(9, 195, 152, 0.2)';
                      e.currentTarget.style.borderColor = '#09c398';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'linear-gradient(135deg, #09c398 0%, #08a57d 100%)', borderRadius: '50%', opacity: 0.1 }}></div>
                    <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
                      <div style={{ width: '80px', height: '80px', margin: '0 auto', background: 'linear-gradient(135deg, #09c398 0%, #08a57d 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(9, 195, 152, 0.3)' }}>
                        <i className="fas fa-users" style={{ fontSize: '2.5rem', color: '#fff' }}></i>
                      </div>
                    </div>
                    <h3 style={{ color: '#0e2e50', textAlign: 'center', marginBottom: '1rem', fontSize: '1.75rem', fontWeight: 700 }}>Group Contributions</h3>
                    <p style={{ color: '#757f95', textAlign: 'center', marginBottom: '2rem', lineHeight: '1.6' }}>Join a savings circle with other members and take turns receiving payouts</p>
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', background: '#eaf7f4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                          <i className="fas fa-check" style={{ color: '#09c398', fontSize: '0.875rem' }}></i>
                        </div>
                        <span style={{ color: '#0e2e50', fontWeight: 500 }}>Rotating payouts</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', background: '#eaf7f4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                          <i className="fas fa-check" style={{ color: '#09c398', fontSize: '0.875rem' }}></i>
                        </div>
                        <span style={{ color: '#0e2e50', fontWeight: 500 }}>Community support</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', background: '#eaf7f4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                          <i className="fas fa-check" style={{ color: '#09c398', fontSize: '0.875rem' }}></i>
                        </div>
                        <span style={{ color: '#0e2e50', fontWeight: 500 }}>Fixed schedule</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ color: '#09c398', fontWeight: 600, fontSize: '0.875rem' }}>SELECT THIS PLAN <i className="fas fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i></span>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div 
                    onClick={() => handleTypeSelect('personal')}
                    style={{ 
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', 
                      padding: '3rem 2rem', 
                      borderRadius: '20px', 
                      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '2px solid transparent',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 20px 60px rgba(13, 110, 253, 0.2)';
                      e.currentTarget.style.borderColor = '#0d6efd';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)', borderRadius: '50%', opacity: 0.1 }}></div>
                    <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
                      <div style={{ width: '80px', height: '80px', margin: '0 auto', background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(13, 110, 253, 0.3)' }}>
                        <i className="fas fa-user" style={{ fontSize: '2.5rem', color: '#fff' }}></i>
                      </div>
                    </div>
                    <h3 style={{ color: '#0e2e50', textAlign: 'center', marginBottom: '1rem', fontSize: '1.75rem', fontWeight: 700 }}>Personal Ajo</h3>
                    <p style={{ color: '#757f95', textAlign: 'center', marginBottom: '2rem', lineHeight: '1.6' }}>Save individually at your own pace with flexible withdrawal options</p>
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', background: '#e7f1ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                          <i className="fas fa-check" style={{ color: '#0d6efd', fontSize: '0.875rem' }}></i>
                        </div>
                        <span style={{ color: '#0e2e50', fontWeight: 500 }}>Flexible withdrawals</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', background: '#e7f1ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                          <i className="fas fa-check" style={{ color: '#0d6efd', fontSize: '0.875rem' }}></i>
                        </div>
                        <span style={{ color: '#0e2e50', fontWeight: 500 }}>Personal control</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', background: '#e7f1ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                          <i className="fas fa-check" style={{ color: '#0d6efd', fontSize: '0.875rem' }}></i>
                        </div>
                        <span style={{ color: '#0e2e50', fontWeight: 500 }}>Your own schedule</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ color: '#0d6efd', fontWeight: 600, fontSize: '0.875rem' }}>SELECT THIS PLAN <i className="fas fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Ajo Savings Setup">
      <main className="main">
        <div className="container py-120">
        <div className="row">
          <div className="col-lg-7 mx-auto">
            <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', padding: '3rem', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
              <div style={{ marginBottom: '2.5rem' }}>
                <span style={{ background: 'linear-gradient(135deg, #09c398 0%, #08a57d 100%)', color: '#fff', padding: '0.5rem 1.5rem', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Step 2 of 2</span>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                  <button 
                    onClick={() => setStep('select')} 
                    style={{ background: '#f8f9fa', border: 'none', cursor: 'pointer', marginRight: '1rem', fontSize: '1.1rem', color: '#0e2e50', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e9ecef'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  >
                    <i className="fas fa-arrow-left"></i>
                  </button>
                  <div>
                    <h2 style={{ color: '#0e2e50', marginBottom: '0.25rem', fontSize: '2rem', fontWeight: 700 }}>{ajoType === 'group' ? 'Group' : 'Personal'} Ajo Setup</h2>
                    <p style={{ color: '#757f95', margin: 0 }}>Configure your Ajo savings plan</p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-4">
                  <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block', color: '#0e2e50', fontSize: '0.95rem' }}>
                    <i className="fas fa-money-bill-wave" style={{ marginRight: '0.5rem', color: '#09c398' }}></i>
                    Monthly Contribution Amount
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#757f95', fontWeight: 600 }}>₦</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="5,000"
                      value={formData.contributionAmount}
                      onChange={(e) => setFormData({...formData, contributionAmount: e.target.value})}
                      required
                      min="5000"
                      style={{ padding: '1rem 1rem 1rem 2.5rem', borderRadius: '12px', border: '2px solid #e9ecef', fontSize: '1.1rem', fontWeight: 600, transition: 'all 0.3s' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#09c398'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
                    />
                  </div>
                  <small style={{ color: '#757f95', marginTop: '0.5rem', display: 'block' }}>Minimum: ₦5,000</small>
                </div>

                <div className="form-group mb-4">
                  <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block', color: '#0e2e50', fontSize: '0.95rem' }}>
                    <i className="fas fa-calendar-alt" style={{ marginRight: '0.5rem', color: '#09c398' }}></i>
                    Payment Frequency
                  </label>
                  <select
                    className="form-control"
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    style={{ padding: '1rem', borderRadius: '12px', border: '2px solid #e9ecef', fontSize: '1rem', fontWeight: 500, transition: 'all 0.3s' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#09c398'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="form-group mb-4">
                  <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block', color: '#0e2e50', fontSize: '0.95rem' }}>
                    <i className="fas fa-clock" style={{ marginRight: '0.5rem', color: '#09c398' }}></i>
                    Duration (Months)
                  </label>
                  <select
                    className="form-control"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    style={{ padding: '1rem', borderRadius: '12px', border: '2px solid #e9ecef', fontSize: '1rem', fontWeight: 500, transition: 'all 0.3s' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#09c398'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
                  >
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                    <option value="24">24 Months</option>
                  </select>
                </div>

                <div className="form-group mb-4">
                  <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block', color: '#0e2e50', fontSize: '0.95rem' }}>
                    <i className="fas fa-calendar-check" style={{ marginRight: '0.5rem', color: '#09c398' }}></i>
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                    style={{ padding: '1rem', borderRadius: '12px', border: '2px solid #e9ecef', fontSize: '1rem', fontWeight: 500, transition: 'all 0.3s', cursor: 'text' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#09c398'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
                  />
                </div>

                <button 
                  type="submit" 
                  className="theme-btn w-100" 
                  style={{ 
                    padding: '1.25rem', 
                    fontSize: '1.1rem', 
                    border: 'none', 
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #09c398 0%, #08a57d 100%)',
                    fontWeight: 700,
                    boxShadow: '0 10px 30px rgba(9, 195, 152, 0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(9, 195, 152, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(9, 195, 152, 0.3)';
                  }}
                >
                  Create Ajo Savings <i className="far fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i>
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

export default AjoOnboarding;
