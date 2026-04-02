-- Phase 3: Atomic Withdrawal Processing Function

-- Function to process atomic withdrawal
CREATE OR REPLACE FUNCTION process_ajo_withdrawal(
  p_user_id INTEGER,
  p_group_id INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_member ajo_group_members%ROWTYPE;
  v_group ajo_groups%ROWTYPE;
  v_cycle ajo_cycles%ROWTYPE;
  v_transaction_id INTEGER;
  v_payout_amount DECIMAL(15,2);
  v_active_locks INTEGER;
BEGIN
  -- Set transaction isolation
  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
  
  -- Check for active withdrawal locks
  SELECT COUNT(*) INTO v_active_locks
  FROM ajo_withdrawal_locks
  WHERE group_id = p_group_id 
    AND (user_id = p_user_id OR user_id IS NULL)
    AND released_at IS NULL
    AND locked_until > CURRENT_TIMESTAMP;
  
  IF v_active_locks > 0 THEN
    RAISE EXCEPTION 'Withdrawal is currently locked for this group/user';
  END IF;
  
  -- Get and lock member record
  SELECT * INTO v_member
  FROM ajo_group_members
  WHERE group_id = p_group_id AND user_id = p_user_id
  FOR UPDATE;
  
  IF v_member.id IS NULL THEN
    RAISE EXCEPTION 'User is not a member of this group';
  END IF;
  
  IF v_member.status != 'active' THEN
    RAISE EXCEPTION 'Member is not active';
  END IF;
  
  IF v_member.payout_received THEN
    RAISE EXCEPTION 'Payout already received';
  END IF;
  
  -- Get group info
  SELECT * INTO v_group
  FROM ajo_groups
  WHERE id = p_group_id
  FOR UPDATE;
  
  -- Check if it's user's turn
  IF v_member.payout_order != v_group.current_cycle THEN
    RAISE EXCEPTION 'Not your turn for payout. Your turn is cycle %, current cycle is %', 
      v_member.payout_order, v_group.current_cycle;
  END IF;
  
  -- Get current cycle
  SELECT * INTO v_cycle
  FROM ajo_cycles
  WHERE group_id = p_group_id AND cycle_number = v_group.current_cycle
  FOR UPDATE;
  
  IF v_cycle.id IS NULL THEN
    RAISE EXCEPTION 'Current cycle not found';
  END IF;
  
  IF v_cycle.status != 'completed' THEN
    RAISE EXCEPTION 'Current cycle is not completed. Status: %', v_cycle.status;
  END IF;
  
  v_payout_amount := v_cycle.payout_amount;
  
  IF v_payout_amount <= 0 THEN
    RAISE EXCEPTION 'No payout amount available';
  END IF;
  
  -- Create withdrawal transaction
  INSERT INTO ajo_transactions (
    group_id, cycle_id, user_id, amount, transaction_type,
    status, created_at, processed_at
  ) VALUES (
    p_group_id, v_cycle.id, p_user_id, v_payout_amount, 'payout',
    'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ) RETURNING id INTO v_transaction_id;
  
  -- Mark member as having received payout
  UPDATE ajo_group_members
  SET payout_received = true
  WHERE id = v_member.id;
  
  -- Update member history
  INSERT INTO ajo_member_history (
    user_id, group_id, cycle_id, contribution_due_date,
    contribution_date, amount_due, amount_paid, status
  ) VALUES (
    p_user_id, p_group_id, v_cycle.id, v_cycle.contribution_deadline,
    CURRENT_TIMESTAMP, 0, v_payout_amount, 'paid'
  );
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'amount', v_payout_amount,
    'cycle_number', v_cycle.cycle_number
  );
  
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Withdrawal processing failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;