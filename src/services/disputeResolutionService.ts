import { supabase } from '../lib/supabase';

export interface DisputeReport {
  id?: number;
  groupId: number;
  reportedBy: number;
  reportedUser: number;
  reason: string;
  description: string;
  evidence?: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
}

export interface DisputeResolution {
  disputeId: number;
  resolution: string;
  action: 'warning' | 'suspension' | 'removal' | 'refund' | 'none';
  actionDetails: string;
  resolvedAt: string;
}

class DisputeResolutionService {
  /**
   * Report a dispute
   */
  async reportDispute(report: DisputeReport): Promise<DisputeReport> {
    try {
      const { data, error } = await supabase
        .from('ajo_disputes')
        .insert({
          group_id: report.groupId,
          reported_by: report.reportedBy,
          reported_user: report.reportedUser,
          reason: report.reason,
          description: report.description,
          evidence: report.evidence,
          status: 'open',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error reporting dispute:', error);
      throw error;
    }
  }

  /**
   * Get open disputes for a group
   */
  async getOpenDisputes(groupId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_disputes')
        .select(`
          *,
          reported_by_user:user_accounts!reported_by(full_name, email),
          reported_user_data:user_accounts!reported_user(full_name, email)
        `)
        .eq('group_id', groupId)
        .eq('status', 'open')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching open disputes:', error);
      throw error;
    }
  }

  /**
   * Get dispute history
   */
  async getDisputeHistory(groupId: number, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('ajo_disputes')
        .select(`
          *,
          reported_by_user:user_accounts!reported_by(full_name),
          reported_user_data:user_accounts!reported_user(full_name)
        `)
        .eq('group_id', groupId)
        .in('status', ['resolved', 'dismissed'])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching dispute history:', error);
      throw error;
    }
  }

  /**
   * Resolve dispute
   */
  async resolveDispute(resolution: DisputeResolution): Promise<boolean> {
    try {
      // Update dispute status
      const { error: updateError } = await supabase
        .from('ajo_disputes')
        .update({
          status: 'resolved',
          resolution: resolution.resolution,
          resolved_at: resolution.resolvedAt,
        })
        .eq('id', resolution.disputeId);

      if (updateError) throw updateError;

      // Get dispute details
      const { data: disputeData, error: fetchError } = await supabase
        .from('ajo_disputes')
        .select('reported_user, group_id')
        .eq('id', resolution.disputeId)
        .single();

      if (fetchError) throw fetchError;

      // Apply action
      switch (resolution.action) {
        case 'warning':
          // Create warning record
          await supabase
            .from('ajo_member_warnings')
            .insert({
              user_id: disputeData.reported_user,
              group_id: disputeData.group_id,
              reason: resolution.actionDetails,
              created_at: new Date().toISOString(),
            });
          break;

        case 'suspension':
          // Create suspension lock
          await supabase
            .from('ajo_withdrawal_locks')
            .insert({
              user_id: disputeData.reported_user,
              group_id: disputeData.group_id,
              lock_type: 'dispute',
              reason: resolution.actionDetails,
              locked_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date().toISOString(),
            });
          break;

        case 'removal':
          // Remove member from group
          await supabase
            .from('ajo_group_members')
            .update({ status: 'inactive' })
            .eq('user_id', disputeData.reported_user)
            .eq('group_id', disputeData.group_id);
          break;

        case 'refund':
          // Create refund transaction
          await supabase
            .from('ajo_transactions')
            .insert({
              group_id: disputeData.group_id,
              user_id: disputeData.reported_user,
              amount: 0, // Amount to be determined
              transaction_type: 'refund',
              status: 'pending',
              metadata: { reason: resolution.actionDetails },
              created_at: new Date().toISOString(),
            });
          break;
      }

      return true;
    } catch (error) {
      console.error('Error resolving dispute:', error);
      throw error;
    }
  }

  /**
   * Dismiss dispute
   */
  async dismissDispute(disputeId: number, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ajo_disputes')
        .update({
          status: 'dismissed',
          resolution: reason,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', disputeId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error dismissing dispute:', error);
      throw error;
    }
  }

  /**
   * Get member warnings
   */
  async getMemberWarnings(userId: number, groupId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_member_warnings')
        .select('*')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching member warnings:', error);
      throw error;
    }
  }

  /**
   * Get dispute statistics
   */
  async getDisputeStats(groupId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_disputes')
        .select('status, reason');

      if (error) throw error;

      const stats = {
        totalDisputes: data?.length || 0,
        openDisputes: data?.filter(d => d.status === 'open').length || 0,
        investigatingDisputes: data?.filter(d => d.status === 'investigating').length || 0,
        resolvedDisputes: data?.filter(d => d.status === 'resolved').length || 0,
        dismissedDisputes: data?.filter(d => d.status === 'dismissed').length || 0,
        resolutionRate: data && data.length > 0
          ? Math.round(((data.filter(d => d.status === 'resolved').length + data.filter(d => d.status === 'dismissed').length) / data.length) * 100)
          : 0,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching dispute stats:', error);
      throw error;
    }
  }
}

export const disputeResolutionService = new DisputeResolutionService();
