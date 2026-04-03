import { useState } from 'react';
import { paymentService } from '../services/paymentService';

interface PaystackConfig {
  email: string;
  amount: number;
  reference?: string;
  onSuccess: (reference: any) => void;
  onClose: () => void;
}

export const usePaystack = () => {
  const [loading, setLoading] = useState(false);
  
  const initializePayment = async (config: PaystackConfig) => {
    setLoading(true);
    try {
      const response = await paymentService.initializeTransaction(
        config.amount * 100, // Convert to kobo
        config.email,
        { type: 'investment' }
      );
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const verifyPayment = async (reference: string) => {
    const response = await paymentService.verifyTransaction(reference);
    return response;
  };
  
  return { initializePayment, verifyPayment, loading };
};