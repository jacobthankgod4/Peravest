import { supabase } from '../lib/supabase';

export interface GroupCompletion {
  groupId: number;
  completionDate: string;
  totalCycles: number;
  totalMembers: number;
  totalContributed: number;
  status: 'completed' | 'cancelled';
}

export interface MemberRemoval {
  userId: number;
  groupId: number;
  reason: string;
  refundAmount?: number;
}

class GroupCompletionService {
  /**
   * Complete a group after all cycles are done
   */
  async completeGroup(groupId: number): Promise<GroupCompletion> {
    try {
      // Get group details
      const { data: groupData, error: groupError } = await supabase
        .from('ajo_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      // Get cycle count
      const { count: cycleCount, error: cycleError } = await supabase
        .from('ajo_cycles')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      if (cycleError) throw cycleError;

      // Get member count
      const { count: memberCount, error: memberError } = await supabase
        .from('ajo_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .eq('status', 'active');

      if (memberError) throw memberError;

      // Get total contributed
      const { data: txData, error: txError } = await supabase
        .from('ajo_transactions')
        .select('amount')
        .eq('group_id', groupId)
        .eq('transaction_type', 'contribution')
        .eq('status', 'completed');

      if (txError) throw txError;

      const totalContributed = txData?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

      // Update group status
      const { error: updateError } = await supabase
        .from('ajo_groups')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', groupId);

      if (updateError) throw updateError;

      return {
        groupId,
        completionDate: new Date().toISOString(),
        totalCycles: cycleCount || 0,
        totalMembers: memberCount || 0,
        totalContributed,
        status: 'completed',
      };
    } catch (error) {
      console.error('Error completing group:', error);
      throw error;
    }
  }

  /**
   * Cancel a group
   */
  async cancelGroup(groupId: number, reason: string): Promise<GroupCompletion> {
    try {
      // Get group details
      const { data: groupData, error: groupError } = await supabase
        .from('ajo_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      // Get all members
      const { data: members, error: memberError } = await supabase
        .from('ajo_group_members')
        .select('user_id, total_contributed')
        .eq('group_id', groupId)
        .eq('status', 'active');

      if (memberError) throw memberError;

      // Create refund transactions for all members
      for (const member of members || []) {
        await supabase
          .from('ajo_transactions')
          .insert({
            group_id: groupId,
            user_id: member.user_id,
            amount: member.total_contributed,
            transaction_type: 'refund',
            status: 'pending',
            metadata: { reason },
            created_at: new Date().toISOString(),
          });
      }

      // Update group status
      const { error: updateError } = await supabase
        .from('ajo_groups')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', groupId);

      if (updateError) throw updateError;

      // Deactivate all members
      const { error: deactivateError } = await supabase
        .from('ajo_group_members')
        .update({ status: 'inactive' })
        .eq('group_id', groupId);

      if (deactivateError) throw deactivateError;

      return {
        groupId,
        completionDate: new Date().toISOString(),
        totalCycles: 0,
        totalMembers: members?.length || 0,
        totalContributed: members?.reduce((sum, m) => sum + (m.total_contributed || 0), 0) || 0,
        status: 'cancelled',
      };
    } catch (error) {
      console.error('Error cancelling group:', error);
      throw error;
    }
  }

  /**
   * Remove member from group
   */
  async removeMember(removal: MemberRemoval): Promise<boolean> {
    try {
      // Update member status
      const { error: updateError } = await supabase
        .from('ajo_group_members')
        .update({ status: 'inactive' })
        .eq('user_id', removal.userId)
        .eq('group_id', removal.groupId);

      if (updateError) throw updateError;

      // Create refund if specified
      if (removal.refundAmount && removal.refundAmount > 0) {
        await supabase
          .from('ajo_transactions')
          .insert({
            group_id: removal.groupId,
            user_id: removal.userId,
            amount: removal.refundAmount,
            transaction_type: 'refund',
            status: 'pending',
            metadata: { reason: removal.reason },
            created_at: new Date().toISOString(),
          });
      }

      // Create withdrawal lock
      await supabase
        .from('ajo_withdrawal_locks')
        .insert({
          group_id: removal.groupId,
          user_id: removal.userId,
          lock_type: 'dispute',
          reason: removal.reason,
          locked_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        });

      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  /**
   * Get group completion status
   */
  async getGroupCompletionStatus(groupId: number) {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('ajo_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      // Get completed cycles
      const { count: completedCycles, error: cycleError } = await supabase
        .from('ajo_cycles')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .eq('status', 'completed');

      if (cycleError) throw cycleError;

      const completionPercentage = groupData.total_cycles
        ? Math.round((completedCycles || 0) / groupData.total_cycles * 100)
        : 0;

      return {
        groupId,
        status: groupData.status,
        totalCycles: groupData.total_cycles,
        completedCycles: completedCycles || 0,
        completionPercentage,
        isComplete: groupData.status === 'completed',
      };
    } catch (error) {
      console.error('Error getting group completion status:', error);
      throw error;
    }
  }

  /**
   * Get group completion report
   */
  async getGroupCompletionReport(groupId: number) {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('ajo_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      // Get all members with their stats
      const { data: members, error: memberError } = await supabase
        .from('ajo_group_members')
        .select(`
          *,
          user_accounts(full_name, email)
        `)
        .eq('group_id', groupId);

      if (memberError) throw memberError;

      // Get all transactions
      const { data: transactions, error: txError } = await supabase
        .from('ajo_transactions')
        .select('*')
        .eq('group_id', groupId);

      if (txError) throw txError;

      const report = {
        groupName: groupData.name,
        status: groupData.status,
        totalMembers: members?.length || 0,
        activeMembers: members?.filter(m => m.status === 'active').length || 0,
        totalContributed: transactions?.filter(t => t.transaction_type === 'contribution').reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
        totalPayouts: transactions?.filter(t => t.transaction_type === 'payout').reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
        totalRefunds: transactions?.filter(t => t.transaction_type === 'refund').reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
        members: members?.map(m => ({
          name: m.user_accounts?.full_name,
          email: m.user_accounts?.email,
          status: m.status,
          totalContributed: m.total_contributed,
          payoutReceived: m.payout_received,
        })) || [],
      };

      return report;
    } catch (error) {
      console.error('Error getting group completion report:', error);
      throw error;
    }
  }
}

export const groupCompletionService = new GroupCompletionService();
