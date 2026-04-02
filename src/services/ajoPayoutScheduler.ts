import { supabase } from '../lib/supabase';
import { AjoCycle, AjoGroupMember } from '../types/ajo';

export const ajoPayoutScheduler = {
  // Calculate next recipient based on payout order
  calculateNextRecipient: async (groupId: number): Promise<{ recipient: AjoGroupMember | null }> => {
    // Get current cycle
    const { data: group } = await supabase
      .from('ajo_groups')
      .select('current_cycle')
      .eq('id', groupId)
      .single();

    if (!group) throw new Error('Group not found');

    // Find member whose turn it is (payout_order = current_cycle)
    const { data: recipient } = await supabase
      .from('ajo_group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('payout_order', group.current_cycle)
      .eq('status', 'active')
      .maybeSingle();

    return { recipient };
  },

  // Process cycle payout atomically
  processCyclePayout: async (cycleId: number): Promise<{ success: boolean; payout_amount: number }> => {
    const { data, error } = await supabase.rpc('process_ajo_payout', {
      p_cycle_id: cycleId
    });

    if (error) throw error;
    return data;
  },

  // Validate payout eligibility
  validatePayoutEligibility: async (userId: number, groupId: number): Promise<{ 
    eligible: boolean; 
    reason?: string;
    next_payout_cycle?: number;
  }> => {
    // Get member info
    const { data: member } = await supabase
      .from('ajo_group_members')
      .select('payout_order, payout_received, status')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (!member) {
      return { eligible: false, reason: 'Not a member of this group' };
    }

    if (member.status !== 'active') {
      return { eligible: false, reason: 'Member status is not active' };
    }

    if (member.payout_received) {
      return { eligible: false, reason: 'Already received payout' };
    }

    // Get current cycle
    const { data: group } = await supabase
      .from('ajo_groups')
      .select('current_cycle, status')
      .eq('id', groupId)
      .single();

    if (!group || group.status !== 'active') {
      return { eligible: false, reason: 'Group is not active' };
    }

    const isCurrentRecipient = member.payout_order === group.current_cycle;
    
    if (!isCurrentRecipient) {
      return { 
        eligible: false, 
        reason: 'Not your turn yet',
        next_payout_cycle: member.payout_order
      };
    }

    // Check if current cycle is complete and locked
    const { data: currentCycle } = await supabase
      .from('ajo_cycles')
      .select('status')
      .eq('group_id', groupId)
      .eq('cycle_number', group.current_cycle)
      .single();

    if (!currentCycle || currentCycle.status !== 'locked') {
      return { eligible: false, reason: 'Current cycle not ready for payout' };
    }

    return { eligible: true };
  },

  // Create next cycle automatically
  createNextCycle: async (groupId: number): Promise<{ cycle: AjoCycle }> => {
    const { data: group } = await supabase
      .from('ajo_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (!group) throw new Error('Group not found');

    const nextCycleNumber = group.current_cycle + 1;
    
    // Calculate cycle dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    if (group.frequency === 'weekly') {
      endDate.setDate(endDate.getDate() + 7);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    
    const contributionDeadline = new Date(endDate);
    contributionDeadline.setDate(contributionDeadline.getDate() - 1); // 1 day before end

    // Get next recipient
    const recipientResult = await ajoPayoutScheduler.calculateNextRecipient(groupId);
    const { recipient } = recipientResult;
    
    const { data: cycle, error } = await supabase
      .from('ajo_cycles')
      .insert([{
        group_id: groupId,
        cycle_number: nextCycleNumber,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        contribution_deadline: contributionDeadline.toISOString(),
        payout_recipient_id: recipient?.id,
        status: 'collecting',
        total_expected: group.max_members * group.contribution_amount
      }])
      .select()
      .single();

    if (error) throw error;

    // Update group current cycle
    await supabase
      .from('ajo_groups')
      .update({ 
        current_cycle: nextCycleNumber,
        next_payout_date: endDate.toISOString()
      })
      .eq('id', groupId);

    return { cycle };
  },

  // Get payout schedule for group
  getPayoutSchedule: async (groupId: number): Promise<{
    schedule: Array<{
      cycle_number: number;
      recipient: AjoGroupMember;
      payout_date: string;
      status: string;
    }>;
  }> => {
    const { data: members } = await supabase
      .from('ajo_group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('status', 'active')
      .order('payout_order', { ascending: true });

    const { data: group } = await supabase
      .from('ajo_groups')
      .select('frequency, started_at')
      .eq('id', groupId)
      .single();

    if (!members || !group) return { schedule: [] };

    const schedule = members.map((member, index) => {
      const cycleNumber = member.payout_order || (index + 1);
      
      // Calculate payout date
      const startDate = new Date(group.started_at || Date.now());
      const payoutDate = new Date(startDate);
      
      if (group.frequency === 'weekly') {
        payoutDate.setDate(payoutDate.getDate() + (cycleNumber - 1) * 7);
      } else {
        payoutDate.setMonth(payoutDate.getMonth() + (cycleNumber - 1));
      }

      return {
        cycle_number: cycleNumber,
        recipient: member,
        payout_date: payoutDate.toISOString(),
        status: member.payout_received ? 'completed' : 'pending'
      };
    });

    return { schedule };
  }
};

// Database function for atomic payout processing
export const createPayoutFunction = `
CREATE OR REPLACE FUNCTION process_ajo_payout(p_cycle_id INTEGER)
RETURNS JSON AS $$
DECLARE
  v_cycle ajo_cycles%ROWTYPE;
  v_recipient ajo_group_members%ROWTYPE;
  v_payout_amount DECIMAL(15,2);
  v_transaction_id INTEGER;
BEGIN
  -- Get cycle info
  SELECT * INTO v_cycle FROM ajo_cycles WHERE id = p_cycle_id;
  
  IF v_cycle.id IS NULL THEN
    RAISE EXCEPTION 'Cycle not found';
  END IF;
  
  IF v_cycle.status != 'locked' THEN
    RAISE EXCEPTION 'Cycle not ready for payout';
  END IF;
  
  -- Get recipient
  SELECT * INTO v_recipient 
  FROM ajo_group_members 
  WHERE id = v_cycle.payout_recipient_id;
  
  IF v_recipient.id IS NULL THEN
    RAISE EXCEPTION 'Payout recipient not found';
  END IF;
  
  -- Calculate payout amount (total collected minus any fees)
  v_payout_amount := v_cycle.total_collected;
  
  -- Create payout transaction
  INSERT INTO ajo_transactions (
    group_id, cycle_id, user_id, amount, transaction_type,
    status, created_at
  ) VALUES (
    v_cycle.group_id, p_cycle_id, v_recipient.user_id, v_payout_amount, 'payout',
    'completed', CURRENT_TIMESTAMP
  ) RETURNING id INTO v_transaction_id;
  
  -- Update cycle status
  UPDATE ajo_cycles
  SET 
    status = 'completed',
    payout_amount = v_payout_amount,
    payout_date = CURRENT_TIMESTAMP
  WHERE id = p_cycle_id;
  
  -- Mark recipient as having received payout
  UPDATE ajo_group_members
  SET payout_received = true
  WHERE id = v_recipient.id;
  
  -- Check if group is complete
  PERFORM check_group_completion(v_cycle.group_id);
  
  RETURN json_build_object(
    'success', true,
    'payout_amount', v_payout_amount,
    'transaction_id', v_transaction_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Payout processing failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Function to check if group is complete
CREATE OR REPLACE FUNCTION check_group_completion(p_group_id INTEGER)
RETURNS VOID AS $$
DECLARE
  v_total_members INTEGER;
  v_completed_payouts INTEGER;
BEGIN
  SELECT max_members INTO v_total_members
  FROM ajo_groups WHERE id = p_group_id;
  
  SELECT COUNT(*) INTO v_completed_payouts
  FROM ajo_group_members
  WHERE group_id = p_group_id AND payout_received = true;
  
  IF v_completed_payouts >= v_total_members THEN
    UPDATE ajo_groups
    SET status = 'completed'
    WHERE id = p_group_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
`;