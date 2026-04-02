import { supabase } from './supabaseClient';

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'completed';

interface WithdrawalRequest {
  id: number;
  user_id: number;
  amount: number;
  bank_details: any;
  status: WithdrawalStatus;
  created_at: string;
}

class WithdrawalManagementService {
  async getPendingWithdrawals() {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*, users(email, full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    return { data, error };
  }

  async approveWithdrawal(withdrawalId: number, adminId: number) {
    const { data, error } = await supabase
      .from('withdrawals')
      .update({
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString()
      })
      .eq('id', withdrawalId)
      .select()
      .single();

    return { data, error };
  }

  async rejectWithdrawal(withdrawalId: number, adminId: number, reason: string) {
    const { data, error } = await supabase
      .from('withdrawals')
      .update({
        status: 'rejected',
        rejected_by: adminId,
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      })
      .eq('id', withdrawalId)
      .select()
      .single();

    return { data, error };
  }

  async completeWithdrawal(withdrawalId: number, transactionRef: string) {
    const { data, error } = await supabase
      .from('withdrawals')
      .update({
        status: 'completed',
        transaction_reference: transactionRef,
        completed_at: new Date().toISOString()
      })
      .eq('id', withdrawalId)
      .select()
      .single();

    return { data, error };
  }

  async getWithdrawalHistory(userId?: number) {
    let query = supabase
      .from('withdrawals')
      .select('*, users(email, full_name)')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    return { data, error };
  }
}

export const withdrawalManagementService = new WithdrawalManagementService();
