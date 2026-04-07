-- ============================================================================
-- PHASE 1 SUBPHASE 1.5: RPC process_atomic_ajo_cycle (FIXED)
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS process_atomic_ajo_cycle(INT) CASCADE;

-- Create the function fresh
CREATE OR REPLACE FUNCTION process_atomic_ajo_cycle(cycle_id INT)
RETURNS JSON AS $$
DECLARE
  v_group_id INT;
  v_cycle_number INT;
  v_total_collected DECIMAL(15,2);
  v_payout_recipient_id INT;
  v_payout_amount DECIMAL(15,2);
  v_member_count INT;
  v_next_cycle_number INT;
  v_error_msg TEXT;
  v_recipient_user_id INT;
BEGIN
  -- Start transaction
  BEGIN
    -- Get cycle details
    SELECT group_id, cycle_number, total_collected, payout_recipient_id
    INTO v_group_id, v_cycle_number, v_total_collected, v_payout_recipient_id
    FROM ajo_cycles
    WHERE id = cycle_id;

    IF v_group_id IS NULL THEN
      RETURN json_build_object('success', false, 'error', 'Cycle not found');
    END IF;

    -- Validate cycle is ready
    IF NOT (SELECT (validate_cycle_readiness(v_group_id)->>'ready')::BOOLEAN) THEN
      RETURN json_build_object('success', false, 'error', 'Cycle not ready for processing');
    END IF;

    -- Get payout recipient user_id
    SELECT user_id INTO v_recipient_user_id
    FROM ajo_group_members
    WHERE id = v_payout_recipient_id;

    -- Create payout transaction
    INSERT INTO ajo_transactions (
      group_id, cycle_id, user_id, amount, 
      transaction_type, status, created_at
    ) VALUES (
      v_group_id, cycle_id, v_recipient_user_id, v_total_collected,
      'payout', 'completed', NOW()
    );

    -- Update cycle status to completed
    UPDATE ajo_cycles
    SET status = 'completed', payout_date = NOW(), payout_amount = v_total_collected
    WHERE id = cycle_id;

    -- Mark payout as received for member
    UPDATE ajo_group_members
    SET payout_received = true, last_contribution_date = NOW()
    WHERE id = v_payout_recipient_id;

    -- Get member count for next cycle setup
    SELECT COUNT(*) INTO v_member_count
    FROM ajo_group_members
    WHERE group_id = v_group_id AND status = 'active';

    -- Create next cycle
    v_next_cycle_number := v_cycle_number + 1;
    
    INSERT INTO ajo_cycles (
      group_id, cycle_number, start_date, end_date, 
      contribution_deadline, status, total_expected, created_at
    ) VALUES (
      v_group_id, v_next_cycle_number, NOW(), 
      NOW() + INTERVAL '1 month',
      NOW() + INTERVAL '25 days',
      'pending', 
      (SELECT contribution_amount FROM ajo_groups WHERE id = v_group_id) * v_member_count,
      NOW()
    );

    -- Update group next_payout_date
    UPDATE ajo_groups
    SET current_cycle = v_next_cycle_number,
        next_payout_date = NOW() + INTERVAL '1 month'
    WHERE id = v_group_id;

    -- Return success
    RETURN json_build_object(
      'success', true,
      'cycle_id', cycle_id,
      'cycle_number', v_cycle_number,
      'payout_amount', v_total_collected,
      'payout_recipient_id', v_recipient_user_id,
      'next_cycle_number', v_next_cycle_number,
      'message', 'Cycle processed successfully'
    );

  EXCEPTION WHEN OTHERS THEN
    v_error_msg := SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', v_error_msg,
      'cycle_id', cycle_id
    );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Verification Query
-- ============================================================================
-- SELECT process_atomic_ajo_cycle(1);
