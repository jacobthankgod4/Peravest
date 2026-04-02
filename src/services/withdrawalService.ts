import { supabase } from '../lib/supabase';

export const withdrawalService = {
  create: async (data: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: userData } = await supabase
      .from('user_accounts')
      .select('Id')
      .eq('Email', user.email)
      .single();

    if (!userData) throw new Error('User not found');

    const { data: withdrawal, error } = await supabase
      .from('withdrawals')
      .insert([{
        user_id: userData.Id,
        amount: data.amount,
        bank_name: data.bankName,
        account_number: data.accountNumber,
        account_name: data.accountName,
        reference: data.reference
      }])
      .select()
      .single();

    if (error) throw error;
    return withdrawal;
  },

  requestWithdrawal: async (data: any) => {
    return withdrawalService.create(data);
  },

  getUserWithdrawals: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: userData } = await supabase
      .from('user_accounts')
      .select('Id')
      .eq('Email', user.email)
      .single();

    if (!userData) return { data: [] };

    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userData.Id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [] };
  },

  getHistory: async () => {
    return withdrawalService.getUserWithdrawals();
  },

  getAvailableBalance: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: userData } = await supabase
      .from('user_accounts')
      .select('Id')
      .eq('Email', user.email)
      .single();

    if (!userData) return { data: { balance: 0 } };

    const { data: investments } = await supabase
      .from('invest_now')
      .select('share_cost, interest')
      .eq('Usa_Id', userData.Id);

    const balance = investments?.reduce((sum, inv) => {
      return sum + Number(inv.share_cost) + Number(inv.interest || 0);
    }, 0) || 0;

    return { data: { balance } };
  },

  getBankAccounts: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: userData } = await supabase
      .from('user_accounts')
      .select('bank_name, account_number, Name')
      .eq('Email', user.email)
      .single();

    return { 
      data: userData ? [{
        id: 1,
        bank_name: userData.bank_name,
        account_number: userData.account_number,
        account_name: userData.Name,
        is_default: true
      }] : []
    };
  },

  addBankAccount: async (data: any) => {
    console.log('🔵 withdrawalService.addBankAccount called');
    console.log('📝 Input data:', data);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Current user:', user?.email);
      
      if (!user) throw new Error('Not authenticated');

      console.log('🔍 Querying user_accounts table for:', user.email);
      const { data: userData, error: userError } = await supabase
        .from('user_accounts')
        .select('Id')
        .eq('Email', user.email)
        .single();

      console.log('📊 Query result:', { userData, userError });
      
      if (userError) {
        console.error('❌ Supabase error:', userError);
        throw new Error(`Database error: ${userError.message} (Code: ${userError.code})`);
      }

      if (!userData) throw new Error('User not found in database');

      console.log('🔄 Updating user bank info for ID:', userData.Id);
      const { error: updateError } = await supabase
        .from('user_accounts')
        .update({
          bank_name: data.bank_name,
          account_number: data.account_number
        })
        .eq('Id', userData.Id);

      console.log('📊 Update result:', { updateError });
      
      if (updateError) {
        console.error('❌ Update error:', updateError);
        throw new Error(`Update failed: ${updateError.message} (Code: ${updateError.code})`);
      }

      console.log('✅ Bank account added successfully');
      return { data: { id: 1, ...data, is_default: true } };
    } catch (error: any) {
      console.error('❌ Exception in addBankAccount:', error);
      throw error;
    }
  }
};
