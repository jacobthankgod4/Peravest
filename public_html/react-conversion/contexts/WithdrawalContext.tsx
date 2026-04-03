import React, { createContext, useContext, useState } from 'react';
import { withdrawalService } from '../services/withdrawalService';

interface WithdrawalRequest {
  id: number;
  amount: number;
  status: string;
  requestDate: string;
  bankAccount: any;
}

interface WithdrawalContextType {
  withdrawals: WithdrawalRequest[];
  loading: boolean;
  requestWithdrawal: (amount: number, bankAccountId: number) => Promise<any>;
  getWithdrawals: () => Promise<void>;
}

const WithdrawalContext = createContext<WithdrawalContextType | undefined>(undefined);

export const WithdrawalProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const getWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await withdrawalService.getHistory();
      setWithdrawals(response.data);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestWithdrawal = async (amount: number, bankAccountId: number) => {
    setLoading(true);
    try {
      const response = await withdrawalService.requestWithdrawal({ amount, bankAccountId });
      await getWithdrawals();
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <WithdrawalContext.Provider value={{
      withdrawals,
      loading,
      requestWithdrawal,
      getWithdrawals
    }}>
      {children}
    </WithdrawalContext.Provider>
  );
};

export const useWithdrawal = () => {
  const context = useContext(WithdrawalContext);
  if (!context) {
    throw new Error('useWithdrawal must be used within WithdrawalProvider');
  }
  return context;
};