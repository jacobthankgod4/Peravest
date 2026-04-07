import { supabase } from '../lib/supabase';

export interface PayoutRequest {
  cycleId: number;
  groupId: number;
  recipientUserId: number;
  amount: number;
}

export interface PayoutRecord {
  id: number;
  cycleId: number;
  groupId: number;
  recipientUserId: number;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payoutDate?: string;
  reference?: string;
}

export interface PayoutHistory {
  cycleNumber: number;
  recipientName: string;
  amount: number;
  payoutDate: string;
  status: string;
}

class PayoutProcessingService {
  /**
   * Get pending payouts for a group
   */
  async getPendingPayouts(groupId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_transactions')
        .select(`
          *,
          user_accounts(full_name, email, phone_number),
          ajo_cycles(cycle_number)
        `)
        .eq('group_id', groupId)
        .eq('transaction_type', 'payout')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending payouts:', error);
      throw error;
    }
  }

  /**
   * Get payout history for a group
   */
  async getPayoutHistory(groupId: number, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('ajo_transactions')
        .select(`
          *,
          user_accounts(full_name),
          ajo_cycles(cycle_number)
        `)
        .eq('group_id', groupId)
        .eq('transaction_type', 'payout')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(payout => ({
        cycleNumber: payout.ajo_cycles?.cycle_number,
        recipientName: payout.user_accounts?.full_name,
        amount: payout.amount,
        payoutDate: payout.processed_at || payout.created_at,
        status: payout.status,
      }));
    } catch (error) {
      console.error('Error fetching payout history:', error);
      throw error;
    }
  }

  /**
   * Get member's payout history
   */
  async getMemberPayoutHistory(userId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_transactions')
        .select(`
          *,
          ajo_groups(name),
          ajo_cycles(cycle_number)
        `)
        .eq('user_id', userId)
        .eq('transaction_type', 'payout')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(payout => ({
        groupName: payout.ajo_groups?.name,
        cycleNumber: payout.ajo_cycles?.cycle_number,
        amount: payout.amount,
        payoutDate: payout.processed_at || payout.created_at,
        reference: payout.payment_reference,
      }));
    } catch (error) {
      console.error('Error fetching member payout history:', error);
      throw error;
    }
  }

  /**
   * Process payout for a member
   */
  async processPayout(request: PayoutRequest): Promise<PayoutRecord> {
    try {
      // Create payout transaction
      const { data: payoutData, error: payoutError } = await supabase
        .from('ajo_transactions')
        .insert({
          group_id: request.groupId,
          cycle_id: request.cycleId,
          user_id: request.recipientUserId,
          amount: request.amount,
          transaction_type: 'payout',
          status: 'processing',
          payment_method: 'bank_transfer',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (payoutError) throw payoutError;

      // Update member payout status
      const { error: memberError } = await supabase
        .from('ajo_group_members')
        .update({
          payout_received: true,
          last_contribution_date: new Date().toISOString(),
        })
        .eq('user_id', request.recipientUserId)
        .eq('group_id', request.groupId);

      if (memberError) throw memberError;

      // Update cycle payout status
      const { error: cycleError } = await supabase
        .from('ajo_cycles')
        .update({
          status: 'completed',
          payout_date: new Date().toISOString(),
          payout_amount: request.amount,
        })
        .eq('id', request.cycleId);

      if (cycleError) throw cycleError;

      return {
        id: payoutData.id,
        cycleId: request.cycleId,
        groupId: request.groupId,
        recipientUserId: request.recipientUserId,
        amount: request.amount,
        status: 'processing',
      };
    } catch (error) {
      console.error('Error processing payout:', error);
      throw error;
    }
  }

  /**
   * Complete payout (mark as completed)
   */
  async completePayout(payoutId: number, reference: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ajo_transactions')
        .update({
          status: 'completed',
          payment_reference: reference,
          processed_at: new Date().toISOString(),
        })
        .eq('id', payoutId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing payout:', error);
      throw error;
    }
  }

  /**
   * Fail payout with reason
   */
  async failPayout(payoutId: number, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ajo_transactions')
        .update({
          status: 'failed',
          metadata: { failureReason: reason },
        })
        .eq('id', payoutId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error failing payout:', error);
      throw error;
    }
  }

  /**
   * Get payout statistics for a group
   */
  async getPayoutStats(groupId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_transactions')
        .select('status, amount')
        .eq('group_id', groupId)
        .eq('transaction_type', 'payout');

      if (error) throw error;

      const stats = {
        totalPayouts: data?.length || 0,
        completedPayouts: data?.filter(p => p.status === 'completed').length || 0,
        processingPayouts: data?.filter(p => p.status === 'processing').length || 0,
        failedPayouts: data?.filter(p => p.status === 'failed').length || 0,
        totalPayoutAmount: data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
        completionRate: data && data.length > 0
          ? Math.round((data.filter(p => p.status === 'completed').length / data.length) * 100)
          : 0,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching payout stats:', error);
      throw error;
    }
  }

  /**
   * Get next payout recipient for a group
   */
  async getNextPayoutRecipient(groupId: number) {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('ajo_groups')
        .select('current_cycle')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      const { data: memberData, error: memberError } = await supabase
        .from('ajo_group_members')
        .select(`
          *,
          user_accounts(full_name, email)
        `)
        .eq('group_id', groupId)
        .eq('payout_order', groupData.current_cycle)
        .single();

      if (memberError && memberError.code !== 'PGRST116') throw memberError;

      return memberData || null;
    } catch (error) {
      console.error('Error fetching next payout recipient:', error);
      throw error;
    }
  }

  /**
   * Verify payout eligibility
   */
  async verifyPayoutEligibility(userId: number, groupId: number): Promise<{
    eligible: boolean;
    reason: string;
    payoutAmount?: number;
  }> {
    try {
      // Check if member has completed all contributions
      const { data: memberData, error: memberError } = await supabase
        .from('ajo_group_members')
        .select('payout_received, payout_order')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .single();

      if (memberError) throw memberError;

      if (memberData.payout_received) {
        return {
          eligible: false,
          reason: 'Member has already received payout',
        };
      }

      // Check if it's member's turn
      const { data: groupData, error: groupError } = await supabase
        .from('ajo_groups')
        .select('current_cycle, contribution_amount, max_members')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      if (memberData.payout_order !== groupData.current_cycle) {
        return {
          eligible: false,
          reason: `Not your turn yet. Your payout is in cycle ${memberData.payout_order}`,
        };
      }

      // Check if all contributions are collected
      const { data: cycleData, error: cycleError } = await supabase
        .from('ajo_cycles')
        .select('total_expected, total_collected, status')
        .eq('group_id', groupId)
        .eq('cycle_number', groupData.current_cycle)
        .single();

      if (cycleError) throw cycleError;

      if (cycleData.status !== 'locked' && cycleData.status !== 'completed') {
        return {
          eligible: false,
          reason: 'Cycle is still collecting contributions',
        };
      }

      const payoutAmount = cycleData.total_collected;

      return {
        eligible: true,
        reason: 'Member is eligible for payout',
        payoutAmount,
      };
    } catch (error) {
      console.error('Error verifying payout eligibility:', error);
      throw error;
    }
  }
}

export const payoutProcessingService = new PayoutProcessingService();
