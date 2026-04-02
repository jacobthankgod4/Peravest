import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';

const TargetSavingsOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [savingsType, setSavingsType] = useState<'goal' | 'emergency'>('goal');
  const [formData, setFormData] = useState({
    goalName: '',
    targetAmount: '',
    frequency: 'monthly',
    monthlyAmount: '',
    duration: ''
  });

  // Auto-calculate monthly amount when target amount or duration changes
  useEffect(() => {
    if (formData.targetAmount && formData.duration) {
      const target = Number(formData.targetAmount);
      const months = Number(formData.duration);
      const calculatedAmount = Math.ceil(target / months);
      setFormData(prev => ({ ...prev, monthlyAmount: calculatedAmount.toString() }));
    }
  }, [formData.targetAmount, formData.duration]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTypeSelect = (type: 'goal' | 'emergency') => {
    setSavingsType(type);
    setStep('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const firstPayment = Number(formData.monthlyAmount);
    
    navigate('/checkout', {
      state: {
        type: 'target-savings',
        savingsType: savingsType,
        goalName: formData.goalName,
        targetAmount: Number(formData.targetAmount),
        frequency: formData.frequency,
        monthlyAmount: firstPayment,
        duration: Number(formData.duration),
        firstPayment: firstPayment
      }
    });
  };

  if (step === 'select') {
    return (
      <DashboardLayout title="Target Savings Setup">
        <main className="main">
          <div className="container py-120">
            <div className="row">
              <div className="col-lg-10 mx-auto">
                <div className="text-center mb-5">
                  <h2 style={{ color: '#0e2e50', marginBottom: '0.75rem', fontSize: '2.5rem', fontWeight: 700 }}>Create Your Savings Goal</h2>
                  <p style={{ color: '#757f95', fontSize: '1.1rem' }}>Choose how you want to save and reach your financial goals</p>
                </div>
                
                <div className="text-center mb-5">
                  <span style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)', color: '#fff', padding: '0.5rem 1.5rem', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Step 1 of 2</span>
                  <h3 style={{ color: '#0e2e50', marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.75rem', fontWeight: 700 }}>Choose Your Savings Type</h3>
                  <p style={{ color: '#757f95', fontSize: '1rem' }}>Select the savings plan that best fits your goals</p>
                </div>
              
              <div className="row g-4 mb-5">
                <div className="col-md-6">
                  <div 
                    onClick={() => handleTypeSelect('goal')}
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
                        <i className="fas fa-bullseye" style={{ fontSize: '2.5rem', color: '#fff' }}></i>
                      </div>
                    </div>
                    <h3 style={{ color: '#0e2e50', textAlign: 'center', marginBottom: '1rem', fontSize: '1.75rem', fontWeight: 700 }}>Goal-Based Savings</h3>
                    <p style={{ color: '#757f95', textAlign: 'center', marginBottom: '2rem', lineHeight: '1.6' }}>Save towards specific goals like vacation, car, wedding, or education</p>
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', background: '#e7f1ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                          <i className="fas fa-check" style={{ color: '#0d6efd', fontSize: '0.875rem' }}></i>
                        </div>
                        <span style={{ color: '#0e2e50', fontWeight: 500 }}>Custom goal naming</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', background: '#e7f1ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                          <i className="fas fa-check" style={{ color: '#0d6efd', fontSize: '0.875rem' }}></i>
                        </div>
                        <span style={{ color: '#0e2e50', fontWeight: 500 }}>Flexible target amount</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', background: '#e7f1ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                          <i className="fas fa-check" style={{ color: '#0d6efd', fontSize: '0.875rem' }}></i>
                        </div>
                        <span style={{ color: '#0e2e50', fontWeight: 500 }}>Progress tracking</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ color: '#0d6efd', fontWeight: 600, fontSize: '0.875rem' }}>SELECT THIS PLAN <i className="fas fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i></span>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div 
                    onClick={() => handleTypeSelect('emergency')}
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
                      e.currentTarget.style.boxShadow = '0 20px 60px rgba(220, 53, 69, 0.2)';
                      e.currentTarget.style.borderColor = '#dc3545';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', borderRadius: '50%', opacity: 0.1 }}></div>
                    <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
                      <div style={{ width: '80px', height: '80px', margin: '0 auto', background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(220, 53, 69, 0.3)' }}>
                        <i className="fas fa-shield-alt" style={{ fontSize: '2.5rem', color: '#fff' }}></i>
                      </div>
                    </div>
                    <h3 style={{ color: '#0e2e50', textAlign: 'center', marginBottom: '1rem', fontSize: '1.75rem', fontWeight: 700 }}>Emergency Fund</h3>
                    <p style={{ color: '#757f95', textAlign: 'center', marginBottom: '2rem', lineHeight: '1.6' }}>Build a safety net for unexpected expenses and financial emergencies</p>
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', background: '#f8d7da', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                          <i className="fas fa-check" style={{ color: '#dc3545', fontSize: '0.875rem' }}></i>
                        </div>
                        <span style={{ color: '#0e2e50', fontWeight: 500 }}>Quick access funds</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', background: '#f8d7da', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                          <i className="fas fa-check" style={{ color: '#dc3545', fontSize: '0.875rem' }}></i>
                        </div>
                        <span style={{ color: '#0e2e50', fontWeight: 500 }}>Financial security</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', background: '#f8d7da', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                          <i className="fas fa-check" style={{ color: '#dc3545', fontSize: '0.875rem' }}></i>
                        </div>
                        <span style={{ color: '#0e2e50', fontWeight: 500 }}>Peace of mind</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ color: '#dc3545', fontWeight: 600, fontSize: '0.875rem' }}>SELECT THIS PLAN <i className="fas fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i></span>
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
    <DashboardLayout title="Target Savings Setup">
      <main className="main">
        <div className="container py-120">
        <div className="row">
          <div className="col-lg-7 mx-auto">
            <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', padding: '3rem', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
              <div style={{ marginBottom: '2.5rem' }}>
                <span style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)', color: '#fff', padding: '0.5rem 1.5rem', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Step 2 of 2</span>
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
                    <h2 style={{ color: '#0e2e50', marginBottom: '0.25rem', fontSize: '2rem', fontWeight: 700 }}>{savingsType === 'goal' ? 'Goal-Based' : 'Emergency Fund'} Setup</h2>
                    <p style={{ color: '#757f95', margin: 0 }}>Configure your savings plan</p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-4">
                  <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block', color: '#0e2e50', fontSize: '0.95rem' }}>
                    <i className="fas fa-tag" style={{ marginRight: '0.5rem', color: '#0d6efd' }}></i>
                    {savingsType === 'goal' ? 'Goal Name' : 'Fund Name'}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={savingsType === 'goal' ? 'e.g., New Car, Vacation' : 'e.g., Emergency Fund'}
                    value={formData.goalName}
                    onChange={(e) => setFormData({...formData, goalName: e.target.value})}
                    required
                    style={{ padding: '1rem', borderRadius: '12px', border: '2px solid #e9ecef', fontSize: '1rem', fontWeight: 500, transition: 'all 0.3s' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#0d6efd'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
                  />
                </div>

                <div className="form-group mb-4">
                  <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block', color: '#0e2e50', fontSize: '0.95rem' }}>
                    <i className="fas fa-money-bill-wave" style={{ marginRight: '0.5rem', color: '#0d6efd' }}></i>
                    Target Amount
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#757f95', fontWeight: 600 }}>₦</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="10,000"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                      required
                      min="10000"
                      style={{ padding: '1rem 1rem 1rem 2.5rem', borderRadius: '12px', border: '2px solid #e9ecef', fontSize: '1.1rem', fontWeight: 600, transition: 'all 0.3s' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0d6efd'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
                    />
                  </div>
                  <small style={{ color: '#757f95', marginTop: '0.5rem', display: 'block' }}>Minimum: ₦10,000</small>
                </div>

                <div className="form-group mb-4">
                  <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block', color: '#0e2e50', fontSize: '0.95rem' }}>
                    <i className="fas fa-calendar-alt" style={{ marginRight: '0.5rem', color: '#0d6efd' }}></i>
                    Savings Frequency
                  </label>
                  <select
                    className="form-control"
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    style={{ padding: '1rem', borderRadius: '12px', border: '2px solid #e9ecef', fontSize: '1rem', fontWeight: 500, transition: 'all 0.3s' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#0d6efd'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="form-group mb-4">
                  <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block', color: '#0e2e50', fontSize: '0.95rem' }}>
                    <i className="fas fa-coins" style={{ marginRight: '0.5rem', color: '#0d6efd' }}></i>
                    Amount Per Contribution (Auto-calculated)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#757f95', fontWeight: 600 }}>₦</span>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.monthlyAmount}
                      readOnly
                      style={{ padding: '1rem 1rem 1rem 2.5rem', borderRadius: '12px', border: '2px solid #e9ecef', fontSize: '1.1rem', fontWeight: 600, backgroundColor: '#f8f9fa', color: '#495057' }}
                    />
                  </div>
                  <small style={{ color: '#757f95', marginTop: '0.5rem', display: 'block' }}>Calculated based on target amount and duration</small>
                </div>

                <div className="form-group mb-4">
                  <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block', color: '#0e2e50', fontSize: '0.95rem' }}>
                    <i className="fas fa-clock" style={{ marginRight: '0.5rem', color: '#0d6efd' }}></i>
                    Duration (Months)
                  </label>
                  <select
                    className="form-control"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    required
                    style={{ padding: '1rem', borderRadius: '12px', border: '2px solid #e9ecef', fontSize: '1rem', fontWeight: 500, transition: 'all 0.3s' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#0d6efd'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
                  >
                    <option value="">Select Duration</option>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                    <option value="24">24 Months</option>
                    <option value="36">36 Months</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="theme-btn w-100" 
                  style={{ 
                    padding: '1.25rem', 
                    fontSize: '1.1rem', 
                    border: 'none', 
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                    fontWeight: 700,
                    boxShadow: '0 10px 30px rgba(13, 110, 253, 0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(13, 110, 253, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(13, 110, 253, 0.3)';
                  }}
                >
                  Create Savings Plan <i className="far fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i>
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

export default TargetSavingsOnboarding;