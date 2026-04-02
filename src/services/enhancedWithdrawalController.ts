import { supabase } from '../lib/supabase';

// Withdrawal Rules
const WITHDRAWAL_RULES = {
  GROUP: {
    timing: 'SCHEDULED_ONLY',
    requires: 'FULL_CYCLE_COMPLETION',
    recipient: 'ROTATION_BASED'
  },
  PERSONAL: {
    timing: 'FLEXIBLE',
    requires: 'MINIMUM_BALANCE',
    recipient: 'ACCOUNT_OWNER'
  }
};

// Withdrawal States
export enum WithdrawalState {
  LOCKED = 'locked',
  ELIGIBLE = 'eligible',
  PENDING = 'pending',
  COMPLETED = 'completed'
}

export class EnhancedWithdrawalController {
  
  // Check withdrawal eligibility with rotation enforcement
  static async checkEligibility(userId: number, groupId: number): Promise<{
    state: WithdrawalState;
    reason?: string;
    next_date?: string;
    amount?: number;
  }> {
    // Check active locks
    const { data: locks } = await supabase
      .from('ajo_withdrawal_locks')
      .select('*')
      .eq('group_id', groupId)
      .is('released_at', null)
      .gte('locked_until', new Date().toISOString());

    if (locks && locks.length > 0) {
      return {
        state: WithdrawalState.LOCKED,
        reason: locks[0].reason,
        next_date: locks[0].locked_until
      };
    }

    // Get member and group info
    const { data: member } = await supabase
      .from('ajo_group_members')
      .select('payout_order, payout_received')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    const { data: group } = await supabase
      .from('ajo_groups')
      .select('current_cycle, status')
      .eq('id', groupId)
      .single();

    if (!member || !group) {
      return { state: WithdrawalState.LOCKED, reason: 'Not a member' };
    }

    // Check if it's user's turn (rotation-based)
    if (member.payout_order !== group.current_cycle) {
      return {
        state: WithdrawalState.LOCKED,
        reason: 'Not your turn',
        next_date: await this.calculateNextPayoutDate(groupId, member.payout_order)
      };
    }

    // Check if already received payout
    if (member.payout_received) {
      return { state: WithdrawalState.COMPLETED, reason: 'Already received' };
    }

    // Check cycle completion
    const { data: cycle } = await supabase
      .from('ajo_cycles')
      .select('status, payout_amount')
      .eq('group_id', groupId)
      .eq('cycle_number', group.current_cycle)
      .single();

    if (!cycle || cycle.status !== 'completed') {
      return { state: WithdrawalState.LOCKED, reason: 'Cycle incomplete' };
    }

    return {
      state: WithdrawalState.ELIGIBLE,
      amount: cycle.payout_amount
    };
  }

  // Process synchronized withdrawal
  static async processWithdrawal(userId: number, groupId: number): Promise<{
    success: boolean;
    transaction_id?: number;
    amount?: number;
    error?: string;
  }> {
    const eligibility = await this.checkEligibility(userId, groupId);
    
    if (eligibility.state !== WithdrawalState.ELIGIBLE) {
      return { success: false, error: eligibility.reason };
    }

    try {
      const { data, error } = await supabase.rpc('process_ajo_withdrawal', {
        p_user_id: userId,
        p_group_id: groupId
      });

      if (error) throw error;

      return {
        success: true,
        transaction_id: data.transaction_id,
        amount: data.amount
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Calculate next payout date based on rotation
  private static async calculateNextPayoutDate(groupId: number, payoutOrder: number): Promise<string> {
    const { data: group } = await supabase
      .from('ajo_groups')
      .select('current_cycle, frequency, next_payout_date')
      .eq('id', groupId)
      .single();

    if (!group) return '';

    const cyclesUntilTurn = payoutOrder - group.current_cycle;
    const nextDate = new Date(group.next_payout_date || Date.now());
    
    if (group.frequency === 'weekly') {
      nextDate.setDate(nextDate.getDate() + (cyclesUntilTurn * 7));
    } else {
      nextDate.setMonth(nextDate.getMonth() + cyclesUntilTurn);
    }

    return nextDate.toISOString();
  }

  // Emergency withdrawal (admin only)
  static async emergencyWithdrawal(
    adminUserId: number,
    groupId: number,
    targetUserId: number,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    // Verify admin status (implement your admin check)
    // For now, just process the withdrawal
    
    try {
      // Release all locks
      await supabase
        .from('ajo_withdrawal_locks')
        .update({ released_at: new Date().toISOString() })
        .eq('group_id', groupId)
        .is('released_at', null);

      // Process withdrawal
      const result = await this.processWithdrawal(targetUserId, groupId);
      
      // Log emergency action
      await supabase
        .from('ajo_transactions')
        .update({ 
          metadata: { 
            emergency: true, 
            admin_id: adminUserId, 
            reason 
          } 
        })
        .eq('id', result.transaction_id);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get withdrawal schedule for group
  static async getWithdrawalSchedule(groupId: number): Promise<Array<{
    cycle: number;
    user_id: number;
    payout_date: string;
    status: string;
  }>> {
    const { data: members } = await supabase
      .from('ajo_group_members')
      .select('user_id, payout_order, payout_received')
      .eq('group_id', groupId)
      .order('payout_order');

    const { data: group } = await supabase
      .from('ajo_groups')
      .select('frequency, started_at')
      .eq('id', groupId)
      .single();

    if (!members || !group) return [];

    return members.map(member => {
      const payoutDate = new Date(group.started_at || Date.now());
      
      if (group.frequency === 'weekly') {
        payoutDate.setDate(payoutDate.getDate() + ((member.payout_order - 1) * 7));
      } else {
        payoutDate.setMonth(payoutDate.getMonth() + (member.payout_order - 1));
      }

      return {
        cycle: member.payout_order,
        user_id: member.user_id,
        payout_date: payoutDate.toISOString(),
        status: member.payout_received ? 'completed' : 'pending'
      };
    });
  }
}
