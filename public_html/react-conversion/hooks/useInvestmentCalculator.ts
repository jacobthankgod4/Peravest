import { useState, useEffect } from 'react';

interface CalculationResult {
  monthlyReturn: number;
  totalReturn: number;
  maturityAmount: number;
}

export const useInvestmentCalculator = (principal: number, rate: number, duration: number) => {
  const [result, setResult] = useState<CalculationResult>({
    monthlyReturn: 0,
    totalReturn: 0,
    maturityAmount: 0
  });

  useEffect(() => {
    if (principal > 0 && rate > 0 && duration > 0) {
      const monthlyRate = rate / 100 / 12;
      const totalMonths = duration;
      
      const monthlyReturn = principal * monthlyRate;
      const totalReturn = monthlyReturn * totalMonths;
      const maturityAmount = principal + totalReturn;

      setResult({
        monthlyReturn,
        totalReturn,
        maturityAmount
      });
    }
  }, [principal, rate, duration]);

  return result;
};