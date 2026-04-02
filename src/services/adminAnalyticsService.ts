// @ts-nocheck
import { supabase } from '../lib/supabase';
import { investmentCalculationService } from './investmentCalculationService';

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  investments_count: number;
}

export interface PropertyPerformance {
  property_id: number;
  property_title: string;
  total_investments: number;
  total_value: number;
  investors_count: number;
}

export interface InvestmentDistribution {
  duration: number;
  count: number;
  total_value: number;
  percentage: number;
}

export const adminAnalyticsService = {
  
  // Get total investments value (aggregated with interest)
  async getTotalInvestments(): Promise<number> {
    try {
      const { data } = await supabase
        .from('invest_now')
        .select(`
          start_date,
          period,
          investment(share_cost)
        `);

      if (!data) return 0;

      let total = 0;
      data.forEach(inv => {
        const shareCost = inv.investment?.share_cost || 0;
        const currentValue = investmentCalculationService.calculateCurrentValue(
          shareCost,
          inv.period,
          inv.start_date
        );
        total += currentValue;
      });

      return total;

    } catch (error) {
      console.error('Error calculating total investments:', error);
      return 0;
    }
  },

  // Get active investors count
  async getActiveInvestors(): Promise<number> {
    try {
      const { data } = await supabase
        .from('invest_now')
        .select('Usa_Id');

      if (!data) return 0;

      // Get unique user IDs
      const uniqueInvestors = new Set(data.map(inv => inv.Usa_Id));
      return uniqueInvestors.size;

    } catch (error) {
      console.error('Error counting active investors:', error);
      return 0;
    }
  },

  // Get property performance metrics
  async getPropertyPerformance(): Promise<PropertyPerformance[]> {
    try {
      const { data } = await supabase
        .from('invest_now')
        .select(`
          start_date,
          period,
          Usa_Id,
          investment(
            share_cost,
            property_id,
            property(Id, Title)
          )
        `);

      if (!data) return [];

      // Group by property
      const propertyMap = new Map<number, PropertyPerformance>();

      data.forEach(inv => {
        const propertyId = inv.investment?.property_id;
        const propertyTitle = inv.investment?.property?.Title || 'Unknown';
        const shareCost = inv.investment?.share_cost || 0;

        if (!propertyId) return;

        if (!propertyMap.has(propertyId)) {
          propertyMap.set(propertyId, {
            property_id: propertyId,
            property_title: propertyTitle,
            total_investments: 0,
            total_value: 0,
            investors_count: 0
          });
        }

        const property = propertyMap.get(propertyId)!;
        property.total_investments += 1;
        
        const currentValue = investmentCalculationService.calculateCurrentValue(
          shareCost,
          inv.period,
          inv.start_date
        );
        property.total_value += currentValue;
      });

      return Array.from(propertyMap.values())
        .sort((a, b) => b.total_value - a.total_value);

    } catch (error) {
      console.error('Error fetching property performance:', error);
      return [];
    }
  },

  // Get monthly revenue trends
  async getMonthlyRevenue(months: number = 12): Promise<MonthlyRevenue[]> {
    try {
      const { data } = await supabase
        .from('invest_now')
        .select(`
          start_date,
          period,
          investment(share_cost)
        `)
        .order('start_date', { ascending: false });

      if (!data) return [];

      // Group by month
      const monthlyMap = new Map<string, MonthlyRevenue>();

      data.forEach(inv => {
        const date = new Date(inv.start_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            month: monthKey,
            revenue: 0,
            investments_count: 0
          });
        }

        const monthly = monthlyMap.get(monthKey)!;
        monthly.investments_count += 1;
        monthly.revenue += inv.investment?.share_cost || 0;
      });

      return Array.from(monthlyMap.values())
        .sort((a, b) => b.month.localeCompare(a.month))
        .slice(0, months);

    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      return [];
    }
  },

  // Get investments distribution by duration
  async getInvestmentsByDuration(): Promise<InvestmentDistribution[]> {
    try {
      const { data } = await supabase
        .from('invest_now')
        .select(`
          period,
          start_date,
          investment(share_cost)
        `);

      if (!data) return [];

      // Group by duration
      const durationMap = new Map<number, InvestmentDistribution>();

      data.forEach(inv => {
        const duration = inv.period;
        
        if (!durationMap.has(duration)) {
          durationMap.set(duration, {
            duration,
            count: 0,
            total_value: 0,
            percentage: 0
          });
        }

        const dist = durationMap.get(duration)!;
        dist.count += 1;
        
        const shareCost = inv.investment?.share_cost || 0;
        const currentValue = investmentCalculationService.calculateCurrentValue(
          shareCost,
          duration,
          inv.start_date
        );
        dist.total_value += currentValue;
      });

      const distributions = Array.from(durationMap.values());
      const totalCount = distributions.reduce((sum, d) => sum + d.count, 0);

      // Calculate percentages
      distributions.forEach(d => {
        d.percentage = totalCount > 0 ? (d.count / totalCount) * 100 : 0;
      });

      return distributions.sort((a, b) => a.duration - b.duration);

    } catch (error) {
      console.error('Error fetching investments by duration:', error);
      return [];
    }
  },

  // Get growth metrics
  async getGrowthMetrics(): Promise<{
    current_month_investments: number;
    last_month_investments: number;
    growth_percentage: number;
  }> {
    try {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Current month
      const { count: currentMonth } = await supabase
        .from('invest_now')
        .select('*', { count: 'exact', head: true })
        .gte('start_date', currentMonthStart.toISOString());

      // Last month
      const { count: lastMonth } = await supabase
        .from('invest_now')
        .select('*', { count: 'exact', head: true })
        .gte('start_date', lastMonthStart.toISOString())
        .lte('start_date', lastMonthEnd.toISOString());

      const growth = lastMonth && lastMonth > 0
        ? ((currentMonth || 0) - lastMonth) / lastMonth * 100
        : 0;

      return {
        current_month_investments: currentMonth || 0,
        last_month_investments: lastMonth || 0,
        growth_percentage: Math.round(growth * 100) / 100
      };

    } catch (error) {
      console.error('Error fetching growth metrics:', error);
      return {
        current_month_investments: 0,
        last_month_investments: 0,
        growth_percentage: 0
      };
    }
  },

  // Get Ajo analytics
  async getAjoAnalytics(): Promise<{
    total_groups: number;
    active_groups: number;
    total_members: number;
    total_contributions: number;
  }> {
    try {
      const { count: totalGroups } = await supabase
        .from('ajo_groups')
        .select('*', { count: 'exact', head: true });

      const { count: activeGroups } = await supabase
        .from('ajo_groups')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: totalMembers } = await supabase
        .from('ajo_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { data: contributions } = await supabase
        .from('ajo_transactions')
        .select('amount')
        .eq('transaction_type', 'contribution')
        .eq('status', 'completed');

      const totalContributions = contributions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      return {
        total_groups: totalGroups || 0,
        active_groups: activeGroups || 0,
        total_members: totalMembers || 0,
        total_contributions: totalContributions
      };

    } catch (error) {
      console.error('Error fetching Ajo analytics:', error);
      return {
        total_groups: 0,
        active_groups: 0,
        total_members: 0,
        total_contributions: 0
      };
    }
  }
};