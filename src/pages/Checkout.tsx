import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  const { user } = useAuth();
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  
  const stateData = location.state as any;
  const isAjo = stateData?.type === 'ajo';
  const isTargetSavings = stateData?.type === 'target-savings';
  const isProperty = stateData?.type === 'property';
  const isSafeLock = stateData?.type === 'safelock';
  
  const amount = isAjo ? stateData.firstPayment 
    : isTargetSavings ? stateData.firstPayment 
    : isProperty ? stateData.amount 
    : isSafeLock ? stateData.amount
    : 0;
  const vat = 0; // No VAT on investments
  const total = amount + vat;
  const isTestMode = paymentConfig?.publicKey?.includes('pk_test');
  const exceedsTestLimit = isTestMode && total > 50000;

  useEffect(() => {
    if (!stateData || !stateData.type) {
      alert('Invalid checkout session. Please try again.');
      navigate('/listings');
      return;
    }
    
    // User is guaranteed to be authenticated by ProtectedRoute
    const userEmail = user?.email;
    if (!userEmail) {
      console.error('User email not found');
      return;
    }
    
    setPaymentConfig({
      reference: `${isProperty ? 'PROP' : isAjo ? 'AJO' : isTargetSavings ? 'TS' : isSafeLock ? 'SL' : 'INV'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userEmail,
      amount: total * 100,
      publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || ''
    });
  }, [stateData, total, isProperty, isAjo, isTargetSavings, isSafeLock, user, navigate]);
  
  const handlePaymentSuccess = async (reference: any) => {
    setProcessing(true);
    try {
      if (isProperty) {
        const { supabase } = await import('../lib/supabase');
        const userId = user?.id;
        
        if (!userId) {
          throw new Error('User ID not found');
        }
        
        console.log('Inserting investment:', {
          Usa_Id: userId,
          proptee_id: stateData.propertyId,
          package_id: stateData.packageId,
          share_cost: amount,
          interest: stateData.roi,
          period: stateData.duration,
          start_date: new Date().toISOString(),
          payment_status: 'completed',
          payment_reference: reference.reference,
          status: 'active'
        });
        
        const { data, error } = await supabase.from('invest_now').insert({
          Usa_Id: userId,
          proptee_id: stateData.propertyId,
          package_id: stateData.packageId,
          share_cost: amount,
          interest: stateData.roi,
          period: stateData.duration,
          start_date: new Date().toISOString(),
          payment_status: 'completed',
          payment_reference: reference.reference,
          status: 'active'
        });
        
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        console.log('Investment created:', data);
        navigate('/dashboard?success=investment');
      } else if (isAjo) {
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
      } else if (isSafeLock) {
        const { supabase } = await import('../lib/supabase');
        const userId = user?.id;
        
        if (!userId) {
          throw new Error('User ID not found');
        }
        
        const { error } = await supabase.from('safelock').insert({
          user_id: userId,
          amount: amount,
          lock_period: stateData.lockPeriod,
          interest_rate: stateData.interestRate,
          maturity_amount: stateData.maturityAmount,
          start_date: new Date().toISOString(),
          payment_status: 'completed',
          payment_reference: reference.reference,
          status: 'active'
        });
        
        if (error) throw error;
        navigate('/dashboard?success=safelock');
      }
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        stateData,
        userId: user?.id,
        reference: reference?.reference
      });
      setProcessing(false);
      alert(`Failed to process payment. Error: ${error.message}\n\nReference: ${reference.reference}\n\nPlease contact support.`);
    }
  };

  if (!stateData || !paymentConfig) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '3px solid #09c398', borderTop: '3px solid transparent', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }}></div>
          <p>Loading checkout...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
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
                    {isProperty ? 'Property Investment' : isAjo ? 'Ajo Savings' : isTargetSavings ? 'Target Savings' : isSafeLock ? 'SafeLock' : 'Investment'} Summary
                  </h2>
                  <p style={{ margin: 0, opacity: 0.9 }}>Review your details and complete payment</p>
                </div>

                <div style={{ padding: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '300px' }}>
                    <div style={{ background: '#f8f9fa', borderRadius: '15px', padding: '1.5rem' }}>
                      {isProperty && (
                        <>
                          {stateData.propertyImage && (
                            <img src={stateData.propertyImage} alt={stateData.propertyTitle} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '1rem' }} />
                          )}
                          <h4 style={{ color: '#0e2e50', marginBottom: '1rem' }}>{stateData.propertyTitle}</h4>
                          <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                              <div style={{ color: '#757f95', fontSize: '0.875rem' }}>Package</div>
                              <div style={{ color: '#0e2e50', fontWeight: 600 }}>{stateData.packageName}</div>
                            </div>
                            <div>
                              <div style={{ color: '#757f95', fontSize: '0.875rem' }}>Investment Amount</div>
                              <div style={{ color: '#0e2e50', fontWeight: 600 }}>₦{Number(stateData.amount).toLocaleString()}</div>
                            </div>
                            <div>
                              <div style={{ color: '#757f95', fontSize: '0.875rem' }}>Duration</div>
                              <div style={{ color: '#0e2e50', fontWeight: 600 }}>{stateData.duration} months</div>
                            </div>
                            <div>
                              <div style={{ color: '#757f95', fontSize: '0.875rem' }}>Expected ROI</div>
                              <div style={{ color: '#09c398', fontWeight: 700, fontSize: '1.25rem' }}>{stateData.roi}%</div>
                            </div>
                            <div>
                              <div style={{ color: '#757f95', fontSize: '0.875rem' }}>Expected Returns</div>
                              <div style={{ color: '#09c398', fontWeight: 700, fontSize: '1.25rem' }}>₦{(Number(stateData.amount) * (1 + Number(stateData.roi) / 100)).toLocaleString()}</div>
                            </div>
                          </div>
                        </>
                      )}
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
                      {isSafeLock && (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div>
                              <div style={{ color: '#757f95', fontSize: '0.875rem' }}>Lock Amount</div>
                              <div style={{ color: '#0e2e50', fontWeight: 600 }}>₦{Number(stateData.amount).toLocaleString()}</div>
                            </div>
                            <div>
                              <div style={{ color: '#757f95', fontSize: '0.875rem' }}>Lock Period</div>
                              <div style={{ color: '#0e2e50', fontWeight: 600 }}>{stateData.lockPeriod} months</div>
                            </div>
                            <div>
                              <div style={{ color: '#757f95', fontSize: '0.875rem' }}>Interest Rate</div>
                              <div style={{ color: '#09c398', fontWeight: 700 }}>{stateData.interestRate}% p.a.</div>
                            </div>
                            <div>
                              <div style={{ color: '#757f95', fontSize: '0.875rem' }}>Maturity Amount</div>
                              <div style={{ color: '#09c398', fontWeight: 700, fontSize: '1.25rem' }}>₦{Number(stateData.maturityAmount).toLocaleString()}</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '300px' }}>
                    <div style={{ background: '#f8f9fa', borderRadius: '15px', padding: '1.5rem' }}>
                      <h5 style={{ color: '#0e2e50', marginBottom: '1rem' }}>Payment Summary</h5>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ color: '#757f95' }}>{isProperty ? 'Investment Amount' : 'First Payment'}:</span>
                        <span style={{ color: '#0e2e50', fontWeight: 600 }}>₦{amount.toLocaleString()}</span>
                      </div>
                      {vat > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <span style={{ color: '#757f95' }}>VAT (7.5%):</span>
                          <span style={{ color: '#0e2e50', fontWeight: 600 }}>₦{vat.toLocaleString()}</span>
                        </div>
                      )}
                      <div style={{ borderTop: '2px solid #dee2e6', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#0e2e50', fontSize: '1.1rem', fontWeight: 700 }}>Total:</span>
                        <span style={{ color: '#09c398', fontSize: '1.5rem', fontWeight: 700 }}>₦{total.toLocaleString()}</span>
                      </div>
                    </div>

                    {exceedsTestLimit && (
                      <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                          <i className="fas fa-exclamation-triangle" style={{ color: '#856404', fontSize: '1.25rem', marginTop: '0.125rem' }}></i>
                          <div>
                            <strong style={{ color: '#856404', display: 'block', marginBottom: '0.25rem' }}>Test Mode Limit</strong>
                            <small style={{ color: '#856404', lineHeight: '1.4' }}>Paystack test cards have a ₦50,000 limit. This ₦{total.toLocaleString()} transaction will fail in test mode. Use live keys for production.</small>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (processing) return;
                        
                        if (!(window as any).PaystackPop) {
                          alert('Payment system loading...');
                          return;
                        }
                        
                        if (!paymentConfig.publicKey) {
                          alert('Payment configuration error. Please refresh and try again.');
                          return;
                        }
                        
                        const handler = (window as any).PaystackPop.setup({
                          key: paymentConfig.publicKey,
                          email: paymentConfig.email,
                          amount: paymentConfig.amount,
                          ref: paymentConfig.reference,
                          callback: (response: any) => {
                            handlePaymentSuccess(response);
                          },
                          onClose: () => {
                            console.log('Payment dialog closed');
                          }
                        });
                        handler.openIframe();
                      }}
                      disabled={processing}
                      style={{
                        background: processing ? '#ccc' : 'linear-gradient(135deg, #09c398 0%, #08a57d 100%)',
                        border: 'none',
                        padding: '1.5rem',
                        borderRadius: '15px',
                        color: '#fff',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        cursor: processing ? 'not-allowed' : 'pointer',
                        width: '100%',
                        opacity: processing ? 0.7 : 1
                      }}
                    >
                      {processing ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-lock"></i> Pay Now
                        </>
                      )}
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
