import { supabase } from '../lib/supabase';

export const transactionAdminService = {
  async getTransactionsList(filters?: any) {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        user_accounts!inner(Name)
      `)
      .order('created_at', { ascending: false });
    
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Transform data to match expected format
    return (data || []).map(txn => ({
      ...txn,
      user_name: txn.user_accounts?.Name || 'Unknown User'
    }));
  },

  async getTransactionDetails(transactionId: number) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        user_accounts!inner(Name, Email)
      `)
      .eq('id', transactionId)
      .single();
    
    if (error) throw error;
    return {
      ...data,
      user_name: data.user_accounts?.Name || 'Unknown User',
      user_email: data.user_accounts?.Email || 'Unknown Email'
    };
  },

  async updateTransactionStatus(transactionId: number, status: string, adminEmail: string) {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async exportTransactions(filters: any) {
    const transactions = await this.getTransactionsList(filters);
    return transactions;
  },

  async getTransactionAnalytics(dateRange?: { start: string; end: string }) {
    let query = supabase.from('transactions').select('*');
    
    if (dateRange?.start) {
      query = query.gte('created_at', dateRange.start);
    }
    if (dateRange?.end) {
      query = query.lte('created_at', dateRange.end);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    const transactions = data || [];
    
    return {
      total_count: transactions.length,
      total_volume: transactions.reduce((sum, txn) => sum + (txn.amount || 0), 0),
      completed_count: transactions.filter(txn => txn.status === 'completed').length,
      failed_count: transactions.filter(txn => txn.status === 'failed').length,
      pending_count: transactions.filter(txn => txn.status === 'pending').length
    };
  }
};
