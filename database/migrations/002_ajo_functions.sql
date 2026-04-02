-- Phase 2: Database Functions for Atomic Operations

-- Function for atomic contribution processing
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

-- Function for atomic payout processing
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