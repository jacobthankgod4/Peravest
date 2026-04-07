import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import { ajoPaymentService } from '../services/ajoPaymentService';
import { formatCurrency, getFrequencyLabel } from '../utils/ajoFormValidation';
import Alert from '../components/Alert';
import { AjoFormData } from '../types/ajo';

export const AjoCheckout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formData } = useOnboarding();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const paymentAmount = ajoPaymentService.calculatePaymentAmount(formData as any);
  const isPersonal = formData.type === 'personal';

  const handlePayment = async () => {
    if (!user) {
      setError('You must be logged in to proceed');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Get user's full name and phone from profile
      const userFullName = user?.email?.split('@')[0] || 'User';
      const userPhone = '+234';

      // Initialize payment
      const paymentInit = await ajoPaymentService.initializePayment({
        email: user.email,
        amount: paymentAmount,
        ajoType: formData.type,
        ajoData: formData as any,
        userId: typeof user?.id === 'string' ? parseInt(user.id) : (user?.id || 0),
        fullName: userFullName,
        phoneNumber: userPhone,
      });

      if (paymentInit.status === 'success' && paymentInit.data.link) {
        // Redirect to Flutterwave payment page
        window.location.href = paymentInit.data.link;
      } else {
        setError('Failed to initialize payment. Please try again.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-primary-green mb-2 text-center">Complete Your Payment</h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          Secure payment powered by Flutterwave
        </p>

        {error && <Alert type="error" className="mb-8">{error}</Alert>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Type Badge */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <span className={`inline-block px-4 py-2 rounded-full font-semibold text-white ${
                  isPersonal ? 'bg-primary-green' : 'bg-orange-500'
                }`}>
                  {isPersonal ? '👤 Personal Ajo' : '👥 Group Ajo'}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Contribution Amount</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(formData.contributionAmount)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Frequency</span>
                  <span className="font-semibold text-gray-900">
                    {getFrequencyLabel(formData.frequency)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold text-gray-900">
                    {formData.duration} months
                  </span>
                </div>

                {!isPersonal && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Group Name</span>
                      <span className="font-semibold text-gray-900">
                        {formData.groupName}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Max Members</span>
                      <span className="font-semibold text-gray-900">
                        {formData.maxMembers}
                      </span>
                    </div>
                  </>
                )}

                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-3xl font-bold text-primary-green">
                    {formatCurrency(paymentAmount)}
                  </span>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">🔒 Secure Payment:</span> Your payment is processed securely by Flutterwave. We never store your card details.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Card */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h3>

              {/* Payment Options */}
              <div className="space-y-3 mb-8">
                <div className="p-4 bg-green-50 border-2 border-primary-green rounded-lg">
                  <p className="font-semibold text-gray-900">💳 Card Payment</p>
                  <p className="text-sm text-gray-600 mt-1">Visa, Mastercard, Verve</p>
                </div>

                <div className="p-4 bg-green-50 border-2 border-primary-green rounded-lg">
                  <p className="font-semibold text-gray-900">📱 Mobile Money</p>
                  <p className="text-sm text-gray-600 mt-1">MTN, Airtel, Glo, 9mobile</p>
                </div>

                <div className="p-4 bg-green-50 border-2 border-primary-green rounded-lg">
                  <p className="font-semibold text-gray-900">🏦 Bank Transfer</p>
                  <p className="text-sm text-gray-600 mt-1">Direct bank account transfer</p>
                </div>

                <div className="p-4 bg-green-50 border-2 border-primary-green rounded-lg">
                  <p className="font-semibold text-gray-900">💰 USSD</p>
                  <p className="text-sm text-gray-600 mt-1">Quick USSD payment</p>
                </div>
              </div>

              {/* Amount Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(paymentAmount)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-primary-green">
                    {formatCurrency(paymentAmount)}
                  </span>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full px-6 py-4 bg-primary-green text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors font-bold text-lg flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>💳</span>
                    Pay {formatCurrency(paymentAmount)}
                  </>
                )}
              </button>

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center mt-4">
                By clicking Pay, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate(-1)}
            className="text-primary-green hover:text-green-600 font-semibold"
          >
            ← Back to Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default AjoCheckout;
