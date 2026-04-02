import { supabase } from '../lib/supabase';
import { AjoGroup, AjoGroupMember, CreateGroupRequest, JoinGroupRequest } from '../types/ajo';

export const ajoGroupService = {
  // Create new Ajo group with atomic operations
  createGroup: async (request: CreateGroupRequest): Promise<{ data: AjoGroup }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: userData } = await supabase
      .from('user_accounts')
      .select('Id')
      .eq('Email', user.email)
      .single();

    if (!userData) throw new Error('User not found');

    // Calculate total cycles based on max members
    const totalCycles = request.max_members;

    const { data: group, error } = await supabase
      .from('ajo_groups')
      .insert([{
        name: request.name,
        description: request.description,
        max_members: request.max_members,
        contribution_amount: request.contribution_amount,
        frequency: request.frequency,
        cycle_duration: request.cycle_duration,
        created_by: userData.Id,
        total_cycles: totalCycles,
        status: 'forming'
      }])
      .select()
      .single();

    if (error) throw error;

    // Auto-join creator as first member
    await supabase
      .from('ajo_group_members')
      .insert([{
        group_id: group.id,
        user_id: userData.Id,
        position: 1,
        payout_order: 1
      }]);

    return { data: group };
  },

  // Join existing group with validation
  joinGroup: async (request: JoinGroupRequest): Promise<{ success: boolean }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: userData } = await supabase
      .from('user_accounts')
      .select('Id')
      .eq('Email', user.email)
      .single();

    if (!userData || userData.Id !== request.user_id) {
      throw new Error('Unauthorized');
    }

    // Check group capacity and status
    const { data: group } = await supabase
      .from('ajo_groups')
      .select('*')
      .eq('id', request.group_id)
      .single();

    if (!group) throw new Error('Group not found');
    if (group.status !== 'forming') throw new Error('Group not accepting members');
    if (group.current_members >= group.max_members) throw new Error('Group is full');

    // Check if user already member
    const { data: existingMember } = await supabase
      .from('ajo_group_members')
      .select('id')
      .eq('group_id', request.group_id)
      .eq('user_id', request.user_id)
      .maybeSingle();

    if (existingMember) throw new Error('Already a member');

    // Get next position and payout order
    const { data: members } = await supabase
      .from('ajo_group_members')
      .select('position, payout_order')
      .eq('group_id', request.group_id)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = members && members.length > 0 ? members[0].position + 1 : 1;
    const nextPayoutOrder = members && members.length > 0 ? (members[0].payout_order || 0) + 1 : 1;

    // Join group atomically
    const { error } = await supabase
      .from('ajo_group_members')
      .insert([{
        group_id: request.group_id,
        user_id: request.user_id,
        position: nextPosition,
        payout_order: nextPayoutOrder
      }]);

    if (error) throw error;

    // Check if group is now full and should start
    const { data: updatedGroup } = await supabase
      .from('ajo_groups')
      .select('current_members, max_members')
      .eq('id', request.group_id)
      .single();

    if (updatedGroup && updatedGroup.current_members === updatedGroup.max_members) {
      await ajoGroupService.startGroup(request.group_id);
    }

    return { success: true };
  },

  // Start group when full
  startGroup: async (groupId: number): Promise<{ success: boolean }> => {
    const startDate = new Date();
    const { error } = await supabase
      .from('ajo_groups')
      .update({
        status: 'active',
        started_at: startDate.toISOString(),
        current_cycle: 1
      })
      .eq('id', groupId);

    if (error) throw error;
    return { success: true };
  },

  // Get user's groups
  getUserGroups: async (): Promise<{ data: AjoGroup[] }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const { data: userData } = await supabase
      .from('user_accounts')
      .select('Id')
      .eq('Email', user.email)
      .single();

    if (!userData) return { data: [] };

    const { data: groups, error } = await supabase
      .from('ajo_groups')
      .select(`
        *,
        ajo_group_members!inner(user_id)
      `)
      .eq('ajo_group_members.user_id', userData.Id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: groups || [] };
  },

  // Get available groups to join
  getAvailableGroups: async (): Promise<{ data: AjoGroup[] }> => {
    const { data: groups, error } = await supabase
      .from('ajo_groups')
      .select('*')
      .eq('status', 'forming')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: groups || [] };
  },

  // Validate group integrity
  validateGroupIntegrity: async (groupId: number): Promise<{ valid: boolean; issues: string[] }> => {
    const issues: string[] = [];

    // Check member count consistency
    const { data: group } = await supabase
      .from('ajo_groups')
      .select('current_members, max_members')
      .eq('id', groupId)
      .single();

    const { count: actualMembers } = await supabase
      .from('ajo_group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('status', 'active');

    if (group && actualMembers !== group.current_members) {
      issues.push('Member count mismatch');
    }

    // Check payout order uniqueness
    const { data: members } = await supabase
      .from('ajo_group_members')
      .select('payout_order')
      .eq('group_id', groupId)
      .not('payout_order', 'is', null);

    const payoutOrders = members?.map(m => m.payout_order) || [];
    const uniqueOrders = new Set(payoutOrders);
    
    if (payoutOrders.length !== uniqueOrders.size) {
      issues.push('Duplicate payout orders');
    }

    return { valid: issues.length === 0, issues };
  }
};