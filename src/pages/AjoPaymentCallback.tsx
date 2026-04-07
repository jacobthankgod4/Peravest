import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import { ajoPaymentService } from '../services/ajoPaymentService';
import { AjoFormData } from '../types/ajo';

export const AjoPaymentCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formData, resetForm } = useOnboarding();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get transaction ID from Flutterwave callback
        const transactionId = searchParams.get('transaction_id');
        const status = searchParams.get('status');

        if (!transactionId) {
          navigate('/ajo/payment-error?code=invalid_transaction&message=No transaction ID found');
          return;
        }

        // If status is cancelled, redirect to error
        if (status === 'cancelled') {
          navigate('/ajo/payment-error?code=cancelled');
          return;
        }

        // Verify payment with Flutterwave
        const verification = await ajoPaymentService.verifyPayment(transactionId);

        if (verification.data.status === 'successful') {
          // Create Ajo after successful payment
          if (user && formData) {
            try {
              await ajoPaymentService.createAjoAfterPayment(
                typeof user?.id === 'string' ? parseInt(user.id) : (user?.id || 0),
                formData as any,
                verification.data.tx_ref
              );

              // Reset form and redirect to success
              navigate(`/ajo/success?reference=${verification.data.tx_ref}&type=${formData.type}&transaction_id=${transactionId}`);
            } catch (createError: any) {
              console.error('Error creating Ajo:', createError);
              navigate(`/ajo/payment-error?code=creation_failed&message=${encodeURIComponent(createError.message)}`);
            }
          } else {
            navigate('/ajo/payment-error?code=missing_data&message=User or form data not found');
          }
        } else {
          // Payment not successful
          navigate(`/ajo/payment-error?code=payment_failed&message=Payment was not successful`);
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        navigate(`/ajo/payment-error?code=verification_failed&message=${encodeURIComponent(error.message)}`);
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams, user, formData, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-5xl mb-4">⏳</div>
        <p className="text-xl text-gray-600">Processing your payment...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we verify your transaction</p>
      </div>
    </div>
  );
};

export default AjoPaymentCallback;
