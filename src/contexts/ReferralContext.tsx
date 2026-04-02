import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { referralService, ReferralStats } from '../services/referralService';
import { supabase } from '../lib/supabase';

interface ReferralContextType {
  referralCode: string;
  stats: ReferralStats;
  loading: boolean;
  refreshStats: () => Promise<void>;
  trackReferral: (code: string) => void;
}

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

export const useReferral = () => {
  const context = useContext(ReferralContext);
  if (context === undefined) {
    throw new Error('useReferral must be used within a ReferralProvider');
  }
  return context;
};

interface ReferralProviderProps {
  children: ReactNode;
}

export const ReferralProvider: React.FC<ReferralProviderProps> = ({ children }) => {
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState<ReferralStats>({
    total_referrals: 0,
    successful_referrals: 0,
    pending_referrals: 0,
    total_earnings: 0,
    available_bonus: 0
  });
  const [loading, setLoading] = useState(true);

  const refreshStats = async () => {
    try {
      const [codeResponse, statsResponse] = await Promise.all([
        referralService.getUserReferralCode(),
        referralService.getReferralStats()
      ]);
      
      setReferralCode(codeResponse.data.referral_code);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
      // Generate a temporary code if user doesn't have one
      const tempCode = 'PV' + Math.random().toString(36).substr(2, 6).toUpperCase();
      setReferralCode(tempCode);
    } finally {
      setLoading(false);
    }
  };

  const trackReferral = (code: string) => {
    localStorage.setItem('referral_code', code);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      trackReferral(refCode);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) refreshStats();
      else setLoading(false);
    });
  }, []);

  const value = {
    referralCode,
    stats,
    loading,
    refreshStats,
    trackReferral
  };

  return (
    <ReferralContext.Provider value={value}>
      {children}
    </ReferralContext.Provider>
  );
};