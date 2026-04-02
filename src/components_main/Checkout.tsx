import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ajoService } from '../services/ajoService';
import { targetSavingsService } from '../services/targetSavingsService';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  
  const stateData = location.state as any;
  const isAjo = stateData?.type === 'ajo';
  const isTargetSavings = stateData?.type === 'target-savings';
  
  const amount = isAjo ? stateData.firstPayment : isTargetSavings ? stateData.firstPayment : 0;
  const vat = amount * 0.075;
  const total = amount + vat;

  useEffect(() => {
    if (!stateData) {
      navigate('/listings');
      return;
    }
    
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    
    setPaymentConfig({
      reference: `${isAjo ? 'AJO' : 'TS'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userEmail,
      amount: total * 100,
      publicKey: 'pk_test_a128e776b95286af35323901ac125129d5326736'
    });
  }, [stateData, total]);
  
  const handlePaymentSuccess = async (reference: any) => {
    try {
      if (isAjo) {
        await ajoService.createAjo({
          ...stateData,
          paymentReference: reference.reference,
          firstPayment: amount
        });
        navigate('/dashboard?success=ajo');
      } else if (isTargetSavings) {
        await targetSavingsService.createTargetSavings({
          ...stateData,
          paymentReference: reference.reference,
          firstPayment: amount
        });
        navigate('/dashboard?success=target-savings');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Failed to process payment. Please contact support.');
    }
  };

  if (!stateData || !paymentConfig) {
    return <div>Loading...</div>;
  }

  return (
    <main className="main" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <div className="checkout-area py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, #09c398 0%, #08a57d 100%)', padding: '2rem', color: '#fff' }}>
                  <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>
                    {isAjo ? 'Ajo Savings' : 'Target Savings'} Summary
                  </h2>
                  <p style={{ margin: 0, opacity: 0.9 }}>Review your details and complete payment</p>
                </div>

                <div style={{ padding: '2rem', display: 'flex', gap: '2rem' }}>
                  <div style={{ flex: '1' }}>
                    <div style={{ background: '#f8f9fa', borderRadius: '15px', padding: '1.5rem' }}>
                      {isAjo && (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div>
                              <div style={{ color: '#757f95', fontSize: '0.875rem' }}>Type</div>
                              <div style={{ color: '#0e2e50', fontWeight: 600 }}>{stateData.ajoType === 'group' ? 'Group' : 'Personal'}</div>
                            </div>
                            <div>
                              <div style={{ color: '#757f95', fontSize: '0.875rem' }}>Contribution</div>
                              <div style={{ color: '#0e2e50', fontWeight: 600 }}>₦{Number(stateData.contributionAmount).toLocaleString()}</div>
                            </div>
                            <div>
                              <div style={{ color: '#757f95', fontSize: '0.875rem' }}>Duration</div>
                              <div style={{ color: '#0e2e50', fontWeight: 600 }}>{stateData.duration} months</div>
                            </div>
                          </div>
                        </>
                      )}
                      {isTargetSavings && (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div>
                              <div style={{ color: '#757f95', fontSize: '0.875rem' }}>Goal</div>
                              <div style={{ color: '#0e2e50', fontWeight: 600 }}>{stateData.goalName}</div>
                            </div>
                            <div>
                              <div style={{ color: '#757f95', fontSize: '0.875rem' }}>Target</div>
                              <div style={{ color: '#0e2e50', fontWeight: 600 }}>₦{Number(stateData.targetAmount).toLocaleString()}</div>
                            </div>
                            <div>
                              <div style={{ color: '#757f95', fontSize: '0.875rem' }}>Duration</div>
                              <div style={{ color: '#0e2e50', fontWeight: 600 }}>{stateData.duration} months</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: '#f8f9fa', borderRadius: '15px', padding: '1.5rem' }}>
                      <h5 style={{ color: '#0e2e50', marginBottom: '1rem' }}>Payment Summary</h5>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ color: '#757f95' }}>First Payment:</span>
                        <span style={{ color: '#0e2e50', fontWeight: 600 }}>₦{amount.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: '#757f95' }}>VAT (7.5%):</span>
                        <span style={{ color: '#0e2e50', fontWeight: 600 }}>₦{vat.toLocaleString()}</span>
                      </div>
                      <div style={{ borderTop: '2px solid #dee2e6', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#0e2e50', fontSize: '1.1rem', fontWeight: 700 }}>Total:</span>
                        <span style={{ color: '#09c398', fontSize: '1.5rem', fontWeight: 700 }}>₦{total.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!(window as any).PaystackPop) {
                          alert('Payment system loading...');
                          return;
                        }
                        
                        const handler = (window as any).PaystackPop.setup({
                          key: paymentConfig.publicKey,
                          email: paymentConfig.email,
                          amount: paymentConfig.amount,
                          ref: paymentConfig.reference,
                          callback: (response: any) => {
                            handlePaymentSuccess(response);
                          }
                        });
                        handler.openIframe();
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #09c398 0%, #08a57d 100%)',
                        border: 'none',
                        padding: '1.5rem',
                        borderRadius: '15px',
                        color: '#fff',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      <i className="fas fa-lock"></i> Pay Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
