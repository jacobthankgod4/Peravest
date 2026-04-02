import React, { createContext, useContext, useState, useEffect } from 'react';
import { investmentService } from '../services/investmentService';
import { supabase } from '../lib/supabase';

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
  stats: {
    totalInvestments: number;
    activeInvestments: number;
    totalReturns: number;
  };
  createInvestment: (packageId: number, amount: number) => Promise<any>;
  getInvestments: () => Promise<void>;
  setInvestmentData: (data: any) => void;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export { InvestmentContext };

export const InvestmentProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);
  const [investmentData, setInvestmentData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalInvestments: 0,
    activeInvestments: 0,
    totalReturns: 0
  });

  const getInvestments = async () => {
    setLoading(true);
    try {
      const [investmentsRes, statsRes] = await Promise.all([
        investmentService.getUserInvestments(),
        investmentService.getStats()
      ]);
      setInvestments(investmentsRes.data);
      setStats(statsRes.data);
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) getInvestments();
    });
  }, []);

  return (
    <InvestmentContext.Provider value={{
      investments,
      loading,
      stats,
      createInvestment,
      getInvestments,
      setInvestmentData
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