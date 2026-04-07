import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const AjoPaymentError: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  const errorDetails: Record<string, { title: string; description: string; icon: string }> = {
    'insufficient_funds': {
      title: 'Insufficient Funds',
      description: 'Your card does not have enough funds. Please try with a different card or add funds to your account.',
      icon: '💳',
    },
    'card_declined': {
      title: 'Card Declined',
      description: 'Your card was declined by the bank. Please contact your bank or try with a different card.',
      icon: '❌',
    },
    'invalid_card': {
      title: 'Invalid Card',
      description: 'The card details you provided are invalid. Please check and try again.',
      icon: '⚠️',
    },
    'timeout': {
      title: 'Payment Timeout',
      description: 'The payment process took too long. Please try again.',
      icon: '⏱️',
    },
    'cancelled': {
      title: 'Payment Cancelled',
      description: 'You cancelled the payment. You can try again whenever you are ready.',
      icon: '🚫',
    },
    'network_error': {
      title: 'Network Error',
      description: 'There was a network error during payment. Please check your connection and try again.',
      icon: '🌐',
    },
  };

  const error = errorDetails[errorCode || 'cancelled'] || {
    title: 'Payment Failed',
    description: errorMessage || 'Something went wrong during payment processing. Please try again.',
    icon: '❌',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Error Header */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-4">{error.icon}</div>
          <h1 className="text-4xl font-bold text-red-600 mb-2">{error.title}</h1>
          <p className="text-xl text-gray-600">{error.description}</p>
        </div>

        {/* Error Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What You Can Do</h2>

          <div className="space-y-4 mb-8">
            {errorCode === 'insufficient_funds' && (
              <>
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-2xl">💰</span>
                  <div>
                    <p className="font-semibold text-blue-900">Add Funds</p>
                    <p className="text-sm text-blue-800">Add funds to your card and try again</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-2xl">💳</span>
                  <div>
                    <p className="font-semibold text-blue-900">Use Different Card</p>
                    <p className="text-sm text-blue-800">Try payment with another card</p>
                  </div>
                </div>
              </>
            )}

            {errorCode === 'card_declined' && (
              <>
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-2xl">📞</span>
                  <div>
                    <p className="font-semibold text-blue-900">Contact Your Bank</p>
                    <p className="text-sm text-blue-800">Your bank may have blocked the transaction. Contact them to authorize it.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-2xl">💳</span>
                  <div>
                    <p className="font-semibold text-blue-900">Try Another Card</p>
                    <p className="text-sm text-blue-800">Use a different card to complete the payment</p>
                  </div>
                </div>
              </>
            )}

            {errorCode === 'network_error' && (
              <>
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <p className="font-semibold text-blue-900">Check Connection</p>
                    <p className="text-sm text-blue-800">Ensure you have a stable internet connection</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <p className="font-semibold text-blue-900">Retry Payment</p>
                    <p className="text-sm text-blue-800">Try the payment again after checking your connection</p>
                  </div>
                </div>
              </>
            )}

            {!['insufficient_funds', 'card_declined', 'network_error'].includes(errorCode || '') && (
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-2xl">🔄</span>
                <div>
                  <p className="font-semibold text-blue-900">Try Again</p>
                  <p className="text-sm text-blue-800">Return to the payment page and try again</p>
                </div>
              </div>
            )}
          </div>

          {/* Support Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Need Help?</span> If you continue to experience issues, please contact our support team at support@peravest.com
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-4 bg-primary-green text-white rounded-lg hover:bg-green-600 transition-colors font-bold text-lg"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/ajo/onboard')}
            className="px-6 py-4 border-2 border-primary-green text-primary-green rounded-lg hover:bg-green-50 transition-colors font-bold text-lg"
          >
            Start Over
          </button>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>

          <div className="space-y-6">
            <div>
              <p className="font-semibold text-gray-900 mb-2">Why was my payment declined?</p>
              <p className="text-gray-600">
                Payments can be declined for various reasons including insufficient funds, incorrect card details, or bank security measures. Contact your bank for more information.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-2">Will I be charged if payment fails?</p>
              <p className="text-gray-600">
                No. You will only be charged if the payment is successful. Failed payment attempts do not result in charges.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-2">How long does payment processing take?</p>
              <p className="text-gray-600">
                Payment processing is usually instant. If you don't see confirmation within 5 minutes, please contact support.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-2">Can I use a debit card?</p>
              <p className="text-gray-600">
                Yes, we accept Visa, Mastercard, and Verve debit cards. Some banks may require additional verification for online transactions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AjoPaymentError;
