import { supabase } from '../lib/supabase';

export interface GroupManagementStats {
  totalGroups: number;
  activeGroups: number;
  completedGroups: number;
  cancelledGroups: number;
  totalMembers: number;
  totalContributed: number;
  totalPayouts: number;
  averageGroupSize: number;
}

export interface GroupAdminAction {
  groupId: number;
  action: 'force_start' | 'force_complete' | 'force_cancel' | 'pause' | 'resume';
  reason: string;
  performedBy: number;
}

class AdminGroupManagementService {
  /**
   * Get all groups with detailed stats
   */
  async getAllGroupsWithStats(filters?: {
    status?: string;
    sortBy?: 'created' | 'members' | 'contributed';
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('ajo_groups')
        .select(`
          *,
          ajo_group_members(id),
          ajo_cycles(id, status),
          ajo_transactions(amount, transaction_type, status)
        `);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.order(
        filters?.sortBy === 'created' ? 'created_at' : 'current_members',
        { ascending: false }
      ).limit(filters?.limit || 100);

      if (error) throw error;

      return (data || []).map(group => ({
        id: group.id,
        name: group.name,
        status: group.status,
        memberCount: group.ajo_group_members?.length || 0,
        maxMembers: group.max_members,
        contributionAmount: group.contribution_amount,
        frequency: group.frequency,
        cycleCount: group.ajo_cycles?.length || 0,
        activeCycles: group.ajo_cycles?.filter((c: any) => c.status === 'collecting').length || 0,
        totalContributed: group.ajo_transactions
          ?.filter((t: any) => t.transaction_type === 'contribution' && t.status === 'completed')
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0,
        totalPayouts: group.ajo_transactions
          ?.filter((t: any) => t.transaction_type === 'payout' && t.status === 'completed')
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0,
        createdAt: group.created_at,
        createdBy: group.created_by,
      }));
    } catch (error) {
      console.error('Error fetching all groups:', error);
      throw error;
    }
  }

  /**
   * Get platform-wide management statistics
   */
  async getPlatformStats(): Promise<GroupManagementStats> {
    try {
      const { count: totalGroups, error: groupError } = await supabase
        .from('ajo_groups')
        .select('*', { count: 'exact', head: true });

      if (groupError) throw groupError;

      const { count: activeGroups, error: activeError } = await supabase
        .from('ajo_groups')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeError) throw activeError;

      const { count: completedGroups, error: completedError } = await supabase
        .from('ajo_groups')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      if (completedError) throw completedError;

      const { count: cancelledGroups, error: cancelledError } = await supabase
        .from('ajo_groups')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled');

      if (cancelledError) throw cancelledError;

      const { count: totalMembers, error: memberError } = await supabase
        .from('ajo_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (memberError) throw memberError;

      const { data: txData, error: txError } = await supabase
        .from('ajo_transactions')
        .select('amount, transaction_type, status');

      if (txError) throw txError;

      const totalContributed = txData
        ?.filter(t => t.transaction_type === 'contribution' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      const totalPayouts = txData
        ?.filter(t => t.transaction_type === 'payout' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      return {
        totalGroups: totalGroups || 0,
        activeGroups: activeGroups || 0,
        completedGroups: completedGroups || 0,
        cancelledGroups: cancelledGroups || 0,
        totalMembers: totalMembers || 0,
        totalContributed,
        totalPayouts,
        averageGroupSize: totalGroups ? Math.round((totalMembers || 0) / totalGroups) : 0,
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      throw error;
    }
  }

  /**
   * Force start a group
   */
  async forceStartGroup(groupId: number, performedBy: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ajo_groups')
        .update({
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .eq('id', groupId);

      if (error) throw error;

      // Log action
      await this.logAdminAction({
        groupId,
        action: 'force_start',
        reason: 'Admin force started group',
        performedBy,
      });

      return true;
    } catch (error) {
      console.error('Error force starting group:', error);
      throw error;
    }
  }

  /**
   * Force complete a group
   */
  async forceCompleteGroup(groupId: number, performedBy: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ajo_groups')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', groupId);

      if (error) throw error;

      // Log action
      await this.logAdminAction({
        groupId,
        action: 'force_complete',
        reason: 'Admin force completed group',
        performedBy,
      });

      return true;
    } catch (error) {
      console.error('Error force completing group:', error);
      throw error;
    }
  }

  /**
   * Force cancel a group
   */
  async forceCancelGroup(groupId: number, reason: string, performedBy: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ajo_groups')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', groupId);

      if (error) throw error;

      // Log action
      await this.logAdminAction({
        groupId,
        action: 'force_cancel',
        reason,
        performedBy,
      });

      return true;
    } catch (error) {
      console.error('Error force cancelling group:', error);
      throw error;
    }
  }

  /**
   * Pause a group
   */
  async pauseGroup(groupId: number, performedBy: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ajo_groups')
        .update({ status: 'paused' })
        .eq('id', groupId);

      if (error) throw error;

      await this.logAdminAction({
        groupId,
        action: 'pause',
        reason: 'Admin paused group',
        performedBy,
      });

      return true;
    } catch (error) {
      console.error('Error pausing group:', error);
      throw error;
    }
  }

  /**
   * Resume a paused group
   */
  async resumeGroup(groupId: number, performedBy: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ajo_groups')
        .update({ status: 'active' })
        .eq('id', groupId);

      if (error) throw error;

      await this.logAdminAction({
        groupId,
        action: 'resume',
        reason: 'Admin resumed group',
        performedBy,
      });

      return true;
    } catch (error) {
      console.error('Error resuming group:', error);
      throw error;
    }
  }

  /**
   * Log admin action
   */
  private async logAdminAction(action: GroupAdminAction): Promise<void> {
    try {
      await supabase
        .from('ajo_admin_logs')
        .insert({
          group_id: action.groupId,
          action: action.action,
          reason: action.reason,
          performed_by: action.performedBy,
          created_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  /**
   * Get admin action logs
   */
  async getAdminLogs(groupId?: number, limit: number = 50) {
    try {
      let query = supabase
        .from('ajo_admin_logs')
        .select(`
          *,
          admin:user_accounts!performed_by(full_name, email)
        `);

      if (groupId) {
        query = query.eq('group_id', groupId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      throw error;
    }
  }

  /**
   * Get group audit trail
   */
  async getGroupAuditTrail(groupId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_admin_logs')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        groupId,
        auditTrail: data || [],
        totalActions: data?.length || 0,
      };
    } catch (error) {
      console.error('Error fetching group audit trail:', error);
      throw error;
    }
  }
}

export const adminGroupManagementService = new AdminGroupManagementService();
