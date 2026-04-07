-- ============================================================================
-- PHASE 1 SUBPHASE 1.8: Performance Indexes
-- ============================================================================

-- Index for collecting cycles (used in validate_cycle_readiness)
CREATE INDEX IF NOT EXISTS idx_ajo_cycles_collecting 
ON ajo_cycles(group_id, status) 
WHERE status = 'collecting';

-- Index for pending cycles
CREATE INDEX IF NOT EXISTS idx_ajo_cycles_pending 
ON ajo_cycles(group_id, status) 
WHERE status = 'pending';

-- Index for completed cycles
CREATE INDEX IF NOT EXISTS idx_ajo_cycles_completed 
ON ajo_cycles(group_id, status) 
WHERE status = 'completed';

-- Index for transaction lookups by cycle
CREATE INDEX IF NOT EXISTS idx_ajo_transactions_cycle_type 
ON ajo_transactions(cycle_id, transaction_type, status);

-- Index for member history lookups
CREATE INDEX IF NOT EXISTS idx_ajo_member_history_group_cycle 
ON ajo_member_history(group_id, cycle_id, user_id);

-- Index for active members in group
CREATE INDEX IF NOT EXISTS idx_ajo_members_active 
ON ajo_group_members(group_id, status) 
WHERE status = 'active';

-- Index for withdrawal locks
CREATE INDEX IF NOT EXISTS idx_ajo_locks_user_active 
ON ajo_withdrawal_locks(user_id, released_at) 
WHERE released_at IS NULL;

-- ============================================================================
-- Verification Query
-- ============================================================================
-- SELECT indexname, tablename FROM pg_indexes 
-- WHERE tablename LIKE 'ajo%' ORDER BY tablename, indexname;
