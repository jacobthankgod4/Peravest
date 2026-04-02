import { supabase } from '../lib/supabase';

export const ajoService = {
  // Create new Ajo savings plan
  createAjo: async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userData } = await supabase
        .from('user_accounts')
        .select('Id')
        .eq('Email', user.email)
        .single();

      if (!userData) throw new Error('User not found');

      const startDate = new Date(data.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + data.duration);

      const { data: ajo, error } = await supabase
        .from('ajo_savings')
        .insert([{
          user_id: userData.Id,
          ajo_type: data.ajoType,
          contribution_amount: data.contributionAmount,
          frequency: data.frequency,
          duration: data.duration,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          total_commitment: data.totalCommitment,
          payment_reference: data.paymentReference,
          payment_status: 'completed',
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      // Create first transaction
      await supabase
        .from('ajo_transactions')
        .insert([{
          ajo_id: ajo.id,
          user_id: userData.Id,
          amount: data.firstPayment,
          transaction_type: 'contribution',
          payment_reference: data.paymentReference,
          status: 'completed'
        }]);

      return { data: ajo };
    } catch (error) {
      console.error('createAjo error:', error);
      throw error;
    }
  },

  // Get user's Ajo savings
  getUserAjos: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: [] };

      const { data: userData } = await supabase
        .from('user_accounts')
        .select('Id')
        .eq('Email', user.email)
        .single();

      if (!userData) return { data: [] };

      const { data, error } = await supabase
        .from('ajo_savings')
        .select('*')
        .eq('user_id', userData.Id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      console.error('getUserAjos error:', error);
      return { data: [] };
    }
  },

  // Get Ajo transactions
  getAjoTransactions: async (ajoId: number) => {
    try {
      const { data, error } = await supabase
        .from('ajo_transactions')
        .select('*')
        .eq('ajo_id', ajoId)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      console.error('getAjoTransactions error:', error);
      return { data: [] };
    }
  },

  // Get Ajo stats
  getAjoStats: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: { totalSaved: 0, activeAjos: 0, totalCommitment: 0 } };

      const { data: userData } = await supabase
        .from('user_accounts')
        .select('Id')
        .eq('Email', user.email)
        .single();

      if (!userData) return { data: { totalSaved: 0, activeAjos: 0, totalCommitment: 0 } };

      const { data: ajos } = await supabase
        .from('ajo_savings')
        .select('current_balance, total_commitment, status')
        .eq('user_id', userData.Id);

      const totalSaved = ajos?.reduce((sum, ajo) => sum + Number(ajo.current_balance), 0) || 0;
      const activeAjos = ajos?.filter(ajo => ajo.status === 'active').length || 0;
      const totalCommitment = ajos?.reduce((sum, ajo) => sum + Number(ajo.total_commitment), 0) || 0;

      return {
        data: {
          totalSaved,
          activeAjos,
          totalCommitment
        }
      };
    } catch (error) {
      console.error('getAjoStats error:', error);
      throw error;
    }
  },

  // Update Ajo balance
  updateAjoBalance: async (ajoId: number, amount: number) => {
    try {
      const { data: ajo } = await supabase
        .from('ajo_savings')
        .select('current_balance')
        .eq('id', ajoId)
        .single();

      if (!ajo) throw new Error('Ajo not found');

      const newBalance = Number(ajo.current_balance) + amount;

      const { error } = await supabase
        .from('ajo_savings')
        .update({ current_balance: newBalance })
        .eq('id', ajoId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('updateAjoBalance error:', error);
      throw error;
    }
  }
};
