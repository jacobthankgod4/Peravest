import { supabase } from '../lib/supabase';

interface WithdrawalApprovalData {
  approved_by: number;
  approved_at: string;
  status: 'approved';
  processed_at: string;
}

interface WithdrawalRejectionData {
  rejected_by: number;
  rejected_at: string;
  rejection_reason: string;
  status: 'rejected';
}

export const withdrawalAdminService = {
  async getPendingWithdrawals() {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          user_accounts!inner(Id, Name, Email)
        `)
        .eq('Status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Withdrawal table error:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Withdrawal service error:', error);
      return [];
    }
  },

  async getAllWithdrawals(status?: string) {
    try {
      let query = supabase
        .from('withdrawal_requests')
        .select(`
          *,
          user_accounts!inner(Id, Name, Email)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('Status', status);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Withdrawal table error:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Withdrawal service error:', error);
      return [];
    }
  },

  async approveWithdrawal(id: number, adminEmail: string) {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .update({
        Status: 'approved',
        approved_by: adminEmail,
        approved_at: new Date().toISOString(),
        processed_at: new Date().toISOString()
      })
      .eq('Id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'APPROVE_WITHDRAWAL',
      table_name: 'withdrawal_requests',
      record_id: id.toString(),
      details: { withdrawal_id: id, amount: data.Amount }
    });

    return data;
  },

  async rejectWithdrawal(id: number, adminEmail: string, reason: string) {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .update({
        Status: 'rejected',
        rejected_by: adminEmail,
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      })
      .eq('Id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'REJECT_WITHDRAWAL',
      table_name: 'withdrawal_requests',
      record_id: id.toString(),
      details: { withdrawal_id: id, reason }
    });

    return data;
  },

  async bulkApprove(ids: number[], adminEmail: string) {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .update({
        Status: 'approved',
        approved_by: adminEmail,
        approved_at: new Date().toISOString(),
        processed_at: new Date().toISOString()
      })
      .in('Id', ids)
      .select();

    if (error) throw error;

    await supabase.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'BULK_APPROVE_WITHDRAWALS',
      table_name: 'withdrawal_requests',
      details: { withdrawal_ids: ids, count: ids.length }
    });

    return data;
  }
};
