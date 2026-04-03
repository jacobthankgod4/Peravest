import { useContext } from 'react';
import { InvestmentContext } from '../contexts/InvestmentContext';

export const useInvestment = () => {
  const context = useContext(InvestmentContext);
  if (!context) {
    throw new Error('useInvestment must be used within InvestmentProvider');
  }
  return context;
};
