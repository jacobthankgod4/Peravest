import { supabase } from '../lib/supabase';
import { AjoWithdrawalLock } from '../types/ajo';

// Withdrawal Rules Configuration
export const WITHDRAWAL_RULES = {
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
} as const;

// Withdrawal States
export enum WithdrawalState {
  LOCKED = 'locked',
  ELIGIBLE = 'eligible', 
  PENDING = 'pending',
  COMPLETED = 'completed',
  DENIED = 'denied'
}

export class AjoWithdrawalController {
  
  // Check if user can withdraw from group
  static async checkWithdrawalEligibility(
    userId: number, 
    groupId: number
  ): Promise<{
    state: WithdrawalState;
    reason?: string;
    next_eligible_date?: string;
    amount_available?: number;
  }> {
    
    // Check for active withdrawal locks
    const { data: locks } = await supabase
      .from('ajo_withdrawal_locks')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .is('released_at', null)
      .gte('locked_until', new Date().toISOString());

    if (locks && locks.length > 0) {
      return {
        state: WithdrawalState.LOCKED,
        reason: locks[0].reason,
        next_eligible_date: locks[0].locked_until
      };
    }

    // Get member info
    const { data: member } = await supabase
      .from('ajo_group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (!member) {
      return {
        state: WithdrawalState.DENIED,
        reason: 'Not a member of this group'
      };
    }

    // Get group and current cycle info
    const { data: group } = await supabase
      .from('ajo_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (!group) {
      return {
        state: WithdrawalState.DENIED,
        reason: 'Group not found'
      };
    }

    // Check if it's user's turn for payout
    const isUserTurn = member.payout_order === group.current_cycle;
    
    if (!isUserTurn) {
      // Calculate next eligible date
      const cyclesUntilTurn = member.payout_order - group.current_cycle;
      const nextDate = new Date();
      
      if (group.frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + (cyclesUntilTurn * 7));
      } else {
        nextDate.setMonth(nextDate.getMonth() + cyclesUntilTurn);
      }

      return {
        state: WithdrawalState.LOCKED,
        reason: 'Not your turn for payout yet',
        next_eligible_date: nextDate.toISOString()
      };
    }

    // Check if current cycle is complete
    const { data: currentCycle } = await supabase
      .from('ajo_cycles')
      .select('*')
      .eq('group_id', groupId)
      .eq('cycle_number', group.current_cycle)
      .single();

    if (!currentCycle || currentCycle.status !== 'completed') {
      return {
        state: WithdrawalState.LOCKED,
        reason: 'Current cycle not yet completed'
      };
    }

    // Check if already received payout
    if (member.payout_received) {
      return {
        state: WithdrawalState.COMPLETED,
        reason: 'Payout already received'
      };
    }

    // User is eligible
    return {
      state: WithdrawalState.ELIGIBLE,
      amount_available: currentCycle.payout_amount
    };
  }

  // Create withdrawal lock
  static async createWithdrawalLock(
    groupId: number,
    cycleId: number | null,
    userId: number | null,
    lockType: 'cycle_incomplete' | 'contribution_pending' | 'payout_processing' | 'dispute',
    lockDurationHours: number,
    reason: string
  ): Promise<{ success: boolean; lock_id: number }> {
    
    const lockUntil = new Date();
    lockUntil.setHours(lockUntil.getHours() + lockDurationHours);

    const { data: lock, error } = await supabase
      .from('ajo_withdrawal_locks')
      .insert([{
        group_id: groupId,
        cycle_id: cycleId,
        user_id: userId,
        lock_type: lockType,
        locked_until: lockUntil.toISOString(),
        reason: reason
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, lock_id: lock.id };
  }

  // Release withdrawal lock
  static async releaseWithdrawalLock(lockId: number): Promise<{ success: boolean }> {
    const { error } = await supabase
      .from('ajo_withdrawal_locks')
      .update({ released_at: new Date().toISOString() })
      .eq('id', lockId);

    if (error) throw error;
    return { success: true };
  }

  // Get active locks for group
  static async getActiveLocks(groupId: number): Promise<{ locks: AjoWithdrawalLock[] }> {
    const { data: locks, error } = await supabase
      .from('ajo_withdrawal_locks')
      .select('*')
      .eq('group_id', groupId)
      .is('released_at', null)
      .gte('locked_until', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { locks: locks || [] };
  }

  // Process withdrawal request
  static async processWithdrawalRequest(
    userId: number,
    groupId: number
  ): Promise<{
    success: boolean;
    transaction_id?: number;
    amount?: number;
    error?: string;
  }> {
    
    // Check eligibility first
    const eligibility = await this.checkWithdrawalEligibility(userId, groupId);
    
    if (eligibility.state !== WithdrawalState.ELIGIBLE) {
      return {
        success: false,
        error: eligibility.reason || 'Not eligible for withdrawal'
      };
    }

    try {
      // Process atomic withdrawal
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
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Auto-lock group during incomplete cycles
  static async autoLockIncompleteContributions(): Promise<{ locked_groups: number[] }> {
    const lockedGroups: number[] = [];

    // Find cycles with incomplete contributions past deadline
    const { data: incompleteCycles } = await supabase
      .from('ajo_cycles')
      .select(`
        id, group_id, contribution_deadline,
        ajo_groups(max_members, contribution_amount)
      `)
      .eq('status', 'collecting')
      .lt('contribution_deadline', new Date().toISOString());

    if (!incompleteCycles) return { locked_groups: [] };

    for (const cycle of incompleteCycles) {
      // Count actual contributions
      const { count: contributionCount } = await supabase
        .from('ajo_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('cycle_id', cycle.id)
        .eq('transaction_type', 'contribution')
        .eq('status', 'completed');

      const ajoGroup = Array.isArray(cycle.ajo_groups) ? cycle.ajo_groups[0] : cycle.ajo_groups;
      const expectedContributions = ajoGroup?.max_members || 0;

      if (contributionCount !== null && contributionCount < expectedContributions) {
        // Lock withdrawals for this group
        await this.createWithdrawalLock(
          cycle.group_id,
          cycle.id,
          null, // Lock entire group
          'cycle_incomplete',
          24, // 24 hour lock
          `Cycle ${cycle.id} incomplete: ${contributionCount}/${expectedContributions} contributions received`
        );

        lockedGroups.push(cycle.group_id);
      }
    }

    return { locked_groups: lockedGroups };
  }

  // Emergency unlock (admin only)
  static async emergencyUnlock(
    groupId: number,
    adminUserId: number,
    reason: string
  ): Promise<{ success: boolean }> {
    
    // Verify admin status (implement your admin check logic)
    // For now, just release all locks for the group
    
    const { error } = await supabase
      .from('ajo_withdrawal_locks')
      .update({ 
        released_at: new Date().toISOString(),
        reason: `${reason} - Emergency unlock by admin ${adminUserId}`
      })
      .eq('group_id', groupId)
      .is('released_at', null);

    if (error) throw error;
    return { success: true };
  }
}