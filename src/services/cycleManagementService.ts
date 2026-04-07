import { supabase } from '../lib/supabase';

export interface CycleStatus {
  id: number;
  groupId: number;
  cycleNumber: number;
  status: 'pending' | 'collecting' | 'locked' | 'completed' | 'failed' | 'cancelled';
  startDate: string;
  endDate: string;
  contributionDeadline: string;
  totalExpected: number;
  totalCollected: number;
  payoutAmount: number;
  payoutRecipientId?: number;
  payoutDate?: string;
  completionPercentage: number;
}

export interface CycleTransition {
  currentCycle: number;
  nextCycle: number;
  transitionDate: string;
  status: 'ready' | 'pending' | 'failed';
  message: string;
}

class CycleManagementService {
  /**
   * Get current cycle for a group
   */
  async getCurrentCycle(groupId: number): Promise<CycleStatus | null> {
    try {
      const { data, error } = await supabase
        .from('ajo_cycles')
        .select('*')
        .eq('group_id', groupId)
        .in('status', ['pending', 'collecting', 'locked'])
        .order('cycle_number', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) return null;

      return this.mapCycleData(data);
    } catch (error) {
      console.error('Error fetching current cycle:', error);
      throw error;
    }
  }

  /**
   * Get cycle history for a group
   */
  async getCycleHistory(groupId: number, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('ajo_cycles')
        .select('*')
        .eq('group_id', groupId)
        .order('cycle_number', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(cycle => this.mapCycleData(cycle));
    } catch (error) {
      console.error('Error fetching cycle history:', error);
      throw error;
    }
  }

  /**
   * Get cycle details with member contributions
   */
  async getCycleDetails(cycleId: number) {
    try {
      const { data: cycleData, error: cycleError } = await supabase
        .from('ajo_cycles')
        .select(`
          *,
          ajo_groups(name, contribution_amount, max_members),
          ajo_transactions(
            id,
            user_id,
            amount,
            status,
            created_at,
            user_accounts(full_name, email)
          )
        `)
        .eq('id', cycleId)
        .single();

      if (cycleError) throw cycleError;

      // Get member contributions
      const { data: memberData, error: memberError } = await supabase
        .from('ajo_member_history')
        .select(`
          *,
          user_accounts(full_name, email)
        `)
        .eq('cycle_id', cycleId);

      if (memberError) throw memberError;

      return {
        cycle: this.mapCycleData(cycleData),
        group: cycleData.ajo_groups,
        transactions: cycleData.ajo_transactions || [],
        memberContributions: memberData || [],
      };
    } catch (error) {
      console.error('Error fetching cycle details:', error);
      throw error;
    }
  }

  /**
   * Transition cycle to next stage
   */
  async transitionCycle(cycleId: number): Promise<CycleTransition> {
    try {
      // Get current cycle
      const { data: cycleData, error: cycleError } = await supabase
        .from('ajo_cycles')
        .select('*')
        .eq('id', cycleId)
        .single();

      if (cycleError) throw cycleError;

      let nextStatus = cycleData.status;
      const transitions: Record<string, string> = {
        'pending': 'collecting',
        'collecting': 'locked',
        'locked': 'completed',
      };

      nextStatus = transitions[cycleData.status] || cycleData.status;

      // Update cycle status
      const { error: updateError } = await supabase
        .from('ajo_cycles')
        .update({ status: nextStatus })
        .eq('id', cycleId);

      if (updateError) throw updateError;

      return {
        currentCycle: cycleData.cycle_number,
        nextCycle: cycleData.cycle_number + 1,
        transitionDate: new Date().toISOString(),
        status: 'ready',
        message: `Cycle ${cycleData.cycle_number} transitioned to ${nextStatus}`,
      };
    } catch (error) {
      console.error('Error transitioning cycle:', error);
      throw error;
    }
  }

  /**
   * Check if cycle is ready for payout
   */
  async isCycleReadyForPayout(cycleId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('validate_cycle_readiness', { p_cycle_id: cycleId });

      if (error) throw error;

      return data?.ready || false;
    } catch (error) {
      console.error('Error checking cycle readiness:', error);
      return false;
    }
  }

  /**
   * Process cycle payout
   */
  async processCyclePayout(cycleId: number) {
    try {
      const { data, error } = await supabase
        .rpc('process_atomic_ajo_cycle', { p_cycle_id: cycleId });

      if (error) throw error;

      return {
        success: data?.success || false,
        message: data?.message || 'Payout processing completed',
        payoutAmount: data?.payout_amount,
        nextCycleNumber: data?.next_cycle_number,
      };
    } catch (error) {
      console.error('Error processing cycle payout:', error);
      throw error;
    }
  }

  /**
   * Get payout schedule for a group
   */
  async getPayoutSchedule(groupId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_cycles')
        .select(`
          *,
          ajo_group_members(
            id,
            user_id,
            position,
            payout_order,
            user_accounts(full_name, email)
          )
        `)
        .eq('group_id', groupId)
        .order('cycle_number', { ascending: true });

      if (error) throw error;

      return (data || []).map(cycle => ({
        cycleNumber: cycle.cycle_number,
        startDate: cycle.start_date,
        endDate: cycle.end_date,
        payoutDate: cycle.payout_date,
        status: cycle.status,
        payoutRecipient: cycle.ajo_group_members?.find(m => m.payout_order === cycle.cycle_number),
        totalAmount: cycle.total_expected,
      }));
    } catch (error) {
      console.error('Error fetching payout schedule:', error);
      throw error;
    }
  }

  /**
   * Get member's payout position in group
   */
  async getMemberPayoutPosition(userId: number, groupId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_group_members')
        .select('payout_order, position')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) return null;

      // Get total members
      const { count } = await supabase
        .from('ajo_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .eq('status', 'active');

      return {
        payoutOrder: data.payout_order,
        position: data.position,
        totalMembers: count || 0,
        cyclesUntilPayout: data.payout_order ? data.payout_order - 1 : 0,
      };
    } catch (error) {
      console.error('Error fetching member payout position:', error);
      throw error;
    }
  }

  /**
   * Get cycle statistics
   */
  async getCycleStats(cycleId: number) {
    try {
      const { data: cycleData, error: cycleError } = await supabase
        .from('ajo_cycles')
        .select('*')
        .eq('id', cycleId)
        .single();

      if (cycleError) throw cycleError;

      const { data: memberData, error: memberError } = await supabase
        .from('ajo_member_history')
        .select('status')
        .eq('cycle_id', cycleId);

      if (memberError) throw memberError;

      const stats = {
        totalMembers: memberData?.length || 0,
        paidMembers: memberData?.filter(m => m.status === 'paid').length || 0,
        lateMembers: memberData?.filter(m => m.status === 'late').length || 0,
        defaultedMembers: memberData?.filter(m => m.status === 'defaulted').length || 0,
        pendingMembers: memberData?.filter(m => m.status === 'pending').length || 0,
        completionPercentage: memberData && memberData.length > 0
          ? Math.round((memberData.filter(m => m.status === 'paid').length / memberData.length) * 100)
          : 0,
        totalExpected: cycleData.total_expected,
        totalCollected: cycleData.total_collected,
        collectionPercentage: cycleData.total_expected > 0
          ? Math.round((cycleData.total_collected / cycleData.total_expected) * 100)
          : 0,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching cycle stats:', error);
      throw error;
    }
  }

  /**
   * Map cycle data to CycleStatus interface
   */
  private mapCycleData(data: any): CycleStatus {
    return {
      id: data.id,
      groupId: data.group_id,
      cycleNumber: data.cycle_number,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      contributionDeadline: data.contribution_deadline,
      totalExpected: data.total_expected,
      totalCollected: data.total_collected,
      payoutAmount: data.payout_amount,
      payoutRecipientId: data.payout_recipient_id,
      payoutDate: data.payout_date,
      completionPercentage: data.total_expected > 0
        ? Math.round((data.total_collected / data.total_expected) * 100)
        : 0,
    };
  }
}

export const cycleManagementService = new CycleManagementService();
