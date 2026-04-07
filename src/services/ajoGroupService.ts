import { supabase } from '../lib/supabase';
import {
  GroupNotFoundError,
  MemberNotFoundError,
  DuplicateMemberError,
  LowReliabilityError,
  NotEligibleForPayoutError,
} from '../types/ajoErrors';

export const ajoGroupService = {
  // Get group details
  getGroupDetails: async (groupId: number) => {
    try {
      const { data: group, error } = await supabase
        .from('ajo_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error || !group) throw new GroupNotFoundError(groupId);
      return { data: group };
    } catch (error) {
      console.error('getGroupDetails error:', error);
      throw error;
    }
  },

  // Get group members
  getGroupMembers: async (groupId: number) => {
    try {
      const { data: members, error } = await supabase
        .from('ajo_group_members')
        .select('*, user_accounts(Email, phone_number)')
        .eq('group_id', groupId)
        .order('position', { ascending: true });

      if (error) throw error;
      return { data: members || [] };
    } catch (error) {
      console.error('getGroupMembers error:', error);
      throw error;
    }
  },

  // Join group - 2.6: Enforce join reliability check
  joinGroup: async (groupId: number, userId: number) => {
    try {
      // Get group
      const { data: group, error: groupError } = await supabase
        .from('ajo_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError || !group) throw new GroupNotFoundError(groupId);

      // Check if already member
      const { data: existingMember } = await supabase
        .from('ajo_group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (existingMember) throw new DuplicateMemberError(groupId, userId);

      // Check reliability score - 2.6
      const { data: scoreResult, error: scoreError } = await supabase
        .rpc('can_member_join_group', {
          p_user_id: userId,
          p_group_id: groupId
        });

      if (scoreError) throw scoreError;

      if (!scoreResult.can_join) {
        throw new LowReliabilityError(
          scoreResult.member_score,
          scoreResult.group_threshold
        );
      }

      // Check group capacity
      if (group.current_members >= group.max_members) {
        throw new Error(`Group is full (${group.max_members}/${group.max_members})`);
      }

      // Add member
      const nextPosition = (group.current_members || 0) + 1;
      const { data: member, error: memberError } = await supabase
        .from('ajo_group_members')
        .insert([{
          group_id: groupId,
          user_id: userId,
          position: nextPosition,
          status: 'active',
          payout_order: nextPosition
        }])
        .select()
        .single();

      if (memberError) throw memberError;

      return { data: member };
    } catch (error) {
      console.error('joinGroup error:', error);
      throw error;
    }
  },

  // Leave group
  leaveGroup: async (groupId: number, userId: number) => {
    try {
      const { data: member, error: memberError } = await supabase
        .from('ajo_group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (memberError || !member) {
        throw new MemberNotFoundError(groupId, userId);
      }

      const { error } = await supabase
        .from('ajo_group_members')
        .update({ status: 'inactive' })
        .eq('id', member.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('leaveGroup error:', error);
      throw error;
    }
  },

  // Get member position in group
  getMemberPosition: async (groupId: number, userId: number) => {
    try {
      const { data: member, error } = await supabase
        .from('ajo_group_members')
        .select('position, payout_order, status')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (error || !member) {
        throw new MemberNotFoundError(groupId, userId);
      }

      return { data: member };
    } catch (error) {
      console.error('getMemberPosition error:', error);
      throw error;
    }
  },

  // Check if member is eligible for payout - 2.5: Eligible checker
  isEligibleForPayout: async (groupId: number, userId: number, cycleId: number) => {
    try {
      const { data: member, error: memberError } = await supabase
        .from('ajo_group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (memberError || !member) {
        throw new MemberNotFoundError(groupId, userId);
      }

      // Get current cycle
      const { data: cycle, error: cycleError } = await supabase
        .from('ajo_cycles')
        .select('*')
        .eq('id', cycleId)
        .single();

      if (cycleError || !cycle) throw new Error('Cycle not found');

      // Check if member is payout recipient for this cycle
      const { data: payoutMember } = await supabase
        .from('ajo_group_members')
        .select('id')
        .eq('id', cycle.payout_recipient_id)
        .single();

      if (!payoutMember || payoutMember.id !== member.id) {
        throw new NotEligibleForPayoutError('Not your payout turn');
      }

      // Check member status
      if (member.status !== 'active') {
        throw new NotEligibleForPayoutError('Member status is not active');
      }

      // Check if all contributions received
      const { data: history } = await supabase
        .from('ajo_member_history')
        .select('status')
        .eq('cycle_id', cycleId)
        .eq('user_id', userId)
        .single();

      if (history?.status === 'defaulted') {
        throw new NotEligibleForPayoutError('Member has defaulted on contribution');
      }

      return { eligible: true };
    } catch (error) {
      console.error('isEligibleForPayout error:', error);
      throw error;
    }
  },

  // Get group cycles
  getGroupCycles: async (groupId: number) => {
    try {
      const { data: cycles, error } = await supabase
        .from('ajo_cycles')
        .select('*')
        .eq('group_id', groupId)
        .order('cycle_number', { ascending: false });

      if (error) throw error;
      return { data: cycles || [] };
    } catch (error) {
      console.error('getGroupCycles error:', error);
      throw error;
    }
  },

  // Get current cycle
  getCurrentCycle: async (groupId: number) => {
    try {
      const { data: cycle, error } = await supabase
        .from('ajo_cycles')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'collecting')
        .order('cycle_number', { ascending: false })
        .limit(1)
        .single();

      if (error) return { data: null };
      return { data: cycle };
    } catch (error) {
      console.error('getCurrentCycle error:', error);
      return { data: null };
    }
  },

  // Get user's groups
  getUserGroups: async (userId: number) => {
    try {
      const { data: memberships, error } = await supabase
        .from('ajo_group_members')
        .select('group_id, ajo_groups(*)')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;

      return {
        data: memberships?.map(m => m.ajo_groups) || []
      };
    } catch (error) {
      console.error('getUserGroups error:', error);
      return { data: [] };
    }
  }
};
