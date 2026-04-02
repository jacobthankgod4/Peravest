import { supabase } from '../lib/supabase';
import { AjoWithdrawalController, WithdrawalState } from './ajoWithdrawalController';
import { PersonalAjoWithdrawalService } from './personalAjoWithdrawalService';

// Unified Withdrawal Request
export interface UnifiedWithdrawalRequest {
  user_id: number;
  ajo_id?: number; // For personal Ajo
  group_id?: number; // For group Ajo
  amount?: number; // For personal Ajo (optional for group - full payout)
  withdrawal_type: 'group' | 'personal';
}

// Unified Withdrawal Response
export interface UnifiedWithdrawalResponse {
  success: boolean;
  transaction_id?: number;
  amount?: number;
  penalty_amount?: number;
  remaining_balance?: number;
  state?: WithdrawalState;
  error?: string;
  reason?: string;
}

/**
 * Unified Ajo Withdrawal Manager
 * Routes withdrawal requests to appropriate handler based on Ajo type
 */
export class UnifiedAjoWithdrawalManager {
  
  /**
   * Process withdrawal request - automatically detects type and routes
   */
  static async processWithdrawal(
    request: UnifiedWithdrawalRequest
  ): Promise<UnifiedWithdrawalResponse> {
    
    // Validate request
    if (request.withdrawal_type === 'group' && !request.group_id) {
      return {
        success: false,
        error: 'Group ID required for group Ajo withdrawal'
      };
    }

    if (request.withdrawal_type === 'personal' && !request.ajo_id) {
      return {
        success: false,
        error: 'Ajo ID required for personal Ajo withdrawal'
      };
    }

    // Route to appropriate handler
    if (request.withdrawal_type === 'group') {
      return await this.processGroupWithdrawal(request.user_id, request.group_id!);
    } else {
      return await this.processPersonalWithdrawal(
        request.user_id, 
        request.ajo_id!, 
        request.amount
      );
    }
  }

  /**
   * Process Group Ajo withdrawal (rotation-based, synchronized)
   */
  private static async processGroupWithdrawal(
    userId: number,
    groupId: number
  ): Promise<UnifiedWithdrawalResponse> {
    
    const result = await AjoWithdrawalController.processWithdrawalRequest(userId, groupId);
    
    return {
      success: result.success,
      transaction_id: result.transaction_id,
      amount: result.amount,
      error: result.error
    };
  }

  /**
   * Process Personal Ajo withdrawal (flexible, penalty-based)
   */
  private static async processPersonalWithdrawal(
    userId: number,
    ajoId: number,
    amount?: number
  ): Promise<UnifiedWithdrawalResponse> {
    
    // If no amount specified, withdraw full balance
    if (!amount) {
      const { data: ajo } = await supabase
        .from('ajo_savings')
        .select('current_balance')
        .eq('id', ajoId)
        .eq('user_id', userId)
        .single();

      if (!ajo) {
        return {
          success: false,
          error: 'Personal Ajo not found'
        };
      }

      amount = Number(ajo.current_balance);
    }

    const result = await PersonalAjoWithdrawalService.processWithdrawal(
      userId, 
      ajoId, 
      amount
    );
    
    return result;
  }

  /**
   * Check withdrawal eligibility (auto-detects type)
   */
  static async checkEligibility(
    userId: number,
    ajoId?: number,
    groupId?: number
  ): Promise<{
    can_withdraw: boolean;
    type: 'group' | 'personal';
    reason?: string;
    details?: any;
  }> {
    
    // Determine type
    if (groupId) {
      // Group Ajo eligibility
      const eligibility = await AjoWithdrawalController.checkWithdrawalEligibility(
        userId, 
        groupId
      );
      
      return {
        can_withdraw: eligibility.state === WithdrawalState.ELIGIBLE,
        type: 'group',
        reason: eligibility.reason,
        details: eligibility
      };
    } 
    
    if (ajoId) {
      // Personal Ajo eligibility
      const eligibility = await PersonalAjoWithdrawalService.checkEligibility(
        userId, 
        ajoId
      );
      
      return {
        can_withdraw: eligibility.can_withdraw,
        type: 'personal',
        reason: eligibility.reason,
        details: eligibility
      };
    }

    return {
      can_withdraw: false,
      type: 'personal',
      reason: 'No Ajo ID or Group ID provided'
    };
  }

  /**
   * Get withdrawal history (unified for both types)
   */
  static async getWithdrawalHistory(
    userId: number
  ): Promise<{
    group_withdrawals: any[];
    personal_withdrawals: any[];
    total_withdrawn: number;
  }> {
    
    // Get group withdrawals
    const { data: groupTransactions } = await supabase
      .from('ajo_transactions')
      .select(`
        id, amount, transaction_type, status, created_at,
        ajo_groups(name)
      `)
      .eq('user_id', userId)
      .eq('transaction_type', 'payout')
      .not('group_id', 'is', null)
      .order('created_at', { ascending: false });

    // Get personal withdrawals
    const { data: personalTransactions } = await supabase
      .from('ajo_transactions')
      .select(`
        id, amount, transaction_type, status, transaction_date,
        ajo_savings(ajo_type)
      `)
      .eq('user_id', userId)
      .eq('transaction_type', 'withdrawal')
      .order('transaction_date', { ascending: false });

    const groupWithdrawals = groupTransactions || [];
    const personalWithdrawals = personalTransactions || [];

    const totalWithdrawn = 
      groupWithdrawals.reduce((sum, t) => sum + Number(t.amount), 0) +
      personalWithdrawals.reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      group_withdrawals: groupWithdrawals,
      personal_withdrawals: personalWithdrawals,
      total_withdrawn: totalWithdrawn
    };
  }

  /**
   * Get comprehensive Ajo summary for user
   */
  static async getUserAjoSummary(userId: number): Promise<{
    group_ajo: {
      active_groups: number;
      total_contributed: number;
      total_received: number;
      pending_payout: boolean;
    };
    personal_ajo: {
      active_savings: number;
      total_balance: number;
      total_withdrawn: number;
    };
    overall: {
      total_savings: number;
      total_withdrawals: number;
    };
  }> {
    
    // Get group Ajo stats
    const { data: groupMemberships } = await supabase
      .from('ajo_group_members')
      .select(`
        total_contributed,
        payout_received,
        ajo_groups(status, current_cycle, contribution_amount)
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

    const activeGroups = groupMemberships?.length || 0;
    const totalContributed = groupMemberships?.reduce(
      (sum, m) => sum + Number(m.total_contributed), 0
    ) || 0;

    // Get group payouts received
    const { data: groupPayouts } = await supabase
      .from('ajo_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('transaction_type', 'payout')
      .eq('status', 'completed');

    const totalReceived = groupPayouts?.reduce(
      (sum, p) => sum + Number(p.amount), 0
    ) || 0;

    // Check if user has pending payout
    const pendingPayout = groupMemberships?.some(
      m => {
        const ajoGroup = Array.isArray(m.ajo_groups) ? m.ajo_groups[0] : m.ajo_groups;
        return !m.payout_received && ajoGroup.status === 'active';
      }
    ) || false;

    // Get personal Ajo stats
    const personalStats = await PersonalAjoWithdrawalService.getPersonalAjoSummary(userId);

    return {
      group_ajo: {
        active_groups: activeGroups,
        total_contributed: totalContributed,
        total_received: totalReceived,
        pending_payout: pendingPayout
      },
      personal_ajo: {
        active_savings: personalStats.active_ajos,
        total_balance: personalStats.total_balance,
        total_withdrawn: personalStats.total_withdrawn
      },
      overall: {
        total_savings: totalContributed + personalStats.total_balance,
        total_withdrawals: totalReceived + personalStats.total_withdrawn
      }
    };
  }
}
