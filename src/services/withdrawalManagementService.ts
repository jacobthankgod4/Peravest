import { supabase } from '../lib/supabase';

export interface WithdrawalRequest {
  userId: number;
  groupId: number;
  amount: number;
  reason: string;
}

export interface WithdrawalLock {
  id: number;
  groupId: number;
  userId: number;
  lockType: 'cycle_incomplete' | 'contribution_pending' | 'payout_processing' | 'dispute';
  lockedUntil: string;
  reason: string;
  releasedAt?: string;
}

export interface WithdrawalEligibility {
  eligible: boolean;
  availableAmount: number;
  locks: WithdrawalLock[];
  reason: string;
}

class WithdrawalManagementService {
  /**
   * Check withdrawal eligibility
   */
  async checkWithdrawalEligibility(userId: number, groupId: number): Promise<WithdrawalEligibility> {
    try {
      // Get active locks
      const { data: locks, error: locksError } = await supabase
        .from('ajo_withdrawal_locks')
        .select('*')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .is('released_at', null);

      if (locksError) throw locksError;

      if ((locks || []).length > 0) {
        return {
          eligible: false,
          availableAmount: 0,
          locks: locks || [],
          reason: `Withdrawal locked: ${locks?.[0]?.reason}`,
        };
      }

      // Get member's total contributed
      const { data: memberData, error: memberError } = await supabase
        .from('ajo_group_members')
        .select('total_contributed, payout_received')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .single();

      if (memberError) throw memberError;

      // Get member's payout amount if received
      const { data: payoutData, error: payoutError } = await supabase
        .from('ajo_transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .eq('transaction_type', 'payout')
        .eq('status', 'completed')
        .single();

      if (payoutError && payoutError.code !== 'PGRST116') throw payoutError;

      const payoutAmount = payoutData?.amount || 0;
      const availableAmount = payoutAmount;

      return {
        eligible: availableAmount > 0,
        availableAmount,
        locks: [],
        reason: availableAmount > 0 ? 'Eligible for withdrawal' : 'No available funds',
      };
    } catch (error) {
      console.error('Error checking withdrawal eligibility:', error);
      throw error;
    }
  }

  /**
   * Create withdrawal lock
   */
  async createWithdrawalLock(
    userId: number,
    groupId: number,
    lockType: string,
    reason: string,
    daysLocked: number = 7
  ): Promise<WithdrawalLock> {
    try {
      const lockedUntil = new Date();
      lockedUntil.setDate(lockedUntil.getDate() + daysLocked);

      const { data, error } = await supabase
        .from('ajo_withdrawal_locks')
        .insert({
          group_id: groupId,
          user_id: userId,
          lock_type: lockType,
          reason,
          locked_until: lockedUntil.toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating withdrawal lock:', error);
      throw error;
    }
  }

  /**
   * Release withdrawal lock
   */
  async releaseWithdrawalLock(lockId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ajo_withdrawal_locks')
        .update({ released_at: new Date().toISOString() })
        .eq('id', lockId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error releasing withdrawal lock:', error);
      throw error;
    }
  }

  /**
   * Get active locks for user
   */
  async getActiveLocks(userId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_withdrawal_locks')
        .select('*')
        .eq('user_id', userId)
        .is('released_at', null)
        .order('locked_until', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active locks:', error);
      throw error;
    }
  }

  /**
   * Get withdrawal history
   */
  async getWithdrawalHistory(userId: number, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('ajo_transactions')
        .select(`
          *,
          ajo_groups(name)
        `)
        .eq('user_id', userId)
        .in('transaction_type', ['withdrawal', 'payout'])
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(tx => ({
        id: tx.id,
        groupName: tx.ajo_groups?.name,
        type: tx.transaction_type,
        amount: tx.amount,
        date: tx.processed_at || tx.created_at,
        reference: tx.payment_reference,
      }));
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      throw error;
    }
  }

  /**
   * Process withdrawal request
   */
  async processWithdrawal(request: WithdrawalRequest) {
    try {
      // Check eligibility
      const eligibility = await this.checkWithdrawalEligibility(request.userId, request.groupId);

      if (!eligibility.eligible) {
        throw new Error(eligibility.reason);
      }

      if (request.amount > eligibility.availableAmount) {
        throw new Error(`Insufficient funds. Available: ₦${eligibility.availableAmount}`);
      }

      // Create withdrawal transaction
      const { data: txData, error: txError } = await supabase
        .from('ajo_transactions')
        .insert({
          group_id: request.groupId,
          user_id: request.userId,
          amount: request.amount,
          transaction_type: 'withdrawal',
          status: 'processing',
          payment_method: 'bank_transfer',
          metadata: { reason: request.reason },
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (txError) throw txError;

      // Create withdrawal lock during processing
      await this.createWithdrawalLock(
        request.userId,
        request.groupId,
        'payout_processing',
        'Withdrawal processing',
        1
      );

      return {
        success: true,
        transactionId: txData.id,
        amount: request.amount,
        status: 'processing',
      };
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      throw error;
    }
  }

  /**
   * Complete withdrawal
   */
  async completeWithdrawal(transactionId: number, reference: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ajo_transactions')
        .update({
          status: 'completed',
          payment_reference: reference,
          processed_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing withdrawal:', error);
      throw error;
    }
  }

  /**
   * Get withdrawal statistics
   */
  async getWithdrawalStats(userId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_transactions')
        .select('amount, status')
        .eq('user_id', userId)
        .eq('transaction_type', 'withdrawal');

      if (error) throw error;

      const stats = {
        totalWithdrawals: data?.length || 0,
        completedWithdrawals: data?.filter(w => w.status === 'completed').length || 0,
        processingWithdrawals: data?.filter(w => w.status === 'processing').length || 0,
        failedWithdrawals: data?.filter(w => w.status === 'failed').length || 0,
        totalWithdrawn: data?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching withdrawal stats:', error);
      throw error;
    }
  }

  /**
   * Auto-release expired locks
   */
  async releaseExpiredLocks(): Promise<number> {
    try {
      const { data: expiredLocks, error: fetchError } = await supabase
        .from('ajo_withdrawal_locks')
        .select('id')
        .lt('locked_until', new Date().toISOString())
        .is('released_at', null);

      if (fetchError) throw fetchError;

      let releasedCount = 0;

      for (const lock of expiredLocks || []) {
        const released = await this.releaseWithdrawalLock(lock.id);
        if (released) releasedCount++;
      }

      return releasedCount;
    } catch (error) {
      console.error('Error releasing expired locks:', error);
      throw error;
    }
  }
}

export const withdrawalManagementService = new WithdrawalManagementService();
