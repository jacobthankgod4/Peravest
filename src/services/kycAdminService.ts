import { supabase } from '../lib/supabase';

export const kycAdminService = {
  async getPendingKYC() {
    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .select(`
          *,
          user_accounts!inner(Id, Name, Email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('KYC table error:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('KYC service error:', error);
      return [];
    }
  },

  async getAllKYC(status?: string) {
    try {
      let query = supabase
        .from('kyc_documents')
        .select(`
          *,
          user_accounts!inner(Id, Name, Email)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) {
        console.error('KYC table error:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('KYC service error:', error);
      return [];
    }
  },

  async approveKYC(id: number, adminEmail: string) {
    const { data: kycDoc, error: fetchError } = await supabase
      .from('kyc_documents')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('kyc_documents')
      .update({
        status: 'approved',
        verified_by: adminEmail,
        verified_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('user_accounts')
      .update({ kyc_verified: true })
      .eq('Id', kycDoc.user_id);

    await supabase.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'APPROVE_KYC',
      table_name: 'kyc_documents',
      record_id: id.toString(),
      details: { kyc_id: id, user_id: kycDoc.user_id }
    });

    return data;
  },

  async rejectKYC(id: number, adminEmail: string, reason: string) {
    const { data, error } = await supabase
      .from('kyc_documents')
      .update({
        status: 'rejected',
        rejected_by: adminEmail,
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'REJECT_KYC',
      table_name: 'kyc_documents',
      record_id: id.toString(),
      details: { kyc_id: id, reason }
    });

    return data;
  },

  async requestAdditionalDocuments(id: number, adminEmail: string, documents: string[]) {
    const { data, error } = await supabase
      .from('kyc_documents')
      .update({
        status: 'additional_required',
        additional_documents_requested: documents,
        requested_by: adminEmail,
        requested_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'REQUEST_ADDITIONAL_KYC',
      table_name: 'kyc_documents',
      record_id: id.toString(),
      details: { kyc_id: id, documents }
    });

    return data;
  },

  async bulkApprove(ids: number[], adminEmail: string) {
    const { data, error } = await supabase
      .from('kyc_documents')
      .update({
        status: 'approved',
        verified_by: adminEmail,
        verified_at: new Date().toISOString()
      })
      .in('id', ids)
      .select();

    if (error) throw error;

    const userIds = data.map(d => d.user_id);
    await supabase
      .from('user_accounts')
      .update({ kyc_verified: true })
      .in('Id', userIds);

    await supabase.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'BULK_APPROVE_KYC',
      table_name: 'kyc_documents',
      details: { kyc_ids: ids, count: ids.length }
    });

    return data;
  }
};
