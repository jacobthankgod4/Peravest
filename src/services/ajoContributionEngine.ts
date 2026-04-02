import { supabase } from '../lib/supabase';
import { AjoCycle, AjoTransaction, ContributionRequest } from '../types/ajo';

export const ajoContributionEngine = {
  // Process contribution with atomic operations
  processContribution: async (request: ContributionRequest): Promise<{ success: boolean; transaction_id: number }> => {
    // Start database transaction
    const { data, error } = await supabase.rpc('process_ajo_contribution', {
      p_group_id: request.group_id,
      p_cycle_id: request.cycle_id,
      p_user_id: request.user_id,
      p_amount: request.amount,
      p_payment_reference: request.payment_reference
    });

    if (error) throw error;
    return data;
  },

  // Validate cycle completion and trigger payout
  validateCycleCompletion: async (cycleId: number): Promise<{ complete: boolean; can_payout: boolean }> => {
    const { data: cycle } = await supabase
      .from('ajo_cycles')
      .select(`
        *,
        ajo_groups(max_members, contribution_amount)
      `)
      .eq('id', cycleId)
      .single();

    if (!cycle) throw new Error('Cycle not found');

    // Check if all members have contributed
    const { count: contributionCount } = await supabase
      .from('ajo_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('cycle_id', cycleId)
      .eq('transaction_type', 'contribution')
      .eq('status', 'completed');

    const expectedContributions = cycle.ajo_groups.max_members;
    const complete = contributionCount === expectedContributions;
    
    // Calculate total collected
    const { data: transactions } = await supabase
      .from('ajo_transactions')
      .select('amount')
      .eq('cycle_id', cycleId)
      .eq('transaction_type', 'contribution')
      .eq('status', 'completed');

    const totalCollected = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const expectedTotal = expectedContributions * Number(cycle.ajo_groups.contribution_amount);

    const can_payout = complete && totalCollected >= expectedTotal;

    if (complete) {
      // Update cycle status
      await supabase
        .from('ajo_cycles')
        .update({
          status: can_payout ? 'locked' : 'failed',
          total_collected: totalCollected
        })
        .eq('id', cycleId);
    }

    return { complete, can_payout };
  },

  // Lock withdrawals until cycle completion
  lockWithdrawalsUntilComplete: async (groupId: number, cycleId?: number): Promise<{ success: boolean }> => {
    const lockUntil = new Date();
    lockUntil.setHours(lockUntil.getHours() + 24); // 24 hour lock

    const { error } = await supabase
      .from('ajo_withdrawal_locks')
      .insert([{
        group_id: groupId,
        cycle_id: cycleId,
        lock_type: 'cycle_incomplete',
        locked_until: lockUntil.toISOString(),
        reason: 'Waiting for all members to contribute to current cycle'
      }]);

    if (error) throw error;
    return { success: true };
  },

  // Check if user can contribute to cycle
  canContribute: async (userId: number, cycleId: number): Promise<{ can_contribute: boolean; reason?: string }> => {
    // Check if user already contributed
    const { data: existingContribution } = await supabase
      .from('ajo_transactions')
      .select('id')
      .eq('cycle_id', cycleId)
      .eq('user_id', userId)
      .eq('transaction_type', 'contribution')
      .eq('status', 'completed')
      .maybeSingle();

    if (existingContribution) {
      return { can_contribute: false, reason: 'Already contributed to this cycle' };
    }

    // Check if cycle is still accepting contributions
    const { data: cycle } = await supabase
      .from('ajo_cycles')
      .select('status, contribution_deadline')
      .eq('id', cycleId)
      .single();

    if (!cycle) {
      return { can_contribute: false, reason: 'Cycle not found' };
    }

    if (cycle.status !== 'collecting') {
      return { can_contribute: false, reason: 'Cycle not accepting contributions' };
    }

    const now = new Date();
    const deadline = new Date(cycle.contribution_deadline);
    
    if (now > deadline) {
      return { can_contribute: false, reason: 'Contribution deadline passed' };
    }

    return { can_contribute: true };
  },

  // Get contribution status for cycle
  getCycleContributionStatus: async (cycleId: number): Promise<{
    total_expected: number;
    total_received: number;
    contributions: Array<{ user_id: number; amount: number; status: string; created_at: string }>;
  }> => {
    const { data: cycle } = await supabase
      .from('ajo_cycles')
      .select(`
        total_expected,
        ajo_groups(max_members, contribution_amount)
      `)
      .eq('id', cycleId)
      .single();

    if (!cycle) throw new Error('Cycle not found');

    const { data: contributions } = await supabase
      .from('ajo_transactions')
      .select('user_id, amount, status, created_at')
      .eq('cycle_id', cycleId)
      .eq('transaction_type', 'contribution')
      .order('created_at', { ascending: true });

    const totalReceived = contributions
      ?.filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + Number(c.amount), 0) || 0;

    return {
      total_expected: cycle.total_expected,
      total_received: totalReceived,
      contributions: contributions || []
    };
  }
};

// Database function for atomic contribution processing
export const createContributionFunction = `
CREATE OR REPLACE FUNCTION process_ajo_contribution(
  p_group_id INTEGER,
  p_cycle_id INTEGER,
  p_user_id INTEGER,
  p_amount DECIMAL(15,2),
  p_payment_reference VARCHAR(255)
)
RETURNS JSON AS $$
DECLARE
  v_transaction_id INTEGER;
  v_member_id INTEGER;
  v_cycle_status VARCHAR(20);
BEGIN
  -- Validate member exists in group
  SELECT id INTO v_member_id
  FROM ajo_group_members
  WHERE group_id = p_group_id AND user_id = p_user_id AND status = 'active';
  
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'User is not an active member of this group';
  END IF;
  
  -- Check cycle status
  SELECT status INTO v_cycle_status
  FROM ajo_cycles
  WHERE id = p_cycle_id;
  
  IF v_cycle_status != 'collecting' THEN
    RAISE EXCEPTION 'Cycle is not accepting contributions';
  END IF;
  
  -- Insert transaction
  INSERT INTO ajo_transactions (
    group_id, cycle_id, user_id, amount, transaction_type, 
    status, payment_reference, created_at
  ) VALUES (
    p_group_id, p_cycle_id, p_user_id, p_amount, 'contribution',
    'completed', p_payment_reference, CURRENT_TIMESTAMP
  ) RETURNING id INTO v_transaction_id;
  
  -- Update member contribution tracking
  UPDATE ajo_group_members
  SET 
    last_contribution_date = CURRENT_TIMESTAMP,
    total_contributed = total_contributed + p_amount
  WHERE id = v_member_id;
  
  -- Update cycle total
  UPDATE ajo_cycles
  SET total_collected = total_collected + p_amount
  WHERE id = p_cycle_id;
  
  -- Insert member history
  INSERT INTO ajo_member_history (
    user_id, group_id, cycle_id, contribution_due_date,
    contribution_date, amount_due, amount_paid, status
  ) VALUES (
    p_user_id, p_group_id, p_cycle_id, 
    (SELECT contribution_deadline FROM ajo_cycles WHERE id = p_cycle_id),
    CURRENT_TIMESTAMP, p_amount, p_amount, 'paid'
  );
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Contribution processing failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;
`;