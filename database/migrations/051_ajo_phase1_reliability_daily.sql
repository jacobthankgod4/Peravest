-- ============================================================================
-- PHASE 1 SUBPHASE 1.2-1.3: Add Reliability Threshold & Daily Frequency
-- ============================================================================

-- 1.2: Add reliability_threshold column
ALTER TABLE ajo_groups 
ADD COLUMN IF NOT EXISTS reliability_threshold DECIMAL(3,1) DEFAULT 0.7;

ALTER TABLE ajo_groups 
ADD COLUMN IF NOT EXISTS payout_bid_enabled BOOLEAN DEFAULT false;

-- 1.3: Update frequency enum to support daily
ALTER TABLE ajo_groups 
DROP CONSTRAINT IF EXISTS ajo_groups_frequency_check;

ALTER TABLE ajo_groups 
ADD CONSTRAINT ajo_groups_frequency_check 
CHECK (frequency IN ('daily', 'weekly', 'monthly'));

-- Create index for frequency queries
CREATE INDEX IF NOT EXISTS idx_ajo_groups_frequency ON ajo_groups(frequency);

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'ajo_groups' AND column_name IN ('reliability_threshold', 'payout_bid_enabled', 'frequency');
