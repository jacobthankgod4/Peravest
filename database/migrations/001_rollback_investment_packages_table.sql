-- =====================================================
-- ROLLBACK SCRIPT FOR INVESTMENT_PACKAGES TABLE
-- =====================================================
-- Version: 1.0.0
-- Date: 2024-01-XX
-- WARNING: This will remove the investment_packages table
-- Use only if migration needs to be reverted
-- =====================================================

-- Step 1: Drop trigger
DROP TRIGGER IF EXISTS trigger_investment_packages_updated_at ON investment_packages;

-- Step 2: Drop trigger function
DROP FUNCTION IF EXISTS update_investment_packages_updated_at();

-- Step 3: Drop indexes
DROP INDEX IF EXISTS idx_investment_packages_created;
DROP INDEX IF EXISTS idx_investment_packages_order;
DROP INDEX IF EXISTS idx_investment_packages_active;
DROP INDEX IF EXISTS idx_investment_packages_property;

-- Step 4: Drop table
DROP TABLE IF EXISTS investment_packages CASCADE;

-- Step 5: Verify removal
SELECT 
  table_name 
FROM information_schema.tables 
WHERE table_name = 'investment_packages';

-- Should return 0 rows if successful

-- =====================================================
-- ROLLBACK COMPLETE
-- =====================================================
-- ✅ Table removed
-- ✅ Indexes removed
-- ✅ Triggers removed
-- ✅ System reverted to previous state
-- =====================================================
