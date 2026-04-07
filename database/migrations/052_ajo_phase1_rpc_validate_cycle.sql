-- ============================================================================
-- PHASE 1 SUBPHASE 1.4: RPC validate_cycle_readiness (FIXED)
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS validate_cycle_readiness(INT) CASCADE;

-- Create the function fresh
CREATE OR REPLACE FUNCTION validate_cycle_readiness(group_id INT)
RETURNS JSON AS $$
DECLARE
  v_cycle_id INT;
  v_total_expected DECIMAL(15,2);
  v_total_collected DECIMAL(15,2);
  v_member_count INT;
  v_contributions_count INT;
  v_is_ready BOOLEAN;
  v_missing_count INT;
BEGIN
  -- Get current cycle for group
  SELECT id, total_expected, total_collected 
  INTO v_cycle_id, v_total_expected, v_total_collected
  FROM ajo_cycles
  WHERE group_id = group_id 
    AND status = 'collecting'
  ORDER BY cycle_number DESC
  LIMIT 1;

  IF v_cycle_id IS NULL THEN
    RETURN json_build_object(
      'ready', false,
      'reason', 'No active collecting cycle found',
      'cycle_id', NULL
    );
  END IF;

  -- Count total members in group
  SELECT COUNT(*) INTO v_member_count
  FROM ajo_group_members
  WHERE group_id = group_id AND status = 'active';

  -- Count contributions for current cycle
  SELECT COUNT(*) INTO v_contributions_count
  FROM ajo_transactions
  WHERE cycle_id = v_cycle_id 
    AND transaction_type = 'contribution'
    AND status = 'completed';

  -- Calculate missing contributions
  v_missing_count := v_member_count - v_contributions_count;

  -- Determine if cycle is ready (all members contributed OR deadline passed)
  v_is_ready := (v_missing_count = 0) OR 
                (NOW() > (SELECT contribution_deadline FROM ajo_cycles WHERE id = v_cycle_id));

  RETURN json_build_object(
    'ready', v_is_ready,
    'cycle_id', v_cycle_id,
    'total_expected', v_total_expected,
    'total_collected', v_total_collected,
    'member_count', v_member_count,
    'contributions_received', v_contributions_count,
    'missing_contributions', v_missing_count,
    'deadline_passed', NOW() > (SELECT contribution_deadline FROM ajo_cycles WHERE id = v_cycle_id),
    'completion_percentage', ROUND((v_contributions_count::DECIMAL / v_member_count::DECIMAL * 100), 2)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Verification Query
-- ============================================================================
-- SELECT validate_cycle_readiness(1);
