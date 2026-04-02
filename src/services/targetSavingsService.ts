import { supabase } from '../lib/supabase';

export const targetSavingsService = {
  // Create new Target Savings plan
  createTargetSavings: async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userData } = await supabase
        .from('user_accounts')
        .select('Id')
        .eq('Email', user.email)
        .single();

      if (!userData) throw new Error('User not found');

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + data.duration);

      const { data: targetSavings, error } = await supabase
        .from('target_savings')
        .insert([{
          user_id: userData.Id,
          savings_type: data.savingsType,
          goal_name: data.goalName,
          target_amount: data.targetAmount,
          current_amount: data.firstPayment,
          contribution_amount: data.monthlyAmount,
          frequency: data.frequency,
          duration: data.duration,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          payment_reference: data.paymentReference,
          payment_status: 'completed',
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      // Create first transaction
      await supabase
        .from('target_savings_transactions')
        .insert([{
          target_savings_id: targetSavings.id,
          user_id: userData.Id,
          amount: data.firstPayment,
          transaction_type: 'contribution',
          payment_reference: data.paymentReference,
          status: 'completed'
        }]);

      return { data: targetSavings };
    } catch (error) {
      console.error('createTargetSavings error:', error);
      throw error;
    }
  },

  // Get user's Target Savings
  getUserTargetSavings: async () => {
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
        .from('target_savings')
        .select('*')
        .eq('user_id', userData.Id)
        .order('created_at', { ascending: false});

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      console.error('getUserTargetSavings error:', error);
      return { data: [] };
    }
  },

  // Get Target Savings transactions
  getTargetSavingsTransactions: async (targetSavingsId: number) => {
    try {
      const { data, error } = await supabase
        .from('target_savings_transactions')
        .select('*')
        .eq('target_savings_id', targetSavingsId)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      console.error('getTargetSavingsTransactions error:', error);
      return { data: [] };
    }
  },

  // Get Target Savings stats
  getTargetSavingsStats: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: { totalSaved: 0, activeGoals: 0, completedGoals: 0 } };

      const { data: userData } = await supabase
        .from('user_accounts')
        .select('Id')
        .eq('Email', user.email)
        .single();

      if (!userData) return { data: { totalSaved: 0, activeGoals: 0, completedGoals: 0 } };

      const { data: savings } = await supabase
        .from('target_savings')
        .select('current_amount, status')
        .eq('user_id', userData.Id);

      const totalSaved = savings?.reduce((sum, s) => sum + Number(s.current_amount), 0) || 0;
      const activeGoals = savings?.filter(s => s.status === 'active').length || 0;
      const completedGoals = savings?.filter(s => s.status === 'completed').length || 0;

      return {
        data: {
          totalSaved,
          activeGoals,
          completedGoals
        }
      };
    } catch (error) {
      console.error('getTargetSavingsStats error:', error);
      throw error;
    }
  },

  // Update Target Savings amount
  updateTargetSavingsAmount: async (targetSavingsId: number, amount: number) => {
    try {
      const { data: savings } = await supabase
        .from('target_savings')
        .select('current_amount, target_amount')
        .eq('id', targetSavingsId)
        .single();

      if (!savings) throw new Error('Target Savings not found');

      const newAmount = Number(savings.current_amount) + amount;
      const status = newAmount >= Number(savings.target_amount) ? 'completed' : 'active';

      const { error } = await supabase
        .from('target_savings')
        .update({ 
          current_amount: newAmount,
          status: status
        })
        .eq('id', targetSavingsId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('updateTargetSavingsAmount error:', error);
      throw error;
    }
  }
};
