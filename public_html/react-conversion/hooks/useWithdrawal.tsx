import { useContext } from 'react';
import { WithdrawalContext } from '../contexts/WithdrawalContext';

export const useWithdrawal = () => {
  const context = useContext(WithdrawalContext);
  if (!context) {
    throw new Error('useWithdrawal must be used within WithdrawalProvider');
  }
  return context;
};
