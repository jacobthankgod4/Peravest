import { supabase } from '../lib/supabase';

export const investmentAdminService = {
  async getInvestmentsList() {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          user_accounts!inner(Id, Name, Email),
          properties(Id, Title, Location)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Investments table error:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Investment service error:', error);
      return [];
    }
  },

  async getInvestmentDetails(investmentId: number) {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          user_accounts!inner(Id, Name, Email),
          properties(Id, Title, Location, Expected_ROI)
        `)
        .eq('Id', investmentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Investment details error:', error);
      throw error;
    }
  },

  async updatePaymentStatus(investmentId: number, status: string, adminEmail: string) {
    try {
      const { data, error } = await supabase
        .from('investments')
        .update({
          Payment_Status: status,
          updated_at: new Date().toISOString()
        })
        .eq('Id', investmentId)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('admin_audit_log').insert({
        admin_email: adminEmail,
        action: 'UPDATE_INVESTMENT_STATUS',
        table_name: 'investments',
        record_id: investmentId.toString(),
        details: { investment_id: investmentId, status }
      });

      return data;
    } catch (error) {
      console.error('Update payment status error:', error);
      throw error;
    }
  },

  async calculateROI(investmentId: number) {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          Amount,
          created_at,
          properties(Expected_ROI)
        `)
        .eq('Id', investmentId)
        .single();

      if (error) throw error;

      const monthsInvested = Math.floor(
        (new Date().getTime() - new Date(data.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      
      const expectedROI = (data.properties as any)?.Expected_ROI || 15;
      const currentValue = data.Amount * (1 + (expectedROI / 100) * (monthsInvested / 12));
      
      return {
        original_amount: data.Amount,
        current_value: currentValue,
        roi_percentage: expectedROI,
        months_invested: monthsInvested,
        profit: currentValue - data.Amount
      };
    } catch (error) {
      console.error('Calculate ROI error:', error);
      throw error;
    }
  },

  async exportInvestments(filters: any) {
    try {
      const investments = await this.getInvestmentsList();
      return investments;
    } catch (error) {
      console.error('Export investments error:', error);
      return [];
    }
  },

  async bulkUpdateStatus(investmentIds: number[], status: string, adminEmail: string) {
    try {
      const { data, error } = await supabase
        .from('investments')
        .update({
          Payment_Status: status,
          updated_at: new Date().toISOString()
        })
        .in('Id', investmentIds)
        .select();

      if (error) throw error;

      await supabase.from('admin_audit_log').insert({
        admin_email: adminEmail,
        action: 'BULK_UPDATE_INVESTMENT_STATUS',
        table_name: 'investments',
        details: { investment_ids: investmentIds, status, count: investmentIds.length }
      });

      return data;
    } catch (error) {
      console.error('Bulk update error:', error);
      throw error;
    }
  }
};
