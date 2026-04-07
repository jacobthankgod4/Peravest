import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatCurrency } from '../utils/ajoFormValidation';

export const AjoSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reference = searchParams.get('reference');
  const ajoType = searchParams.get('type');
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    // Simulate fetching payment details
    // In production, you might fetch from your backend
    if (reference && ajoType) {
      setPaymentDetails({
        reference,
        amount: 0, // This would come from your backend
        paidAt: new Date().toISOString(),
        email: '', // This would come from your backend
        transactionId,
      });
    }
    setIsLoading(false);
  }, [reference, ajoType, transactionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
            <p className="text-gray-600 mb-8">Something went wrong with your payment</p>
            <button
              onClick={() => navigate('/ajo/onboard')}
              className="px-8 py-3 bg-primary-green text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-4 animate-bounce">✅</div>
          <h1 className="text-4xl font-bold text-primary-green mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-600">
            Your {ajoType === 'group' ? 'Group Ajo' : 'Personal Ajo'} has been created
          </p>
        </div>

        {/* Confirmation Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Confirmation</h2>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Payment Reference</span>
              <span className="font-mono font-semibold text-gray-900">{reference}</span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-mono font-semibold text-gray-900 text-sm">{transactionId}</span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Payment Date</span>
              <span className="font-semibold text-gray-900">
                {new Date(paymentDetails.paidAt).toLocaleDateString('en-NG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Gateway</span>
              <span className="font-semibold text-gray-900">Flutterwave</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <p className="text-center text-green-900 font-semibold">
              ✓ Payment verified and confirmed
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-4">What's Next?</h3>
            <ul className="space-y-3 text-blue-900">
              <li className="flex items-start gap-3">
                <span className="font-bold">1.</span>
                <span>
                  {ajoType === 'group'
                    ? 'Share your group link with friends to invite members'
                    : 'Your savings plan is now active and locked'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold">2.</span>
                <span>
                  {ajoType === 'group'
                    ? 'Once you have enough members, your first cycle will begin'
                    : 'You can track your savings progress on your dashboard'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold">3.</span>
                <span>
                  {ajoType === 'group'
                    ? 'Members will receive payouts in rotation'
                    : 'Your funds will be available after the lock-in period'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/ajo/dashboard')}
            className="px-6 py-4 bg-primary-green text-white rounded-lg hover:bg-green-600 transition-colors font-bold text-lg"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-4 border-2 border-primary-green text-primary-green rounded-lg hover:bg-green-50 transition-colors font-bold text-lg"
          >
            Back to Home
          </button>
        </div>

        {/* Receipt Download */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.print()}
            className="text-primary-green hover:text-green-600 font-semibold flex items-center justify-center gap-2 mx-auto"
          >
            <span>📄</span>
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default AjoSuccess;
