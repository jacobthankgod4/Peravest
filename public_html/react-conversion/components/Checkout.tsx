import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaystackButton } from 'react-paystack';
import { usePaystack } from '../hooks/usePaystack';
import { paymentService } from '../services/paymentService';

interface CheckoutProps {
  investmentData?: {
    amount: number;
    propertyId: number;
    period: number;
    calculation: {
      roi: number;
      totalReturns: number;
    };
  };
}

const Checkout: React.FC<CheckoutProps> = ({ investmentData }) => {
  const navigate = useNavigate();
  const { initializePayment, loading } = usePaystack();
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  
  const amount = investmentData?.amount || 0;
  const vat = amount * 0.075; // 7.5% VAT
  const total = amount + vat;

  useEffect(() => {
    if (!investmentData) {
      navigate('/listings');
      return;
    }
    
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    
    setPaymentConfig({
      reference: `INV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userEmail,
      amount: total * 100, // Convert to kobo
      publicKey: paymentService.getPaystackPublicKey(),
      text: 'Pay Now',
      onSuccess: handlePaymentSuccess,
      onClose: handlePaymentClose
    });
  }, [investmentData, total]);
  
  const handlePaymentSuccess = async (reference: any) => {
    try {
      const response = await fetch('/api/investments/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...investmentData,
          paymentReference: reference.reference,
          totalAmount: total
        })
      });
      
      if (response.ok) {
        navigate('/payment/verify?reference=' + reference.reference);
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
    }
  };
  
  const handlePaymentClose = () => {
    console.log('Payment closed');
  };

  if (!investmentData || !paymentConfig) {
    return <div>Loading...</div>;
  }

  return (
    <main className="main">
      <div className="site-breadcrumb" style={{background: 'url(assets/img/breadcrumb/01.jpg)'}}>
        <div className="container">
          <h2 className="breadcrumb-title">Checkout</h2>
          <ul className="breadcrumb-menu">
            <li><a href="/">Home</a></li>
            <li className="active">Checkout</li>
          </ul>
        </div>
      </div>

      <div className="checkout-area pt-120 pb-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="checkout-wrapper">
                <h3>Investment Summary</h3>
                <div className="investment-details mb-4">
                  <h6>Investment Details:</h6>
                  <p>Period: {investmentData.period} months</p>
                  <p>Expected ROI: {investmentData.calculation.roi}%</p>
                  <p>Expected Returns: ₦{investmentData.calculation.totalReturns.toLocaleString()}</p>
                </div>
                
                <div className="checkout-payment">
                  <h4>Payment Method</h4>
                  <div className="payment-method">
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="payment" id="paystack" defaultChecked />
                      <label className="form-check-label" htmlFor="paystack">
                        <img src="assets/img/payment/paystack.png" alt="Paystack" />
                        Pay with Paystack
                      </label>
                    </div>
                  </div>
                </div>

                <PaystackButton 
                  {...paymentConfig}
                  className="theme-btn w-100 mt-4"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-lg-4">
              <div className="checkout-sidebar">
                <div className="checkout-summary">
                  <h4>Order Summary</h4>
                  <ul className="checkout-summary-list">
                    <li>
                      Investment Cost: 
                      <span>₦{amount.toLocaleString()}</span>
                    </li>
                    <li>
                      VAT (7.5%): 
                      <span>₦{vat.toLocaleString()}</span>
                    </li>
                    <li className="order-total">
                      You Pay: 
                      <span>₦{total.toLocaleString()}</span>
                    </li>
                  </ul>
                </div>

                <div className="checkout-info mt-4">
                  <h5>Secure Payment</h5>
                  <p>Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.</p>
                  
                  <div className="security-badges mt-3">
                    <img src="assets/img/security/ssl.png" alt="SSL Secure" />
                    <img src="assets/img/security/paystack-verified.png" alt="Paystack Verified" />
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