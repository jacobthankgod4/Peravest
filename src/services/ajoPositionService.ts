import { supabase } from '../lib/supabase';
import { InvalidPositionError } from '../types/ajoErrors';

export const ajoPositionService = {
  // Bid for position - 2.10: Position bidding service
  bidForPosition: async (groupId: number, userId: number, bidAmount: number, desiredPosition: number) => {
    try {
      // Get group
      const { data: group, error: groupError } = await supabase
        .from('ajo_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError || !group) throw new Error('Group not found');

      if (!group.payout_bid_enabled) {
        throw new Error('Position bidding is not enabled for this group');
      }

      // Validate position
      if (desiredPosition < 1 || desiredPosition > group.max_members) {
        throw new InvalidPositionError(desiredPosition, group.max_members);
      }

      // Get member
      const { data: member, error: memberError } = await supabase
        .from('ajo_group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (memberError || !member) throw new Error('Member not found');

      // Create bid
      const { data: bid, error: bidError } = await supabase
        .from('ajo_position_bids')
        .insert([{
          group_id: groupId,
          member_id: member.id,
          user_id: userId,
          bid_amount: bidAmount,
          desired_position: desiredPosition,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (bidError) throw bidError;

      return { data: bid };
    } catch (error) {
      console.error('bidForPosition error:', error);
      throw error;
    }
  },

  // Get member's current position
  getMemberPosition: async (groupId: number, userId: number) => {
    try {
      const { data: member, error } = await supabase
        .from('ajo_group_members')
        .select('position, payout_order')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (error || !member) throw new Error('Member not found');

      return { data: member };
    } catch (error) {
      console.error('getMemberPosition error:', error);
      throw error;
    }
  },

  // Get payout order for cycle
  getPayoutOrder: async (groupId: number) => {
    try {
      const { data: members, error } = await supabase
        .from('ajo_group_members')
        .select('id, user_id, payout_order, position')
        .eq('group_id', groupId)
        .eq('status', 'active')
        .order('payout_order', { ascending: true });

      if (error) throw error;

      return { data: members || [] };
    } catch (error) {
      console.error('getPayoutOrder error:', error);
      throw error;
    }
  },

  // Get next payout recipient
  getNextPayoutRecipient: async (groupId: number) => {
    try {
      const { data: cycle, error: cycleError } = await supabase
        .from('ajo_cycles')
        .select('payout_recipient_id')
        .eq('group_id', groupId)
        .eq('status', 'collecting')
        .single();

      if (cycleError || !cycle) return { data: null };

      const { data: member, error: memberError } = await supabase
        .from('ajo_group_members')
        .select('user_id, position, payout_order')
        .eq('id', cycle.payout_recipient_id)
        .single();

      if (memberError || !member) return { data: null };

      return { data: member };
    } catch (error) {
      console.error('getNextPayoutRecipient error:', error);
      return { data: null };
    }
  },

  // Rotate payout order (called after cycle completion)
  rotatePayoutOrder: async (groupId: number) => {
    try {
      // Get all active members ordered by payout_order
      const { data: members, error: membersError } = await supabase
        .from('ajo_group_members')
        .select('id, payout_order')
        .eq('group_id', groupId)
        .eq('status', 'active')
        .order('payout_order', { ascending: true });

      if (membersError || !members || members.length === 0) {
        throw new Error('No active members found');
      }

      // Rotate: move first to last
      const newOrder = members.map((m, index) => ({
        id: m.id,
        newOrder: (index + 1) % members.length || members.length
      }));

      // Update all members
      for (const member of newOrder) {
        await supabase
          .from('ajo_group_members')
          .update({ payout_order: member.newOrder })
          .eq('id', member.id);
      }

      return { success: true, rotatedCount: members.length };
    } catch (error) {
      console.error('rotatePayoutOrder error:', error);
      throw error;
    }
  },

  // Check if member is eligible for payout this cycle
  isPayoutEligible: async (groupId: number, userId: number, cycleId: number) => {
    try {
      // Get member
      const { data: member, error: memberError } = await supabase
        .from('ajo_group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (memberError || !member) throw new Error('Member not found');

      // Get cycle
      const { data: cycle, error: cycleError } = await supabase
        .from('ajo_cycles')
        .select('payout_recipient_id')
        .eq('id', cycleId)
        .single();

      if (cycleError || !cycle) throw new Error('Cycle not found');

      // Check if this member is payout recipient
      const isRecipient = cycle.payout_recipient_id === member.id;

      // Check member contribution status
      const { data: history } = await supabase
        .from('ajo_member_history')
        .select('status')
        .eq('cycle_id', cycleId)
        .eq('user_id', userId)
        .single();

      const hasContributed = history?.status === 'paid' || history?.status === 'late';

      return {
        eligible: isRecipient && hasContributed,
        isRecipient,
        hasContributed,
        reason: !isRecipient ? 'Not your payout turn' : !hasContributed ? 'Contribution not received' : 'Eligible'
      };
    } catch (error) {
      console.error('isPayoutEligible error:', error);
      throw error;
    }
  }
};
