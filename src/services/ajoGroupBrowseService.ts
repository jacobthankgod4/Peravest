import { supabase } from '../lib/supabase';

export interface GroupBrowseFilter {
  frequency?: 'daily' | 'weekly' | 'monthly';
  minMembers?: number;
  maxMembers?: number;
  minAmount?: number;
  maxAmount?: number;
  minScore?: number;
  search?: string;
  sortBy?: 'newest' | 'most_trusted' | 'most_active' | 'ending_soon';
}

export interface BrowsableGroup {
  id: number;
  name: string;
  description: string;
  frequency: string;
  contribution_amount: number;
  current_members: number;
  max_members: number;
  avg_reliability_score: number;
  status: string;
  created_at: string;
  next_payout_date: string;
  is_public: boolean;
  member_count: number;
  cycle_number: number;
  total_cycles: number;
}

export const ajoGroupBrowseService = {
  /**
   * Get all public groups with optional filters
   */
  async getAvailableGroups(filters?: GroupBrowseFilter) {
    try {
      let query = supabase
        .from('ajo_groups')
        .select(`
          id,
          name,
          description,
          frequency,
          contribution_amount,
          current_members,
          max_members,
          avg_reliability_score,
          status,
          created_at,
          next_payout_date,
          is_public,
          cycle_number,
          total_cycles
        `)
        .eq('is_public', true)
        .eq('status', 'open');

      // Apply frequency filter
      if (filters?.frequency) {
        query = query.eq('frequency', filters.frequency);
      }

      // Apply amount range filter
      if (filters?.minAmount) {
        query = query.gte('contribution_amount', filters.minAmount);
      }
      if (filters?.maxAmount) {
        query = query.lte('contribution_amount', filters.maxAmount);
      }

      // Apply member count filter
      if (filters?.minMembers) {
        query = query.gte('current_members', filters.minMembers);
      }
      if (filters?.maxMembers) {
        query = query.lte('current_members', filters.maxMembers);
      }

      // Apply reliability score filter
      if (filters?.minScore) {
        query = query.gte('avg_reliability_score', filters.minScore);
      }

      // Apply search filter
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply sorting
      if (filters?.sortBy === 'most_trusted') {
        query = query.order('avg_reliability_score', { ascending: false });
      } else if (filters?.sortBy === 'most_active') {
        query = query.order('current_members', { ascending: false });
      } else if (filters?.sortBy === 'ending_soon') {
        query = query.order('next_payout_date', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data as BrowsableGroup[], error: null };
    } catch (error) {
      console.error('Error fetching available groups:', error);
      return { data: [], error };
    }
  },

  /**
   * Get group details with member info
   */
  async getGroupDetails(groupId: number) {
    try {
      const { data: group, error: groupError } = await supabase
        .from('ajo_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      const { data: members, error: membersError } = await supabase
        .from('ajo_memberships')
        .select(`
          id,
          user_id,
          position,
          status,
          joined_at,
          user_accounts(Id, FirstName, LastName, Email, phone_number)
        `)
        .eq('group_id', groupId)
        .order('position', { ascending: true });

      if (membersError) throw membersError;

      return {
        data: {
          ...group,
          members: members || [],
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching group details:', error);
      return { data: null, error };
    }
  },

  /**
   * Check if user can join group (reliability score check)
   */
  async canUserJoinGroup(userId: number, groupId: number) {
    try {
      // Get group reliability threshold
      const { data: group, error: groupError } = await supabase
        .from('ajo_groups')
        .select('reliability_threshold, max_members, current_members')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      // Check if group is full
      if (group.current_members >= group.max_members) {
        return { canJoin: false, reason: 'Group is full', error: null };
      }

      // Get user's reliability score
      const { data: score, error: scoreError } = await supabase
        .from('ajo_member_scores')
        .select('score')
        .eq('user_id', userId)
        .single();

      if (scoreError && scoreError.code !== 'PGRST116') throw scoreError;

      const userScore = score?.score || 0.5; // Default score for new users

      if (userScore < group.reliability_threshold) {
        return {
          canJoin: false,
          reason: `Your reliability score (${(userScore * 100).toFixed(0)}%) is below the group requirement (${(group.reliability_threshold * 100).toFixed(0)}%)`,
          error: null,
        };
      }

      return { canJoin: true, reason: null, error: null };
    } catch (error) {
      console.error('Error checking join eligibility:', error);
      return { canJoin: false, reason: 'Error checking eligibility', error };
    }
  },

  /**
   * Get user's join requests
   */
  async getUserJoinRequests(userId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_join_requests')
        .select(`
          id,
          group_id,
          status,
          created_at,
          reviewed_at,
          ajo_groups(id, name, description, contribution_amount, frequency)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching join requests:', error);
      return { data: [], error };
    }
  },

  /**
   * Get pending join requests for group owner
   */
  async getGroupJoinRequests(groupId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_join_requests')
        .select(`
          id,
          user_id,
          status,
          created_at,
          user_accounts(Id, FirstName, LastName, Email, phone_number)
        `)
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching group join requests:', error);
      return { data: [], error };
    }
  },

  /**
   * Search groups by name or invite code
   */
  async searchGroups(query: string) {
    try {
      const { data, error } = await supabase
        .from('ajo_groups')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'open')
        .or(`name.ilike.%${query}%,invite_code.eq.${query}`)
        .limit(10);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error searching groups:', error);
      return { data: [], error };
    }
  },

  /**
   * Get group statistics for display
   */
  async getGroupStats(groupId: number) {
    try {
      const { data: group, error: groupError } = await supabase
        .from('ajo_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      const { data: contributions, error: contribError } = await supabase
        .from('ajo_contributions')
        .select('amount, status')
        .eq('group_id', groupId);

      if (contribError) throw contribError;

      const totalContributed = contributions?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
      const completedContributions = contributions?.filter(c => c.status === 'completed').length || 0;

      return {
        data: {
          ...group,
          totalContributed,
          completedContributions,
          completionRate: contributions?.length ? (completedContributions / contributions.length) * 100 : 0,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching group stats:', error);
      return { data: null, error };
    }
  },

  /**
   * Get trending groups (most active, highest score)
   */
  async getTrendingGroups(limit = 6) {
    try {
      const { data, error } = await supabase
        .from('ajo_groups')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'open')
        .order('avg_reliability_score', { ascending: false })
        .order('current_members', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching trending groups:', error);
      return { data: [], error };
    }
  },

  /**
   * Subscribe to group updates
   */
  subscribeToGroupUpdates(groupId: number, callback: (group: any) => void) {
    const subscription = supabase
      .channel(`group-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ajo_groups',
          filter: `id=eq.${groupId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return subscription;
  },

  /**
   * Subscribe to join requests
   */
  subscribeToJoinRequests(groupId: number, callback: (request: any) => void) {
    const subscription = supabase
      .channel(`join-requests-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ajo_join_requests',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return subscription;
  },
};
