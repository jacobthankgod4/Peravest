import { supabase } from '../lib/supabase';

export const userAdminService = {
  async getAllUsers(status?: string) {
    let query = supabase
      .from('user_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getUserById(userId: number) {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('Id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async suspendUser(userId: number, reason: string, adminEmail: string) {
    const { data, error } = await supabase
      .from('user_accounts')
      .update({
        status: 'suspended',
        suspension_reason: reason,
        suspended_at: new Date().toISOString(),
        suspended_by: adminEmail
      })
      .eq('Id', userId)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'SUSPEND_USER',
      table_name: 'user_accounts',
      record_id: userId.toString(),
      details: { user_id: userId, reason }
    });

    return data;
  },

  async activateUser(userId: number, adminEmail: string) {
    const { data, error } = await supabase
      .from('user_accounts')
      .update({
        status: 'active',
        suspension_reason: null,
        suspended_at: null,
        suspended_by: null
      })
      .eq('Id', userId)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'ACTIVATE_USER',
      table_name: 'user_accounts',
      record_id: userId.toString(),
      details: { user_id: userId }
    });

    return data;
  },

  async getUserInvestments(userId: number) {
    const { data, error } = await supabase
      .from('invest_now')
      .select(`
        *,
        property!inner(Title, Address, City)
      `)
      .eq('Usa_Id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async overrideKYC(userId: number, verified: boolean, adminEmail: string) {
    const { data, error } = await supabase
      .from('user_accounts')
      .update({ kyc_verified: verified })
      .eq('Id', userId)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'OVERRIDE_KYC',
      table_name: 'user_accounts',
      record_id: userId.toString(),
      details: { user_id: userId, kyc_verified: verified }
    });

    return data;
  },

  async getUserActivity(userId: number) {
    const { data, error } = await supabase
      .from('admin_audit_log')
      .select('*')
      .or(`record_id.eq.${userId},details->>user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  }
};
