import { supabase } from '../lib/supabase';
import {
  InvalidAjoTypeError,
  GroupNotFoundError,
  MemberNotFoundError,
  DuplicateMemberError,
  LowReliabilityError,
} from '../types/ajoErrors';

type AjoType = 'personal' | 'group';

interface CreateAjoData {
  type: AjoType;
  contributionAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  duration: number;
  startDate: string;
  totalCommitment?: number;
  paymentReference: string;
  firstPayment: number;
  groupName?: string;
  groupDescription?: string;
  maxMembers?: number;
  reliabilityThreshold?: number;
}

export const ajoService = {
  // Create new Ajo (personal or group) - 2.1: Branch by type
  createAjo: async (data: CreateAjoData) => {
    try {
      if (!['personal', 'group'].includes(data.type)) {
        throw new InvalidAjoTypeError(data.type);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const user = session.user;

      const { data: userData } = await supabase
        .from('user_accounts')
        .select('Id')
        .eq('Email', user.email)
        .single();

      if (!userData) throw new Error('User not found');

      if (data.type === 'personal') {
        return await ajoService.createPersonalAjo(data, userData.Id);
      } else {
        return await ajoService.createGroupAjo(data, userData.Id);
      }
    } catch (error) {
      console.error('createAjo error:', error);
      throw error;
    }
  },

  // Create personal Ajo
  createPersonalAjo: async (data: CreateAjoData, userId: number) => {
    try {
      const startDate = new Date(data.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + data.duration);

      const { data: ajo, error } = await supabase
        .from('ajo_savings')
        .insert([{
          user_id: userId,
          ajo_type: 'personal',
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

      await supabase
        .from('ajo_transactions')
        .insert([{
          ajo_id: ajo.id,
          user_id: userId,
          amount: data.firstPayment,
          transaction_type: 'contribution',
          payment_reference: data.paymentReference,
          status: 'completed'
        }]);

      await ajoService.logAjoEvent('create_personal_ajo', {
        ajoId: ajo.id,
        userId,
        amount: data.contributionAmount
      });

      return { data: ajo };
    } catch (error) {
      console.error('createPersonalAjo error:', error);
      throw error;
    }
  },

  // Create group Ajo - 2.2: createGroup service
  createGroupAjo: async (data: CreateAjoData, userId: number) => {
    try {
      if (!data.groupName) throw new Error('Group name required');
      if (!data.maxMembers) throw new Error('Max members required');

      const { data: group, error } = await supabase
        .from('ajo_groups')
        .insert([{
          name: data.groupName,
          description: data.groupDescription || '',
          max_members: data.maxMembers,
          contribution_amount: data.contributionAmount,
          frequency: data.frequency,
          cycle_duration: data.duration,
          status: 'forming',
          created_by: userId,
          reliability_threshold: data.reliabilityThreshold || 0.7,
          payout_bid_enabled: false
        }])
        .select()
        .single();

      if (error) throw error;

      const { data: member, error: memberError } = await supabase
        .from('ajo_group_members')
        .insert([{
          group_id: group.id,
          user_id: userId,
          position: 1,
          status: 'active',
          payout_order: 1
        }])
        .select()
        .single();

      if (memberError) throw memberError;

      await ajoService.logAjoEvent('create_group_ajo', {
        groupId: group.id,
        userId,
        groupName: data.groupName,
        maxMembers: data.maxMembers
      });

      return { data: group };
    } catch (error) {
      console.error('createGroupAjo error:', error);
      throw error;
    }
  },

  // Get user's Ajo savings
  getUserAjos: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { data: [] };
      const user = session.user;

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

  // Get available groups with reliability filter - 2.3
  getAvailableGroups: async (userReliabilityScore?: number) => {
    try {
      let query = supabase
        .from('ajo_groups')
        .select('*, ajo_group_members(count)')
        .eq('status', 'forming')
        .order('created_at', { ascending: false });

      const { data: groups, error } = await query;

      if (error) throw error;

      // Filter by reliability threshold if user score provided
      if (userReliabilityScore !== undefined) {
        return {
          data: groups?.filter(g => userReliabilityScore >= (g.reliability_threshold || 0.7)) || []
        };
      }

      return { data: groups || [] };
    } catch (error) {
      console.error('getAvailableGroups error:', error);
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { data: { totalSaved: 0, activeAjos: 0, totalCommitment: 0 } };
      const user = session.user;

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
  },

  // Log Ajo event - 2.12: Event logging
  logAjoEvent: async (event: string, data: any) => {
    try {
      await supabase
        .from('ajo_event_logs')
        .insert([{
          event_type: event,
          event_data: data,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('logAjoEvent error:', error);
      // Don't throw - logging failures shouldn't break main flow
    }
  }
};
