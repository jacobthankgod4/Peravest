// @ts-nocheck
import { supabase } from '../lib/supabase';
import { investmentCalculationService, InvestmentWithCalculations } from './investmentCalculationService';

export interface AdminStats {
  total_investments: number;
  total_investment_value: number;
  active_investors: number;
  total_properties: number;
  total_users: number;
  pending_withdrawals: number;
  active_ajo_groups: number;
  total_safelock: number;
  safelock_value: number;
  total_target_savings: number;
  target_savings_value: number;
  real_estate_count: number;
  agriculture_count: number;
}

export interface InvestorData {
  user_name: string;
  property_title: string;
  property_address: string;
  property_image: string;
  share_cost: number;
  start_date: string;
  duration: number;
  current_interest: number;
  current_value: number;
  status: string;
}

export const adminDashboardService = {
  
  // Get admin dashboard statistics
  async getAdminStats(): Promise<AdminStats> {
    try {
      // Get total investments count and value
      const { data: investments } = await supabase
        .from('invest_now')
        .select('package_id, investment(share_cost)');

      const totalInvestments = investments?.length || 0;
      
      // Calculate total investment value with interest
      const { data: allInvestments } = await supabase
        .from('invest_now')
        .select(`
          start_date,
          period,
          investment(share_cost)
        `);

      let totalValue = 0;
      if (allInvestments) {
        allInvestments.forEach(inv => {
          const shareCost = inv.investment?.share_cost || 0;
          const currentValue = investmentCalculationService.calculateCurrentValue(
            shareCost,
            inv.period,
            inv.start_date
          );
          totalValue += currentValue;
        });
      }

      // Get active investors count (unique users)
      const { count: activeInvestors } = await supabase
        .from('invest_now')
        .select('Usa_Id', { count: 'exact', head: true })
        .not('Usa_Id', 'is', null);

      // Get total properties
      const { count: totalProperties } = await supabase
        .from('property')
        .select('*', { count: 'exact', head: true })
        .eq('Status', 'active');

      // Get Real Estate count
      const { count: realEstateCount } = await supabase
        .from('property')
        .select('*', { count: 'exact', head: true })
        .eq('Status', 'active')
        .eq('Asset_Type', 'Real Estate');

      // Get Agriculture count
      const { count: agricultureCount } = await supabase
        .from('property')
        .select('*', { count: 'exact', head: true })
        .eq('Status', 'active')
        .eq('Asset_Type', 'Agriculture');

      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get pending withdrawals
      const { count: pendingWithdrawals } = await supabase
        .from('withdrawals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get active Ajo groups
      const { count: activeAjoGroups } = await supabase
        .from('ajo_groups')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get SafeLock data
      const { data: safelockData } = await supabase
        .from('safelock')
        .select('amount');
      
      const totalSafelock = safelockData?.length || 0;
      const safelockValue = safelockData?.reduce((sum, s) => sum + (Number(s.amount) || 0), 0) || 0;

      // Get Target Savings data
      const { data: targetSavingsData } = await supabase
        .from('target_savings')
        .select('target_amount, saved_amount');
      
      const totalTargetSavings = targetSavingsData?.length || 0;
      const targetSavingsValue = targetSavingsData?.reduce((sum, t) => sum + (Number(t.saved_amount) || 0), 0) || 0;

      return {
        total_investments: totalInvestments,
        total_investment_value: totalValue,
        active_investors: activeInvestors || 0,
        total_properties: totalProperties || 0,
        total_users: totalUsers || 0,
        pending_withdrawals: pendingWithdrawals || 0,
        active_ajo_groups: activeAjoGroups || 0,
        total_safelock: totalSafelock,
        safelock_value: safelockValue,
        total_target_savings: totalTargetSavings,
        target_savings_value: targetSavingsValue,
        real_estate_count: realEstateCount || 0,
        agriculture_count: agricultureCount || 0
      };

    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  // Get all investments with calculations
  async getAllInvestments(): Promise<InvestorData[]> {
    try {
      const { data, error } = await supabase
        .from('invest_now')
        .select(`
          Usa_Id,
          start_date,
          period,
          user_accounts!inner(Name),
          investment(
            share_cost,
            interest,
            property(Title, Address, Images)
          )
        `)
        .order('start_date', { ascending: false });

      if (error) throw error;

      const investorData: InvestorData[] = [];

      data?.forEach(inv => {
        const shareCost = inv.investment?.share_cost || 0;
        const images = inv.investment?.property?.Images?.split(',') || [];
        
        const currentInterest = investmentCalculationService.calculateCurrentInterest(
          shareCost,
          inv.period,
          inv.start_date
        );

        const currentValue = investmentCalculationService.calculateCurrentValue(
          shareCost,
          inv.period,
          inv.start_date
        );

        investorData.push({
          user_name: inv.user_accounts?.Name || 'Unknown',
          property_title: inv.investment?.property?.Title || 'Unknown Property',
          property_address: inv.investment?.property?.Address || '',
          property_image: images[0] || '',
          share_cost: shareCost,
          start_date: inv.start_date,
          duration: inv.period,
          current_interest: currentInterest,
          current_value: currentValue,
          status: 'Active'
        });
      });

      return investorData;

    } catch (error) {
      console.error('Error fetching all investments:', error);
      return [];
    }
  },

  // Get recent activity
  async getRecentActivity(limit: number = 10): Promise<any[]> {
    try {
      const { data: recentInvestments } = await supabase
        .from('invest_now')
        .select(`
          start_date,
          user_accounts(Name),
          investment(
            share_cost,
            property(Title)
          )
        `)
        .order('start_date', { ascending: false })
        .limit(limit);

      const activities = recentInvestments?.map(inv => ({
        type: 'investment',
        user: inv.user_accounts?.Name || 'Unknown',
        description: `Invested ₦${inv.investment?.share_cost?.toLocaleString()} in ${inv.investment?.property?.Title}`,
        date: inv.start_date,
        amount: inv.investment?.share_cost || 0
      })) || [];

      return activities;

    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  },

  // Get users list
  async getUsersList(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('Id, Name, Email, User_Type, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error fetching users list:', error);
      return [];
    }
  },

  // Get properties list
  async getPropertiesList(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('property')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error fetching properties list:', error);
      return [];
    }
  },

  // Get subscribers list
  async getSubscribersList(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error fetching subscribers list:', error);
      return [];
    }
  },

  // Get investment by ID with calculations
  async getInvestmentById(investmentId: number): Promise<InvestorData | null> {
    try {
      const { data, error } = await supabase
        .from('invest_now')
        .select(`
          Usa_Id,
          start_date,
          period,
          user_accounts(Name),
          investment(
            share_cost,
            interest,
            property(Title, Address, Images)
          )
        `)
        .eq('Id_invest', investmentId)
        .single();

      if (error) throw error;
      if (!data) return null;

      const shareCost = data.investment?.share_cost || 0;
      const images = data.investment?.property?.Images?.split(',') || [];
      
      const currentInterest = investmentCalculationService.calculateCurrentInterest(
        shareCost,
        data.period,
        data.start_date
      );

      const currentValue = investmentCalculationService.calculateCurrentValue(
        shareCost,
        data.period,
        data.start_date
      );

      return {
        user_name: data.user_accounts?.Name || 'Unknown',
        property_title: data.investment?.property?.Title || 'Unknown Property',
        property_address: data.investment?.property?.Address || '',
        property_image: images[0] || '',
        share_cost: shareCost,
        start_date: data.start_date,
        duration: data.period,
        current_interest: currentInterest,
        current_value: currentValue,
        status: 'Active'
      };

    } catch (error) {
      console.error('Error fetching investment by ID:', error);
      return null;
    }
  }
};