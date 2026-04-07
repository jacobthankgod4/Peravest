-- ============================================================================
-- PHASE 3 SUBPHASE 3.4: Daily Auto-Cancel Incomplete Contributions
-- ============================================================================

-- This migration is already included in 060_phase3_pg_cron_setup.sql
-- This file serves as documentation and additional helper functions

-- ============================================================================
-- Enhanced auto-cancel with notifications
-- ============================================================================

DROP FUNCTION IF EXISTS auto_cancel_with_notifications() CASCADE;

CREATE OR REPLACE FUNCTION auto_cancel_with_notifications()
RETURNS TABLE(cancelled_count INT, notified_count INT, error_message TEXT) AS $$
DECLARE
  v_cancelled_count INT := 0;
  v_notified_count INT := 0;
  v_error_msg TEXT := NULL;
  v_cycle_record RECORD;
  v_member_record RECORD;
BEGIN
  BEGIN
    -- Find cycles where deadline has passed
    FOR v_cycle_record IN
      SELECT id, group_id, contribution_deadline
      FROM ajo_cycles
      WHERE status = 'collecting'
        AND contribution_deadline < NOW()
        AND total_collected < total_expected
    LOOP
      -- Mark cycle as failed
      UPDATE ajo_cycles
      SET status = 'failed'
      WHERE id = v_cycle_record.id;

      v_cancelled_count := v_cancelled_count + 1;

      -- Mark missing contributions as defaulted
      FOR v_member_record IN
        SELECT amh.id, amh.user_id, amh.group_id
        FROM ajo_member_history amh
        WHERE amh.status = 'pending'
          AND amh.cycle_id = v_cycle_record.id
          AND amh.contribution_due_date < NOW()
      LOOP
        -- Update status to defaulted
        UPDATE ajo_member_history
        SET status = 'defaulted'
        WHERE id = v_member_record.id;

        -- Reduce reliability score
        UPDATE ajo_group_members
        SET reliability_score = GREATEST(0.0, reliability_score - 0.1)
        WHERE user_id = v_member_record.user_id
          AND group_id = v_member_record.group_id;

        -- Create default notice
        INSERT INTO ajo_grace_notices (
          membership_id, cycle_id, notice_type,
          notice_sent, expires, notified, notification_method
        )
        SELECT agm.id, v_cycle_record.id, 'default_notice',
               NOW(), NOW() + INTERVAL '1 day', false, 'sms'
        FROM ajo_group_members agm
        WHERE agm.user_id = v_member_record.user_id
          AND agm.group_id = v_member_record.group_id;

        v_notified_count := v_notified_count + 1;
      END LOOP;
    END LOOP;

    RETURN QUERY SELECT v_cancelled_count, v_notified_count, v_error_msg;

  EXCEPTION WHEN OTHERS THEN
    v_error_msg := SQLERRM;
    RETURN QUERY SELECT 0, 0, v_error_msg;
  END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function to check cycle readiness before auto-cancel
-- ============================================================================

DROP FUNCTION IF EXISTS check_cycle_completion_status(INT) CASCADE;

CREATE OR REPLACE FUNCTION check_cycle_completion_status(p_cycle_id INT)
RETURNS JSON AS $$
DECLARE
  v_cycle RECORD;
  v_member_count INT;
  v_contributions_count INT;
  v_missing_count INT;
  v_completion_percentage DECIMAL;
BEGIN
  SELECT * INTO v_cycle FROM ajo_cycles WHERE id = p_cycle_id;

  IF v_cycle IS NULL THEN
    RETURN json_build_object('error', 'Cycle not found');
  END IF;

  SELECT COUNT(*) INTO v_member_count
  FROM ajo_group_members
  WHERE group_id = v_cycle.group_id AND status = 'active';

  SELECT COUNT(*) INTO v_contributions_count
  FROM ajo_member_history
  WHERE cycle_id = p_cycle_id AND status IN ('paid', 'late');

  v_missing_count := v_member_count - v_contributions_count;
  v_completion_percentage := ROUND(
    (v_contributions_count::DECIMAL / NULLIF(v_member_count::DECIMAL, 0) * 100), 2
  );

  RETURN json_build_object(
    'cycle_id', p_cycle_id,
    'status', v_cycle.status,
    'deadline_passed', v_cycle.contribution_deadline < NOW(),
    'member_count', v_member_count,
    'contributions_received', v_contributions_count,
    'missing_contributions', v_missing_count,
    'completion_percentage', v_completion_percentage,
    'should_cancel', v_cycle.contribution_deadline < NOW() AND v_missing_count > 0
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function to get cycles eligible for auto-cancel
-- ============================================================================

DROP FUNCTION IF EXISTS get_cycles_for_auto_cancel() CASCADE;

CREATE OR REPLACE FUNCTION get_cycles_for_auto_cancel()
RETURNS TABLE(
  cycle_id INT,
  group_id INT,
  cycle_number INT,
  deadline_passed BOOLEAN,
  missing_contributions INT,
  completion_percentage DECIMAL
) AS $$
DECLARE
  v_cycle RECORD;
  v_pending_count INT;
  v_paid_count INT;
  v_active_members INT;
  v_completion_pct DECIMAL;
BEGIN
  FOR v_cycle IN
    SELECT id, group_id, cycle_number, contribution_deadline
    FROM ajo_cycles
    WHERE status = 'collecting'
      AND contribution_deadline < NOW()
      AND total_collected < total_expected
  LOOP
    -- Count pending contributions
    SELECT COUNT(*) INTO v_pending_count
    FROM ajo_member_history
    WHERE cycle_id = v_cycle.id AND status = 'pending';

    -- Count paid contributions
    SELECT COUNT(*) INTO v_paid_count
    FROM ajo_member_history
    WHERE cycle_id = v_cycle.id AND status IN ('paid', 'late');

    -- Count active members
    SELECT COUNT(*) INTO v_active_members
    FROM ajo_group_members
    WHERE group_id = v_cycle.group_id AND status = 'active';

    -- Calculate completion percentage
    v_completion_pct := ROUND(
      (v_paid_count::DECIMAL / NULLIF(v_active_members::DECIMAL, 0) * 100), 2
    );

    -- Return row
    RETURN QUERY SELECT
      v_cycle.id,
      v_cycle.group_id,
      v_cycle.cycle_number,
      v_cycle.contribution_deadline < NOW(),
      v_pending_count,
      v_completion_pct;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check cycles eligible for auto-cancel
-- SELECT * FROM get_cycles_for_auto_cancel();

-- Check specific cycle completion status
-- SELECT check_cycle_completion_status(1);

-- Run auto-cancel with notifications
-- SELECT * FROM auto_cancel_with_notifications();

-- ============================================================================
-- PHASE 3 SUBPHASE 3.4 COMPLETE
-- ============================================================================
