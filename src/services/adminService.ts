import { supabase } from '../lib/supabase';

const logAdminAction = async (action: string, tableName: string, recordId?: string, details?: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;

    await supabase.from('admin_audit_log').insert({
      admin_email: user.email,
      action,
      table_name: tableName,
      record_id: recordId,
      details
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

const verifyAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return false;

    const { data, error } = await supabase
      .from('user_accounts')
      .select('User_Type')
      .eq('Email', user.email)
      .single();

    return !error && data?.User_Type === 'admin';
  } catch {
    return false;
  }
};

export const adminService = {
  async getDashboardStats() {
    if (!await verifyAdmin()) throw new Error('Unauthorized');

    const [properties, users, investments, withdrawals] = await Promise.all([
      supabase.from('property').select('Id', { count: 'exact', head: true }),
      supabase.from('user_accounts').select('Id', { count: 'exact', head: true }),
      supabase.from('invest_now').select('share_cost'),
      supabase.from('withdrawal_requests').select('Id', { count: 'exact' }).eq('Status', 'pending')
    ]);

    const totalInvestments = investments.data?.reduce((sum, inv) => sum + (inv.share_cost || 0), 0) || 0;

    return {
      totalProperties: properties.count || 0,
      totalUsers: users.count || 0,
      totalInvestments,
      pendingWithdrawals: withdrawals.count || 0
    };
  },

  async getRecentInvestments(limit = 10) {
    if (!await verifyAdmin()) throw new Error('Unauthorized');

    const { data, error } = await supabase
      .from('invest_now')
      .select(`
        Id_invest,
        share_cost,
        created_at,
        user_accounts!inner(Name, Email),
        property!inner(Title)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data?.map((inv: any) => ({
      id: inv.Id_invest,
      amount: inv.share_cost,
      date: inv.created_at,
      userName: inv.user_accounts?.Name,
      propertyName: inv.property?.Title
    })) || [];
  },

  async updateProperty(id: string, updates: any) {
    if (!await verifyAdmin()) throw new Error('Unauthorized');

    const { data, error } = await supabase
      .from('property')
      .update(updates)
      .eq('Id', id)
      .select()
      .single();

    if (error) throw error;

    await logAdminAction('UPDATE', 'property', id, updates);
    return data;
  },

  async deleteProperty(id: string) {
    if (!await verifyAdmin()) throw new Error('Unauthorized');

    const { error } = await supabase
      .from('property')
      .delete()
      .eq('Id', id);

    if (error) throw error;

    await logAdminAction('DELETE', 'property', id);
  },

  async createProperty(propertyData: any) {
    if (!await verifyAdmin()) throw new Error('Unauthorized');

    const { data, error } = await supabase
      .from('property')
      .insert(propertyData)
      .select()
      .single();

    if (error) throw error;

    await logAdminAction('CREATE', 'property', data.Id, propertyData);
    return data;
  }
};
