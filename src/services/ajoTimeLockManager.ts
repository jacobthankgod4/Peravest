import { supabase } from '../lib/supabase';

// Time-based locks and deadline management
export class AjoTimeLockManager {
  
  // Lock withdrawals until contribution deadline
  static async lockWithdrawalsUntilDeadline(cycleId: number): Promise<{
    success: boolean;
    lock_id: number;
    locked_until: string;
  }> {
    // Get cycle deadline
    const { data: cycle } = await supabase
      .from('ajo_cycles')
      .select('contribution_deadline, group_id')
      .eq('id', cycleId)
      .single();

    if (!cycle) throw new Error('Cycle not found');

    // Create withdrawal lock until deadline
    const { data: lock, error } = await supabase
      .from('ajo_withdrawal_locks')
      .insert([{
        group_id: cycle.group_id,
        cycle_id: cycleId,
        lock_type: 'contribution_pending',
        locked_until: cycle.contribution_deadline,
        reason: 'Withdrawals locked until all contributions received'
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      lock_id: lock.id,
      locked_until: cycle.contribution_deadline
    };
  }

  // Implement grace period for late contributions
  static async implementGracePeriod(cycleId: number, graceHours: number = 24): Promise<{
    success: boolean;
    grace_period_end: string;
    extended_deadline: string;
  }> {
    // Get current cycle
    const { data: cycle } = await supabase
      .from('ajo_cycles')
      .select('contribution_deadline, group_id')
      .eq('id', cycleId)
      .single();

    if (!cycle) throw new Error('Cycle not found');

    // Calculate grace period end
    const gracePeriodEnd = new Date(cycle.contribution_deadline);
    gracePeriodEnd.setHours(gracePeriodEnd.getHours() + graceHours);

    // Update cycle deadline
    const { error: updateError } = await supabase
      .from('ajo_cycles')
      .update({ 
        contribution_deadline: gracePeriodEnd.toISOString(),
        status: 'collecting' // Keep collecting during grace period
      })
      .eq('id', cycleId);

    if (updateError) throw updateError;

    // Extend withdrawal locks
    await supabase
      .from('ajo_withdrawal_locks')
      .update({ locked_until: gracePeriodEnd.toISOString() })
      .eq('cycle_id', cycleId)
      .is('released_at', null);

    // Notify members about grace period
    await this.notifyMembersAboutGracePeriod(cycle.group_id, gracePeriodEnd);

    return {
      success: true,
      grace_period_end: gracePeriodEnd.toISOString(),
      extended_deadline: gracePeriodEnd.toISOString()
    };
  }

  // Automatic cycle cancellation if incomplete
  static async autoCancelIncompleteContributions(): Promise<{
    cancelled_cycles: number[];
    total_refunded: number;
  }> {
    const cancelledCycles: number[] = [];
    let totalRefunded = 0;

    // Find cycles past deadline with incomplete contributions
    const { data: incompleteCycles } = await supabase
      .from('ajo_cycles')
      .select(`
        id, group_id, contribution_deadline,
        ajo_groups(max_members, contribution_amount)
      `)
      .eq('status', 'collecting')
      .lt('contribution_deadline', new Date().toISOString());

    if (!incompleteCycles) return { cancelled_cycles: [], total_refunded: 0 };

    for (const cycle of incompleteCycles) {
      // Check contribution count
      const { count: contributionCount } = await supabase
        .from('ajo_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('cycle_id', cycle.id)
        .eq('transaction_type', 'contribution')
        .eq('status', 'completed');

      const ajoGroup = Array.isArray(cycle.ajo_groups) ? cycle.ajo_groups[0] : cycle.ajo_groups;
      const expectedContributions = ajoGroup?.max_members || 0;

      if (contributionCount !== null && contributionCount < expectedContributions) {
        // Cancel cycle and process refunds
        const refundResult = await this.cancelCycleAndRefund(cycle.id);
        
        if (refundResult.success) {
          cancelledCycles.push(cycle.id);
          totalRefunded += refundResult.total_refunded;
        }
      }
    }

    return { cancelled_cycles: cancelledCycles, total_refunded: totalRefunded };
  }

  // Cancel cycle and process refunds
  static async cancelCycleAndRefund(cycleId: number): Promise<{
    success: boolean;
    total_refunded: number;
    refunded_members: number[];
  }> {
    const refundedMembers: number[] = [];
    let totalRefunded = 0;

    try {
      // Get all contributions for this cycle
      const { data: contributions } = await supabase
        .from('ajo_transactions')
        .select('id, user_id, amount, group_id')
        .eq('cycle_id', cycleId)
        .eq('transaction_type', 'contribution')
        .eq('status', 'completed');

      if (contributions) {
        // Process refunds
        for (const contribution of contributions) {
          // Create refund transaction
          const { error: refundError } = await supabase
            .from('ajo_transactions')
            .insert([{
              group_id: contribution.group_id,
              cycle_id: cycleId,
              user_id: contribution.user_id,
              amount: contribution.amount,
              transaction_type: 'refund',
              status: 'completed',
              metadata: {
                original_transaction_id: contribution.id,
                reason: 'Cycle cancelled due to incomplete contributions'
              }
            }]);

          if (!refundError) {
            // Mark original as cancelled
            await supabase
              .from('ajo_transactions')
              .update({ status: 'cancelled' })
              .eq('id', contribution.id);

            refundedMembers.push(contribution.user_id);
            totalRefunded += Number(contribution.amount);
          }
        }
      }

      // Mark cycle as cancelled
      await supabase
        .from('ajo_cycles')
        .update({ status: 'cancelled' })
        .eq('id', cycleId);

      // Release all withdrawal locks
      await supabase
        .from('ajo_withdrawal_locks')
        .update({ released_at: new Date().toISOString() })
        .eq('cycle_id', cycleId)
        .is('released_at', null);

      return {
        success: true,
        total_refunded: totalRefunded,
        refunded_members: refundedMembers
      };

    } catch (error) {
      console.error('Cycle cancellation failed:', error);
      return { success: false, total_refunded: 0, refunded_members: [] };
    }
  }

  // Check for overdue contributions
  static async checkOverdueContributions(): Promise<{
    overdue_cycles: Array<{
      cycle_id: number;
      group_id: number;
      days_overdue: number;
      missing_contributions: number;
      missing_members: number[];
    }>;
  }> {
    const overdueCycles: Array<{
      cycle_id: number;
      group_id: number;
      days_overdue: number;
      missing_contributions: number;
      missing_members: number[];
    }> = [];

    // Find cycles past deadline
    const { data: pastDeadlineCycles } = await supabase
      .from('ajo_cycles')
      .select(`
        id, group_id, contribution_deadline,
        ajo_groups(max_members)
      `)
      .eq('status', 'collecting')
      .lt('contribution_deadline', new Date().toISOString());

    if (!pastDeadlineCycles) return { overdue_cycles: [] };

    for (const cycle of pastDeadlineCycles) {
      // Calculate days overdue
      const deadline = new Date(cycle.contribution_deadline);
      const now = new Date();
      const daysOverdue = Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24));

      // Get missing contributors
      const { data: contributors } = await supabase
        .from('ajo_transactions')
        .select('user_id')
        .eq('cycle_id', cycle.id)
        .eq('transaction_type', 'contribution')
        .eq('status', 'completed');

      const { data: allMembers } = await supabase
        .from('ajo_group_members')
        .select('user_id')
        .eq('group_id', cycle.group_id)
        .eq('status', 'active');

      const contributorIds = new Set(contributors?.map(c => c.user_id) || []);
      const missingMembers = allMembers?.filter(m => !contributorIds.has(m.user_id)).map(m => m.user_id) || [];

      overdueCycles.push({
        cycle_id: cycle.id,
        group_id: cycle.group_id,
        days_overdue: daysOverdue,
        missing_contributions: missingMembers.length,
        missing_members: missingMembers
      });
    }

    return { overdue_cycles: overdueCycles };
  }

  // Notify members about grace period
  private static async notifyMembersAboutGracePeriod(groupId: number, gracePeriodEnd: Date): Promise<void> {
    // Get all group members
    const { data: members } = await supabase
      .from('ajo_group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .eq('status', 'active');

    // This would integrate with your notification system
    // For now, we'll just log the notification
    console.log(`Grace period extended until ${gracePeriodEnd.toISOString()} for group ${groupId}`);
    console.log(`Members to notify: ${members?.map(m => m.user_id).join(', ')}`);
  }

  // Get time-based statistics
  static async getTimeLockStatistics(): Promise<{
    active_locks: number;
    overdue_cycles: number;
    grace_periods_active: number;
    auto_cancelled_today: number;
  }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Count active locks
    const { count: activeLocks } = await supabase
      .from('ajo_withdrawal_locks')
      .select('*', { count: 'exact', head: true })
      .is('released_at', null)
      .gte('locked_until', now.toISOString());

    // Count overdue cycles
    const { count: overdueCycles } = await supabase
      .from('ajo_cycles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'collecting')
      .lt('contribution_deadline', now.toISOString());

    // Count cancelled cycles today
    const { count: cancelledToday } = await supabase
      .from('ajo_cycles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled')
      .gte('created_at', todayStart.toISOString());

    return {
      active_locks: activeLocks || 0,
      overdue_cycles: overdueCycles || 0,
      grace_periods_active: 0, // Would need additional tracking
      auto_cancelled_today: cancelledToday || 0
    };
  }
}