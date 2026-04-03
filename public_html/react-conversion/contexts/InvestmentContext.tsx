import React, { createContext, useContext, useState, useEffect } from 'react';
import { investmentService } from '../services/investmentService';

interface Investment {
  id: number;
  packageId: number;
  amount: number;
  status: string;
  startDate: string;
  maturityDate: string;
  returns: number;
}

interface InvestmentContextType {
  investments: Investment[];
  loading: boolean;
  createInvestment: (packageId: number, amount: number) => Promise<any>;
  getInvestments: () => Promise<void>;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export const InvestmentProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);

  const getInvestments = async () => {
    setLoading(true);
    try {
      const response = await investmentService.getUserInvestments();
      setInvestments(response.data);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInvestment = async (packageId: number, amount: number) => {
    setLoading(true);
    try {
      const response = await investmentService.createInvestment({ packageId, amount });
      await getInvestments();
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInvestments();
  }, []);

  return (
    <InvestmentContext.Provider value={{
      investments,
      loading,
      createInvestment,
      getInvestments
    }}>
      {children}
    </InvestmentContext.Provider>
  );
};

export const useInvestment = () => {
  const context = useContext(InvestmentContext);
  if (!context) {
    throw new Error('useInvestment must be used within InvestmentProvider');
  }
  return context;
};