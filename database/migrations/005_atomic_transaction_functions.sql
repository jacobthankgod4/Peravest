-- Phase 3: Atomic Transaction Management Functions

-- Main atomic cycle processing function
CREATE OR REPLACE FUNCTION process_atomic_ajo_cycle(p_cycle_id INTEGER)
RETURNS JSON AS $$
DECLARE
  v_cycle ajo_cycles%ROWTYPE;
  v_group ajo_groups%ROWTYPE;
  v_expected_contributions INTEGER;
  v_actual_contributions INTEGER;
  v_total_collected DECIMAL(15,2);
  v_expected_amount DECIMAL(15,2);
  v_recipient ajo_group_members%ROWTYPE;
  v_transaction_id INTEGER;
BEGIN
  -- Set transaction isolation level
  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
  
  -- Lock cycle for processing
  SELECT * INTO v_cycle 
  FROM ajo_cycles 
  WHERE id = p_cycle_id 
  FOR UPDATE;
  
  IF v_cycle.id IS NULL THEN
    RAISE EXCEPTION 'Cycle not found';
  END IF;
  
  IF v_cycle.status != 'collecting' THEN
    RAISE EXCEPTION 'Cycle not ready for processing. Status: %', v_cycle.status;
  END IF;
  
  -- Get group info
  SELECT * INTO v_group 
  FROM ajo_groups 
  WHERE id = v_cycle.group_id 
  FOR UPDATE;
  
  -- Validate all contributions received
  SELECT COUNT(*) INTO v_actual_contributions
  FROM ajo_transactions
  WHERE cycle_id = p_cycle_id 
    AND transaction_type = 'contribution' 
    AND status = 'completed';
  
  v_expected_contributions := v_group.max_members;
  
  IF v_actual_contributions < v_expected_contributions THEN
    RAISE EXCEPTION 'Incomplete contributions: % of % received', 
      v_actual_contributions, v_expected_contributions;
  END IF;
  
  -- Validate total amount
  SELECT COALESCE(SUM(amount), 0) INTO v_total_collected
  FROM ajo_transactions
  WHERE cycle_id = p_cycle_id 
    AND transaction_type = 'contribution' 
    AND status = 'completed';
  
  v_expected_amount := v_group.max_members * v_group.contribution_amount;
  
  IF v_total_collected < v_expected_amount THEN
    RAISE EXCEPTION 'Insufficient funds: % collected, % expected', 
      v_total_collected, v_expected_amount;
  END IF;
  
  -- Lock cycle
  UPDATE ajo_cycles
  SET status = 'locked', total_collected = v_total_collected
  WHERE id = p_cycle_id;
  
  -- Get payout recipient
  SELECT * INTO v_recipient
  FROM ajo_group_members
  WHERE id = v_cycle.payout_recipient_id
  FOR UPDATE;
  
  IF v_recipient.id IS NULL THEN
    RAISE EXCEPTION 'Payout recipient not found';
  END IF;
  
  -- Create payout transaction
  INSERT INTO ajo_transactions (
    group_id, cycle_id, user_id, amount, transaction_type,
    status, created_at, processed_at
  ) VALUES (
    v_cycle.group_id, p_cycle_id, v_recipient.user_id, v_total_collected, 'payout',
    'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ) RETURNING id INTO v_transaction_id;
  
  -- Update cycle as completed
  UPDATE ajo_cycles
  SET 
    status = 'completed',
    payout_amount = v_total_collected,
    payout_date = CURRENT_TIMESTAMP
  WHERE id = p_cycle_id;
  
  -- Mark recipient as having received payout
  UPDATE ajo_group_members
  SET payout_received = true
  WHERE id = v_recipient.id;
  
  -- Update group cycle position
  UPDATE ajo_groups
  SET current_cycle = current_cycle + 1
  WHERE id = v_cycle.group_id;
  
  -- Check if group is complete
  PERFORM check_group_completion(v_cycle.group_id);
  
  -- Release withdrawal locks
  UPDATE ajo_withdrawal_locks
  SET released_at = CURRENT_TIMESTAMP
  WHERE cycle_id = p_cycle_id AND released_at IS NULL;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'payout_amount', v_total_collected,
    'recipient_id', v_recipient.user_id,
    'cycle_status', 'completed'
  );
  
EXCEPTION WHEN OTHERS THEN
  -- Rollback on any error
  UPDATE ajo_cycles SET status = 'failed' WHERE id = p_cycle_id;
  UPDATE ajo_withdrawal_locks SET released_at = CURRENT_TIMESTAMP 
  WHERE cycle_id = p_cycle_id AND released_at IS NULL;
  
  RAISE EXCEPTION 'Atomic cycle processing failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Function to validate cycle readiness
CREATE OR REPLACE FUNCTION validate_cycle_readiness(p_cycle_id INTEGER)
RETURNS JSON AS $$
DECLARE
  v_cycle ajo_cycles%ROWTYPE;
  v_group ajo_groups%ROWTYPE;
  v_contributions_count INTEGER;
  v_total_collected DECIMAL(15,2);
  v_expected_amount DECIMAL(15,2);
  v_missing_users INTEGER[];
BEGIN
  -- Get cycle info
  SELECT * INTO v_cycle
  FROM ajo_cycles
  WHERE id = p_cycle_id;
  
  -- Get group info
  SELECT * INTO v_group
  FROM ajo_groups
  WHERE id = v_cycle.group_id;
  
  IF v_cycle.id IS NULL THEN
    RAISE EXCEPTION 'Cycle not found';
  END IF;
  
  -- Count contributions
  SELECT COUNT(*), COALESCE(SUM(amount), 0) 
  INTO v_contributions_count, v_total_collected
  FROM ajo_transactions
  WHERE cycle_id = p_cycle_id 
    AND transaction_type = 'contribution' 
    AND status = 'completed';
  
  v_expected_amount := v_group.max_members * v_group.contribution_amount;
  
  -- Get missing contributors
  SELECT ARRAY_AGG(m.user_id) INTO v_missing_users
  FROM ajo_group_members m
  WHERE m.group_id = v_cycle.group_id 
    AND m.status = 'active'
    AND m.user_id NOT IN (
      SELECT t.user_id 
      FROM ajo_transactions t 
      WHERE t.cycle_id = p_cycle_id 
        AND t.transaction_type = 'contribution' 
        AND t.status = 'completed'
    );
  
  RETURN json_build_object(
    'ready', v_contributions_count >= v_group.max_members AND v_total_collected >= v_expected_amount,
    'contributions_received', v_contributions_count,
    'contributions_expected', v_group.max_members,
    'amount_collected', v_total_collected,
    'amount_expected', v_expected_amount,
    'missing_contributors', COALESCE(v_missing_users, ARRAY[]::INTEGER[]),
    'cycle_status', v_cycle.status
  );
END;
$$ LANGUAGE plpgsql;

-- Function to handle contribution with atomic validation
CREATE OR REPLACE FUNCTION atomic_contribute(
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
  v_cycle ajo_cycles%ROWTYPE;
  v_existing_contribution INTEGER;
BEGIN
  -- Set isolation level
  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
  
  -- Lock cycle and validate
  SELECT * INTO v_cycle 
  FROM ajo_cycles 
  WHERE id = p_cycle_id 
  FOR UPDATE;
  
  IF v_cycle.id IS NULL THEN
    RAISE EXCEPTION 'Cycle not found';
  END IF;
  
  IF v_cycle.status != 'collecting' THEN
    RAISE EXCEPTION 'Cycle not accepting contributions. Status: %', v_cycle.status;
  END IF;
  
  -- Check contribution deadline
  IF CURRENT_TIMESTAMP > v_cycle.contribution_deadline THEN
    RAISE EXCEPTION 'Contribution deadline has passed';
  END IF;
  
  -- Validate member
  SELECT id INTO v_member_id
  FROM ajo_group_members
  WHERE group_id = p_group_id AND user_id = p_user_id AND status = 'active'
  FOR UPDATE;
  
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'User is not an active member of this group';
  END IF;
  
  -- Check for existing contribution
  SELECT id INTO v_existing_contribution
  FROM ajo_transactions
  WHERE cycle_id = p_cycle_id 
    AND user_id = p_user_id 
    AND transaction_type = 'contribution' 
    AND status = 'completed';
  
  IF v_existing_contribution IS NOT NULL THEN
    RAISE EXCEPTION 'User has already contributed to this cycle';
  END IF;
  
  -- Create transaction
  INSERT INTO ajo_transactions (
    group_id, cycle_id, user_id, amount, transaction_type,
    status, payment_reference, created_at, processed_at
  ) VALUES (
    p_group_id, p_cycle_id, p_user_id, p_amount, 'contribution',
    'completed', p_payment_reference, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ) RETURNING id INTO v_transaction_id;
  
  -- Update member tracking
  UPDATE ajo_group_members
  SET 
    last_contribution_date = CURRENT_TIMESTAMP,
    total_contributed = total_contributed + p_amount
  WHERE id = v_member_id;
  
  -- Update cycle total
  UPDATE ajo_cycles
  SET total_collected = total_collected + p_amount
  WHERE id = p_cycle_id;
  
  -- Record member history
  INSERT INTO ajo_member_history (
    user_id, group_id, cycle_id, contribution_due_date,
    contribution_date, amount_due, amount_paid, status
  ) VALUES (
    p_user_id, p_group_id, p_cycle_id, v_cycle.contribution_deadline,
    CURRENT_TIMESTAMP, p_amount, p_amount, 'paid'
  );
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'cycle_total', (SELECT total_collected FROM ajo_cycles WHERE id = p_cycle_id)
  );
  
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Atomic contribution failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Function to get transaction isolation level
CREATE OR REPLACE FUNCTION get_transaction_isolation()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('transaction_isolation');
END;
$$ LANGUAGE plpgsql;