import { useState } from 'react';
import { paymentService } from '../services/paymentService';

interface PaystackConfig {
  email: string;
  amount: number;
  reference: string;
  onSuccess: (reference: any) => void;
  onClose: () => void;
}

export const usePaystack = () => {
  const [loading, setLoading] = useState(false);

  const initializePayment = async (config: PaystackConfig) => {
    setLoading(true);
    try {
      const response = await paymentService.initializePayment({
        email: config.email,
        amount: config.amount * 100, // Convert to kobo
        reference: config.reference
      });
      
      if (response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      }
    } catch (error) {
      console.error('Payment initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      const response = await paymentService.verifyPayment(reference);
      return response.data;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  };

  return {
    initializePayment,
    verifyPayment,
    loading
  };
};