// hooks/useInvestmentCalculator.ts
import { useState, useCallback } from 'react';

interface InvestmentCalculation {
  roi: number;
  totalReturns: number;
  monthlyReturns: number;
  principal?: number;
  interest?: number;
}

export const useInvestmentCalculator = () => {
  const calculateROI = useCallback((amount: number, period: number): InvestmentCalculation => {
    const isSmallInvestor = amount <= 500000;
    const rates = isSmallInvestor ? 
      { 6: 9.25, 12: 18.5, 24: 37, 60: 92.5 } :
      { 6: 8.8, 12: 16, 24: 33, 60: 65 };
    
    const roi = rates[period as keyof typeof rates] || 0;
    const totalReturns = (amount * roi) / 100;
    const monthlyReturns = totalReturns / period;
    
    return { 
      roi, 
      totalReturns, 
      monthlyReturns,
      principal: amount,
      interest: totalReturns
    };
  }, []);
  
  const calculateReturns = calculateROI;
  
  const validateAmount = (amount: number) => {
    if (amount < 5000) {
      return { isValid: false, error: 'Minimum investment is ₦5,000' };
    }
    return { isValid: true, error: '' };
  };
  
  return { calculateROI, calculateReturns, validateAmount };
};