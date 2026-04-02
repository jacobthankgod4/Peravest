import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

const PaymentVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('');
  const [investmentDetails, setInvestmentDetails] = useState<any>(null);

  const reference = searchParams.get('reference');

  useEffect(() => {
    verifyPayment();
  }, [reference]);

  const verifyPayment = async () => {
    if (!reference) {
      setStatus('failed');
      setMessage('Invalid payment reference');
      return;
    }

    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage('Payment verified successfully');
        setInvestmentDetails(data.investment);
        setTimeout(() => navigate('/dashboard'), 5000);
      } else {
        setStatus('failed');
        setMessage(data.message || 'Payment verification failed');
      }
    } catch (err) {
      setStatus('failed');
      setMessage('Network error. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            {investmentDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Investment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property:</span>
                    <span className="font-medium">{investmentDetails.propertyTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₦{investmentDetails.amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{investmentDetails.duration} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected ROI:</span>
                    <span className="font-medium text-green-600">{investmentDetails.roi}%</span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 mb-4">Redirecting to dashboard...</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/listings')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Browse Properties
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="w-full text-blue-600 hover:text-blue-700 font-medium"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentVerification;
