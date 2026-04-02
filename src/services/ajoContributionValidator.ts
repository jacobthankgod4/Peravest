import { supabase } from '../lib/supabase';

// Contribution validation and pre-authorization
export class AjoContributionValidator {
  
  // Pre-authorize payments before cycle start
  static async preAuthorizePayments(groupId: number, cycleId: number): Promise<{
    success: boolean;
    authorized_members: number[];
    failed_authorizations: Array<{ user_id: number; reason: string }>;
  }> {
    const authorizedMembers: number[] = [];
    const failedAuthorizations: Array<{ user_id: number; reason: string }> = [];

    // Get all active members
    const { data: members } = await supabase
      .from('ajo_group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .eq('status', 'active');

    if (!members) return { success: false, authorized_members: [], failed_authorizations: [] };

    // Get cycle info for amount
    const { data: cycle } = await supabase
      .from('ajo_cycles')
      .select(`
        contribution_deadline,
        ajo_groups!inner(contribution_amount)
      `)
      .eq('id', cycleId)
      .single();

    if (!cycle) throw new Error('Cycle not found');

    const ajoGroup = Array.isArray(cycle.ajo_groups) ? cycle.ajo_groups[0] : cycle.ajo_groups;
    const contributionAmount = ajoGroup.contribution_amount;

    // Pre-authorize each member
    for (const member of members) {
      try {
        // Check member reliability score
        const reliabilityCheck = await this.checkMemberReliability(member.user_id, groupId);
        
        if (!reliabilityCheck.reliable) {
          failedAuthorizations.push({
            user_id: member.user_id,
            reason: `Low reliability score: ${reliabilityCheck.score}`
          });
          continue;
        }

        // Create pre-authorization record
        await supabase
          .from('ajo_transactions')
          .insert([{
            group_id: groupId,
            cycle_id: cycleId,
            user_id: member.user_id,
            amount: contributionAmount,
            transaction_type: 'contribution',
            status: 'pending',
            metadata: { pre_authorized: true, expires_at: cycle.contribution_deadline }
          }]);

        authorizedMembers.push(member.user_id);

      } catch (error) {
        failedAuthorizations.push({
          user_id: member.user_id,
          reason: `Authorization failed: ${error}`
        });
      }
    }

    return {
      success: failedAuthorizations.length === 0,
      authorized_members: authorizedMembers,
      failed_authorizations: failedAuthorizations
    };
  }

  // Hold funds in escrow until all members contribute
  static async holdFundsInEscrow(cycleId: number): Promise<{
    success: boolean;
    escrow_amount: number;
    held_transactions: number[];
  }> {
    const heldTransactions: number[] = [];
    let escrowAmount = 0;

    // Get all completed contributions for this cycle
    const { data: contributions } = await supabase
      .from('ajo_transactions')
      .select('id, amount')
      .eq('cycle_id', cycleId)
      .eq('transaction_type', 'contribution')
      .eq('status', 'completed');

    if (!contributions) return { success: false, escrow_amount: 0, held_transactions: [] };

    // Move funds to escrow status
    for (const contribution of contributions) {
      const { error } = await supabase
        .from('ajo_transactions')
        .update({ 
          status: 'locked',
          metadata: { escrowed: true, locked_at: new Date().toISOString() }
        })
        .eq('id', contribution.id);

      if (!error) {
        heldTransactions.push(contribution.id);
        escrowAmount += Number(contribution.amount);
      }
    }

    return {
      success: true,
      escrow_amount: escrowAmount,
      held_transactions: heldTransactions
    };
  }

  // Auto-rollback if any member defaults
  static async autoRollbackOnDefault(cycleId: number): Promise<{
    success: boolean;
    refunded_transactions: number[];
    total_refunded: number;
  }> {
    const refundedTransactions: number[] = [];
    let totalRefunded = 0;

    try {
      // Get all locked (escrowed) transactions
      const { data: lockedTransactions } = await supabase
        .from('ajo_transactions')
        .select('id, user_id, amount')
        .eq('cycle_id', cycleId)
        .eq('transaction_type', 'contribution')
        .eq('status', 'locked');

      if (!lockedTransactions) return { success: false, refunded_transactions: [], total_refunded: 0 };

      // Process refunds atomically
      for (const transaction of lockedTransactions) {
        // Create refund transaction
        const { data: refund, error: refundError } = await supabase
          .from('ajo_transactions')
          .insert([{
            cycle_id: cycleId,
            user_id: transaction.user_id,
            amount: transaction.amount,
            transaction_type: 'refund',
            status: 'completed',
            metadata: { 
              original_transaction_id: transaction.id,
              reason: 'Cycle cancelled due to incomplete contributions'
            }
          }])
          .select()
          .single();

        if (!refundError && refund) {
          // Mark original transaction as cancelled
          await supabase
            .from('ajo_transactions')
            .update({ status: 'cancelled' })
            .eq('id', transaction.id);

          refundedTransactions.push(refund.id);
          totalRefunded += Number(transaction.amount);
        }
      }

      // Mark cycle as failed
      await supabase
        .from('ajo_cycles')
        .update({ status: 'failed' })
        .eq('id', cycleId);

      return {
        success: true,
        refunded_transactions: refundedTransactions,
        total_refunded: totalRefunded
      };

    } catch (error) {
      console.error('Auto-rollback failed:', error);
      return { success: false, refunded_transactions: [], total_refunded: 0 };
    }
  }

  // Check member reliability
  static async checkMemberReliability(userId: number, groupId?: number): Promise<{
    reliable: boolean;
    score: number;
    history: {
      total_contributions: number;
      on_time_contributions: number;
      late_contributions: number;
      defaults: number;
    };
  }> {
    // Get member history
    const { data: history } = await supabase
      .from('ajo_member_history')
      .select('status, days_late')
      .eq('user_id', userId)
      .not('status', 'eq', 'pending');

    if (!history || history.length === 0) {
      return {
        reliable: true, // New members get benefit of doubt
        score: 1.0,
        history: { total_contributions: 0, on_time_contributions: 0, late_contributions: 0, defaults: 0 }
      };
    }

    const totalContributions = history.length;
    const onTimeContributions = history.filter(h => h.status === 'paid' && h.days_late === 0).length;
    const lateContributions = history.filter(h => h.status === 'late' || h.days_late > 0).length;
    const defaults = history.filter(h => h.status === 'defaulted').length;

    const score = totalContributions > 0 ? onTimeContributions / totalContributions : 1.0;
    const reliable = score >= 0.8 && defaults === 0; // 80% on-time rate, no defaults

    return {
      reliable,
      score: Math.round(score * 100) / 100,
      history: {
        total_contributions: totalContributions,
        on_time_contributions: onTimeContributions,
        late_contributions: lateContributions,
        defaults: defaults
      }
    };
  }

  // Validate cycle before processing
  static async validateCycleBeforeProcessing(cycleId: number): Promise<{
    valid: boolean;
    issues: string[];
    can_proceed: boolean;
  }> {
    const issues: string[] = [];

    // Get cycle info
    const { data: cycle } = await supabase
      .from('ajo_cycles')
      .select(`
        *,
        ajo_groups!inner(max_members, contribution_amount)
      `)
      .eq('id', cycleId)
      .single();

    if (!cycle) {
      return { valid: false, issues: ['Cycle not found'], can_proceed: false };
    }

    const ajoGroup = Array.isArray(cycle.ajo_groups) ? cycle.ajo_groups[0] : cycle.ajo_groups;

    // Check if deadline passed
    if (new Date() > new Date(cycle.contribution_deadline)) {
      issues.push('Contribution deadline has passed');
    }

    // Check contribution count
    const { count: contributionCount } = await supabase
      .from('ajo_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('cycle_id', cycleId)
      .eq('transaction_type', 'contribution')
      .eq('status', 'completed');

    const expectedContributions = ajoGroup.max_members;
    
    if (contributionCount !== null && contributionCount < expectedContributions) {
      issues.push(`Incomplete contributions: ${contributionCount}/${expectedContributions}`);
    }

    // Check total amount
    const { data: transactions } = await supabase
      .from('ajo_transactions')
      .select('amount')
      .eq('cycle_id', cycleId)
      .eq('transaction_type', 'contribution')
      .eq('status', 'completed');

    const totalCollected = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const expectedAmount = expectedContributions * ajoGroup.contribution_amount;

    if (totalCollected < expectedAmount) {
      issues.push(`Insufficient amount: ₦${totalCollected} of ₦${expectedAmount} collected`);
    }

    return {
      valid: issues.length === 0,
      issues,
      can_proceed: issues.length === 0
    };
  }
}