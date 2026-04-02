import { useState } from 'react';
import { paymentService } from '../services/paymentService';

export const usePaystack = () => {
  const [loading, setLoading] = useState(false);

  const initializePayment = async (data: any) => {
    setLoading(true);
    try {
      const response = await paymentService.initialize(data);
      return response;
    } finally {
      setLoading(false);
    }
  };

  return { initializePayment, loading };
};
