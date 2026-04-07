-- ============================================================================
-- PHASE 1 SUBPHASE 1.7: Test RPCs with Mock Data
-- ============================================================================

-- NOTE: Run this AFTER all previous migrations are applied
-- This creates test data to verify RPC functions work correctly

-- 1. Create test group (if not exists)
INSERT INTO ajo_groups (
  name, description, max_members, current_members, 
  contribution_amount, frequency, cycle_duration, 
  status, created_by, reliability_threshold
) VALUES (
  'Test Ajo Circle', 'Test group for RPC validation', 
  5, 0, 5000, 'monthly', 5, 'forming', 1, 0.7
)
ON CONFLICT DO NOTHING;

-- 2. Get test group ID
-- SELECT id FROM ajo_groups WHERE name = 'Test Ajo Circle' LIMIT 1;

-- 3. Add test members (run after getting group ID, replace {group_id})
-- INSERT INTO ajo_group_members (group_id, user_id, position, status, payout_order)
-- VALUES 
--   ({group_id}, 1, 1, 'active', 1),
--   ({group_id}, 2, 2, 'active', 2),
--   ({group_id}, 3, 3, 'active', 3);

-- 4. Create test cycle (run after getting group ID, replace {group_id})
-- INSERT INTO ajo_cycles (
--   group_id, cycle_number, start_date, end_date, 
--   contribution_deadline, status, total_expected, payout_recipient_id
-- ) VALUES (
--   {group_id}, 1, NOW(), NOW() + INTERVAL '30 days',
--   NOW() + INTERVAL '25 days', 'collecting', 15000, 1
-- );

-- 5. Test validate_cycle_readiness RPC (replace {group_id})
-- SELECT validate_cycle_readiness({group_id});
-- Expected output: JSON with ready=false (no contributions yet)

-- 6. Add test contributions (run after getting cycle ID, replace {cycle_id}, {group_id})
-- INSERT INTO ajo_transactions (
--   group_id, cycle_id, user_id, amount, 
--   transaction_type, status, created_at
-- ) VALUES 
--   ({group_id}, {cycle_id}, 1, 5000, 'contribution', 'completed', NOW()),
--   ({group_id}, {cycle_id}, 2, 5000, 'contribution', 'completed', NOW()),
--   ({group_id}, {cycle_id}, 3, 5000, 'contribution', 'completed', NOW());

-- 7. Test validate_cycle_readiness again (replace {group_id})
-- SELECT validate_cycle_readiness({group_id});
-- Expected output: JSON with ready=true (all contributions received)

-- 8. Test process_atomic_ajo_cycle RPC (replace {cycle_id})
-- SELECT process_atomic_ajo_cycle({cycle_id});
-- Expected output: JSON with success=true, next_cycle_number=2

-- 9. Verify cycle was processed
-- SELECT * FROM ajo_cycles WHERE group_id = {group_id} ORDER BY cycle_number;

-- 10. Verify member history was updated
-- SELECT * FROM ajo_member_history WHERE group_id = {group_id};

-- ============================================================================
-- Cleanup (optional - remove test data)
-- ============================================================================
-- DELETE FROM ajo_transactions WHERE group_id IN (SELECT id FROM ajo_groups WHERE name = 'Test Ajo Circle');
-- DELETE FROM ajo_cycles WHERE group_id IN (SELECT id FROM ajo_groups WHERE name = 'Test Ajo Circle');
-- DELETE FROM ajo_group_members WHERE group_id IN (SELECT id FROM ajo_groups WHERE name = 'Test Ajo Circle');
-- DELETE FROM ajo_groups WHERE name = 'Test Ajo Circle';
