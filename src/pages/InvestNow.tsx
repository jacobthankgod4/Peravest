import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useInvestment } from '../hooks/useInvestment';
import { useInvestmentCalculator } from '../hooks/useInvestmentCalculator';
import { investmentService } from '../services/investmentService';

const InvestNow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { setInvestmentData } = useInvestment();
  const { calculateReturns, validateAmount } = useInvestmentCalculator();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState(6);
  const [validationError, setValidationError] = useState('');

  const { packageId, packageName, duration, roi, minAmount, maxAmount, propertyTitle, propertyImage, propertyAddress } = (location.state as any) || {};

  useEffect(() => {
    if (!isAuthenticated) {
      // Store the current path to return after login
      navigate('/login', { state: { from: location } });
      return;
    }
    checkInvestmentEligibility();
  }, [isAuthenticated, id, navigate, location]);

  useEffect(() => {
    if (minAmount) {
      setAmount(minAmount.toString());
    }
    if (duration) {
      setPeriod(duration);
    }
  }, [minAmount, duration]);

  const checkInvestmentEligibility = async () => {
    if (!id) {
      setError('Invalid property selection');
      setChecking(false);
      return;
    }

    try {
      const isDuplicate = await investmentService.checkDuplicateInvestment(id);
      if (isDuplicate) {
        setError('You already have an active investment in this property');
        setChecking(false);
        return;
      }
      setChecking(false);
    } catch (err) {
      setError('Network error. Please try again.');
      setChecking(false);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numValue = Number(value);
    
    if (numValue < (minAmount || 5000)) {
      setValidationError(`Minimum investment is ₦${(minAmount || 5000).toLocaleString()}`);
      return;
    }
    
    if (maxAmount && numValue > maxAmount) {
      setValidationError(`Maximum investment is ₦${maxAmount.toLocaleString()}`);
      return;
    }
    
    setValidationError('');
  };

  const handleInvest = () => {
    const validation = validateAmount(Number(amount));
    if (!validation.isValid) {
      setValidationError(validation.error || '');
      return;
    }
    
    // Navigate to checkout with investment data in state
    navigate('/checkout', {
      state: {
        type: 'property',
        propertyId: id,
        packageId: packageId,
        packageName: packageName,
        amount: Number(amount),
        duration: duration || period,
        roi: roi,
        propertyTitle: propertyTitle,
        propertyImage: propertyImage,
        propertyAddress: propertyAddress,
        firstPayment: Number(amount)
      }
    });
  };

  if (checking) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '3px solid rgba(9, 195, 152, 0.3)', borderTop: '3px solid #09c398', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '20px', color: '#a0a0b0', fontSize: '14px' }}>Verifying investment eligibility...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '500px', width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '40px', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: '48px', color: '#f59e0b', marginBottom: '20px', display: 'block' }}></i>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '15px' }}>Investment Not Available</h2>
          <p style={{ color: '#a0a0b0', marginBottom: '30px', fontSize: '14px' }}>{error}</p>
          <button onClick={() => navigate('/listings')} style={{ width: '100%', padding: '12px 24px', background: 'linear-gradient(135deg, #09c398 0%, #06a876 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(9, 195, 152, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>Browse Other Properties</button>
        </div>
      </div>
    );
  }

  const calculateLocalReturns = (amount: number) => {
    const roiPercent = roi || 10;
    const interest = (amount * roiPercent) / 100;
    return {
      principal: amount,
      interest: interest,
      totalReturns: amount + interest,
      roi: roiPercent
    };
  };

  const calculation = amount ? calculateLocalReturns(Number(amount)) : null;

  return (
    <div style={{ background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)', minHeight: '100vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '40px', backdropFilter: 'blur(10px)' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#fff', marginBottom: '30px', textAlign: 'center' }}>Invest Now</h2>
          
          {propertyTitle && (
            <div style={{ 
              background: 'rgba(9, 195, 152, 0.1)', 
              border: '1px solid rgba(9, 195, 152, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              display: 'flex',
              gap: '16px',
              alignItems: 'center'
            }}>
              {propertyImage && (
                <img 
                  src={propertyImage} 
                  alt={propertyTitle}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div>
                <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '4px', fontWeight: 600 }}>
                  {propertyTitle}
                </h3>
                {propertyAddress && (
                  <p style={{ color: '#a0a0b0', fontSize: '13px', margin: '0 0 8px 0' }}>
                    {propertyAddress}
                  </p>
                )}
                  <p style={{ color: '#09c398', fontSize: '14px', margin: 0, fontWeight: 600 }}>
                    Package: {packageName} | Duration: {duration} months | ROI: {roi}%
                  </p>
              </div>
            </div>
          )}
          
          <div style={{ display: 'grid', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Investment Amount (₦)</label>
              <input type="number" value={amount} onChange={(e) => handleAmountChange(e.target.value)} placeholder={`Enter amount (₦${(minAmount || 5000).toLocaleString()} - ₦${(maxAmount || 50000).toLocaleString()})`} style={{ width: '100%', padding: '12px 15px', background: 'rgba(255, 255, 255, 0.08)', border: validationError ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#fff', fontSize: '14px', boxSizing: 'border-box', transition: 'all 0.3s' }} onFocus={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.12)'; e.target.style.borderColor = '#09c398'; }} onBlur={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.08)'; e.target.style.borderColor = validationError ? '#ef4444' : 'rgba(255, 255, 255, 0.15)'; }} />
              {validationError && <p style={{ marginTop: '8px', fontSize: '12px', color: '#ef4444' }}>{validationError}</p>}
            </div>

            <div>
              <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Investment Duration</label>
              <input 
                type="text" 
                value={`${duration || period} Months`} 
                readOnly
                style={{ width: '100%', padding: '12px 15px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            {calculation && (
              <div style={{ background: 'rgba(9, 195, 152, 0.1)', border: '1px solid rgba(9, 195, 152, 0.3)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <i className="fas fa-chart-line" style={{ color: '#09c398', marginRight: '10px', fontSize: '18px' }}></i>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#09c398', margin: 0 }}>Investment Returns</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '14px' }}>
                  <div>
                    <p style={{ color: '#a0a0b0', margin: '0 0 8px 0' }}>Principal Amount:</p>
                    <p style={{ fontWeight: 600, color: '#fff', margin: 0 }}>₦{(calculation.principal || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ color: '#a0a0b0', margin: '0 0 8px 0' }}>Interest Earned:</p>
                    <p style={{ fontWeight: 600, color: '#09c398', margin: 0 }}>₦{(calculation.interest || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ color: '#a0a0b0', margin: '0 0 8px 0' }}>Total Returns:</p>
                    <p style={{ fontWeight: 700, color: '#09c398', fontSize: '16px', margin: 0 }}>₦{calculation.totalReturns.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ color: '#a0a0b0', margin: '0 0 8px 0' }}>ROI:</p>
                    <p style={{ fontWeight: 600, color: '#09c398', margin: 0 }}>{calculation.roi}%</p>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <button onClick={handleInvest} disabled={!amount || !!validationError} style={{ padding: '12px 24px', background: !amount || validationError ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #09c398 0%, #06a876 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: !amount || validationError ? 'not-allowed' : 'pointer', transition: 'all 0.3s', opacity: !amount || validationError ? 0.5 : 1 }} onMouseEnter={(e) => { if (!amount || validationError) return; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(9, 195, 152, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>Proceed to Payment</button>
              <button onClick={() => navigate('/listings')} style={{ padding: '12px 24px', background: 'transparent', color: '#09c398', border: '2px solid #09c398', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#09c398'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#09c398'; }}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestNow;
