import { supabase } from '../lib/supabase';

export class AjoSchedulerService {
  
  // Process all pending cycles (run daily via cron)
  static async processPendingCycles(): Promise<{ processed: number; failed: number }> {
    let processed = 0;
    let failed = 0;

    const { data: cycles } = await supabase
      .from('ajo_cycles')
      .select('id, group_id')
      .eq('status', 'collecting')
      .lte('contribution_deadline', new Date().toISOString());

    if (!cycles) return { processed, failed };

    for (const cycle of cycles) {
      try {
        // Validate cycle completion
        const { data: result } = await supabase.rpc('validate_cycle_readiness', {
          p_cycle_id: cycle.id
        });

        if (result.ready) {
          // Process atomic cycle
          await supabase.rpc('process_atomic_ajo_cycle', {
            p_cycle_id: cycle.id
          });
          processed++;
        } else {
          // Cancel incomplete cycle
          await this.cancelCycle(cycle.id);
          failed++;
        }
      } catch (error) {
        console.error(`Failed to process cycle ${cycle.id}:`, error);
        failed++;
      }
    }

    return { processed, failed };
  }

  // Create next cycle for active groups
  static async createNextCycles(): Promise<{ created: number }> {
    let created = 0;

    const { data: groups } = await supabase
      .from('ajo_groups')
      .select('id, current_cycle, max_members, frequency, contribution_amount')
      .eq('status', 'active');

    if (!groups) return { created };

    for (const group of groups) {
      // Check if current cycle is complete
      const { data: currentCycle } = await supabase
        .from('ajo_cycles')
        .select('status')
        .eq('group_id', group.id)
        .eq('cycle_number', group.current_cycle)
        .single();

      if (currentCycle?.status === 'completed') {
        const nextCycle = group.current_cycle + 1;
        
        // Check if group is complete
        if (nextCycle > group.max_members) {
          await supabase
            .from('ajo_groups')
            .update({ status: 'completed' })
            .eq('id', group.id);
          continue;
        }

        // Create next cycle
        const startDate = new Date();
        const endDate = new Date(startDate);
        
        if (group.frequency === 'weekly') {
          endDate.setDate(endDate.getDate() + 7);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }

        const deadline = new Date(endDate);
        deadline.setDate(deadline.getDate() - 1);

        await supabase
          .from('ajo_cycles')
          .insert({
            group_id: group.id,
            cycle_number: nextCycle,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            contribution_deadline: deadline.toISOString(),
            status: 'collecting',
            total_expected: group.max_members * group.contribution_amount
          });

        await supabase
          .from('ajo_groups')
          .update({ 
            current_cycle: nextCycle,
            next_payout_date: endDate.toISOString()
          })
          .eq('id', group.id);

        created++;
      }
    }

    return { created };
  }

  // Cancel incomplete cycle
  private static async cancelCycle(cycleId: number): Promise<void> {
    await supabase
      .from('ajo_cycles')
      .update({ status: 'cancelled' })
      .eq('id', cycleId);

    // Rollback contributions
    await supabase.rpc('rollback_cycle_contributions', {
      p_cycle_id: cycleId
    });
  }

  // Send payout notifications
  static async sendPayoutNotifications(): Promise<{ sent: number }> {
    let sent = 0;

    const { data: eligible } = await supabase
      .from('ajo_group_members')
      .select(`
        user_id,
        payout_order,
        ajo_groups!inner(id, name, current_cycle)
      `)
      .eq('payout_received', false)
      .eq('ajo_groups.status', 'active');

    if (!eligible) return { sent };

    for (const member of eligible) {
      const ajoGroup = Array.isArray(member.ajo_groups) ? member.ajo_groups[0] : member.ajo_groups;
      if (member.payout_order === ajoGroup.current_cycle) {
        console.log(`Notify user ${member.user_id}: Payout available for ${ajoGroup.name}`);
        sent++;
      }
    }

    return { sent };
  }

  // Cleanup expired locks
  static async cleanupExpiredLocks(): Promise<{ cleaned: number }> {
    const { data } = await supabase
      .from('ajo_withdrawal_locks')
      .update({ released_at: new Date().toISOString() })
      .is('released_at', null)
      .lt('locked_until', new Date().toISOString())
      .select();

    return { cleaned: data?.length || 0 };
  }
}
