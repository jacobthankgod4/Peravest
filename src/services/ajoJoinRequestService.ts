import { supabase } from '../lib/supabase';

export interface JoinRequest {
  id: number;
  user_id: number;
  group_id: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
  rejection_reason?: string;
}

export const ajoJoinRequestService = {
  /**
   * Submit a join request for a group
   */
  async submitJoinRequest(userId: number, groupId: number) {
    try {
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('ajo_memberships')
        .select('id')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .single();

      if (existingMember) {
        return { data: null, error: 'Already a member of this group' };
      }

      // Check if already requested
      const { data: existingRequest } = await supabase
        .from('ajo_join_requests')
        .select('id')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        return { data: null, error: 'Join request already pending' };
      }

      // Create join request
      const { data, error } = await supabase
        .from('ajo_join_requests')
        .insert({
          user_id: userId,
          group_id: groupId,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Log event
      void supabase.rpc('log_ajo_event', {
        event: 'join_request_submitted',
        data: { user_id: userId, group_id: groupId },
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error submitting join request:', error);
      return { data: null, error };
    }
  },

  /**
   * Approve a join request
   */
  async approveJoinRequest(requestId: number, adminId: number) {
    try {
      // Get request details
      const { data: request, error: requestError } = await supabase
        .from('ajo_join_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Get next position in group
      const { data: members, error: membersError } = await supabase
        .from('ajo_memberships')
        .select('position')
        .eq('group_id', request.group_id)
        .order('position', { ascending: false })
        .limit(1);

      if (membersError) throw membersError;

      const nextPosition = (members?.[0]?.position || 0) + 1;

      // Add user as member
      const { error: memberError } = await supabase
        .from('ajo_memberships')
        .insert({
          user_id: request.user_id,
          group_id: request.group_id,
          position: nextPosition,
          status: 'active',
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      // Update join request
      const { data: updated, error: updateError } = await supabase
        .from('ajo_join_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId,
        })
        .eq('id', requestId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update group member count
      void supabase.rpc('increment_group_members', {
        p_group_id: request.group_id,
      });

      // Send notification
      void supabase.rpc('notify_user', {
        p_user_id: request.user_id,
        p_title: 'Join Request Approved',
        p_message: 'Your request to join the group has been approved!',
        p_type: 'ajo_join_approved',
      });

      // Log event
      void supabase.rpc('log_ajo_event', {
        event: 'join_request_approved',
        data: { request_id: requestId, user_id: request.user_id, group_id: request.group_id },
      });

      return { data: updated, error: null };
    } catch (error) {
      console.error('Error approving join request:', error);
      return { data: null, error };
    }
  },

  /**
   * Reject a join request
   */
  async rejectJoinRequest(requestId: number, adminId: number, reason?: string) {
    try {
      // Get request details
      const { data: request, error: requestError } = await supabase
        .from('ajo_join_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Update join request
      const { data: updated, error: updateError } = await supabase
        .from('ajo_join_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId,
          rejection_reason: reason,
        })
        .eq('id', requestId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Send notification
      void supabase.rpc('notify_user', {
        p_user_id: request.user_id,
        p_title: 'Join Request Rejected',
        p_message: reason || 'Your request to join the group was not approved.',
        p_type: 'ajo_join_rejected',
      });

      // Log event
      void supabase.rpc('log_ajo_event', {
        event: 'join_request_rejected',
        data: { request_id: requestId, user_id: request.user_id, group_id: request.group_id, reason },
      });

      return { data: updated, error: null };
    } catch (error) {
      console.error('Error rejecting join request:', error);
      return { data: null, error };
    }
  },

  /**
   * Cancel a pending join request
   */
  async cancelJoinRequest(requestId: number, userId: number) {
    try {
      // Verify ownership
      const { data: request, error: requestError } = await supabase
        .from('ajo_join_requests')
        .select('*')
        .eq('id', requestId)
        .eq('user_id', userId)
        .single();

      if (requestError) throw requestError;

      // Delete request
      const { error: deleteError } = await supabase
        .from('ajo_join_requests')
        .delete()
        .eq('id', requestId);

      if (deleteError) throw deleteError;

      // Log event
      void supabase.rpc('log_ajo_event', {
        event: 'join_request_cancelled',
        data: { request_id: requestId, user_id: userId, group_id: request.group_id },
      });

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('Error cancelling join request:', error);
      return { data: null, error };
    }
  },

  /**
   * Get join request status
   */
  async getJoinRequestStatus(userId: number, groupId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_join_requests')
        .select('*')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return { data: data || null, error: null };
    } catch (error) {
      console.error('Error getting join request status:', error);
      return { data: null, error };
    }
  },

  /**
   * Get user's join requests
   */
  async getUserJoinRequests(userId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_join_requests')
        .select('*, ajo_groups(name, description)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error getting user join requests:', error);
      return { data: [], error };
    }
  },

  /**
   * Get group's join requests
   */
  async getGroupJoinRequests(groupId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_join_requests')
        .select('*, user_accounts(FirstName, LastName, Email)')
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error getting group join requests:', error);
      return { data: [], error };
    }
  },

  /**
   * Bulk approve join requests
   */
  async bulkApproveRequests(requestIds: number[], adminId: number) {
    try {
      const results = [];

      for (const requestId of requestIds) {
        const result = await this.approveJoinRequest(requestId, adminId);
        results.push(result);
      }

      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        return { data: results, error: `${errors.length} requests failed to approve` };
      }

      return { data: results, error: null };
    } catch (error) {
      console.error('Error bulk approving requests:', error);
      return { data: [], error };
    }
  },

  /**
   * Get approval statistics for group
   */
  async getApprovalStats(groupId: number) {
    try {
      const { data: requests, error } = await supabase
        .from('ajo_join_requests')
        .select('status')
        .eq('group_id', groupId);

      if (error) throw error;

      const stats = {
        pending: requests?.filter(r => r.status === 'pending').length || 0,
        approved: requests?.filter(r => r.status === 'approved').length || 0,
        rejected: requests?.filter(r => r.status === 'rejected').length || 0,
        total: requests?.length || 0,
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error getting approval stats:', error);
      return { data: null, error };
    }
  },

  /**
   * Subscribe to join request changes
   */
  subscribeToJoinRequests(groupId: number, callback: (request: any) => void) {
    const subscription = supabase
      .channel(`join-requests-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ajo_join_requests',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  },
};
