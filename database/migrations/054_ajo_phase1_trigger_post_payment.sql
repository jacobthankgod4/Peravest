-- ============================================================================
-- PHASE 1 SUBPHASE 1.6: Trigger post_payment_ajo_update_history
-- ============================================================================

DROP TRIGGER IF EXISTS trg_post_payment_ajo_update_history ON ajo_transactions CASCADE;
DROP FUNCTION IF EXISTS post_payment_ajo_update_history() CASCADE;

CREATE OR REPLACE FUNCTION post_payment_ajo_update_history()
RETURNS TRIGGER AS $$
DECLARE
  v_cycle_id INT;
  v_group_id INT;
  v_contribution_due_date TIMESTAMP;
  v_days_late INT;
  v_status VARCHAR(20);
BEGIN
  -- Only process completed contributions
  IF NEW.transaction_type = 'contribution' AND NEW.status = 'completed' THEN
    
    v_cycle_id := NEW.cycle_id;
    v_group_id := NEW.group_id;

    -- Get contribution due date from cycle
    SELECT contribution_deadline INTO v_contribution_due_date
    FROM ajo_cycles
    WHERE id = v_cycle_id;

    -- Calculate days late
    v_days_late := EXTRACT(DAY FROM (NOW() - v_contribution_due_date));
    IF v_days_late < 0 THEN
      v_days_late := 0;
    END IF;

    -- Determine status
    IF v_days_late = 0 THEN
      v_status := 'paid';
    ELSE
      v_status := 'late';
    END IF;

    -- Insert or update member history
    INSERT INTO ajo_member_history (
      user_id, group_id, cycle_id, contribution_due_date,
      contribution_date, amount_due, amount_paid, days_late, status
    ) VALUES (
      NEW.user_id, v_group_id, v_cycle_id, v_contribution_due_date,
      NOW(), NEW.amount, NEW.amount, v_days_late, v_status
    )
    ON CONFLICT (user_id, group_id, cycle_id) DO UPDATE SET
      contribution_date = NOW(),
      amount_paid = NEW.amount,
      days_late = v_days_late,
      status = v_status;

    -- Update member last_contribution_date
    UPDATE ajo_group_members
    SET last_contribution_date = NOW(),
        total_contributed = total_contributed + NEW.amount
    WHERE user_id = NEW.user_id AND group_id = v_group_id;

    -- Update cycle total_collected
    UPDATE ajo_cycles
    SET total_collected = total_collected + NEW.amount
    WHERE id = v_cycle_id;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_post_payment_ajo_update_history
AFTER INSERT ON ajo_transactions
FOR EACH ROW
EXECUTE FUNCTION post_payment_ajo_update_history();

-- ============================================================================
-- Verification Query
-- ============================================================================
-- SELECT * FROM ajo_member_history LIMIT 1;
