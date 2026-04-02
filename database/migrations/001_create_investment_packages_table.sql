-- =====================================================
-- PHASE 1 - DAY 1: CREATE INVESTMENT_PACKAGES TABLE
-- =====================================================
-- Version: 1.0.0
-- Date: 2024-01-XX
-- Author: Development Team
-- Description: Create new investment_packages table for multi-package support
-- Status: NON-DESTRUCTIVE (Old table preserved)
-- =====================================================

-- Step 1: Drop table if exists (for clean recreation)
DROP TABLE IF EXISTS investment_packages CASCADE;

-- Step 2: Create new table
CREATE TABLE investment_packages (
  id BIGSERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL,
  package_name VARCHAR(100) NOT NULL,
  min_investment DECIMAL(15,2) NOT NULL,
  max_investment DECIMAL(15,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  roi_percentage DECIMAL(5,2) NOT NULL,
  max_investors INTEGER DEFAULT 100,
  current_investors INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_investment_packages_property 
    FOREIGN KEY (property_id) 
    REFERENCES property("Id") 
    ON DELETE CASCADE,
  
  CONSTRAINT chk_min_investment_positive 
    CHECK (min_investment > 0),
  
  CONSTRAINT chk_max_greater_than_min 
    CHECK (max_investment >= min_investment),
  
  CONSTRAINT chk_duration_positive 
    CHECK (duration_months > 0),
  
  CONSTRAINT chk_interest_rate_valid 
    CHECK (interest_rate >= 0 AND interest_rate <= 100),
  
  CONSTRAINT chk_roi_percentage_valid 
    CHECK (roi_percentage >= 0),
  
  CONSTRAINT chk_max_investors_positive 
    CHECK (max_investors > 0),
  
  CONSTRAINT chk_current_investors_valid 
    CHECK (current_investors >= 0 AND current_investors <= max_investors)
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_investment_packages_property 
  ON investment_packages(property_id);

CREATE INDEX IF NOT EXISTS idx_investment_packages_active 
  ON investment_packages(property_id, is_active);

CREATE INDEX IF NOT EXISTS idx_investment_packages_order 
  ON investment_packages(property_id, display_order);

CREATE INDEX IF NOT EXISTS idx_investment_packages_created 
  ON investment_packages(created_at DESC);

-- Step 4: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_investment_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_investment_packages_updated_at
  BEFORE UPDATE ON investment_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_investment_packages_updated_at();

-- Step 5: Add comments for documentation
COMMENT ON TABLE investment_packages IS 'Multiple investment packages per property with flexible amounts and durations';
COMMENT ON COLUMN investment_packages.package_name IS 'Display name (e.g., "Starter - 3 Months")';
COMMENT ON COLUMN investment_packages.min_investment IS 'Minimum investment amount in Naira';
COMMENT ON COLUMN investment_packages.max_investment IS 'Maximum investment amount in Naira';
COMMENT ON COLUMN investment_packages.duration_months IS 'Investment duration in months';
COMMENT ON COLUMN investment_packages.interest_rate IS 'Annual interest rate percentage';
COMMENT ON COLUMN investment_packages.roi_percentage IS 'Total ROI percentage for the duration';
COMMENT ON COLUMN investment_packages.display_order IS 'Order to display packages (lower = first)';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify table creation
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_name = 'investment_packages';

-- Verify columns
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'investment_packages'
ORDER BY ordinal_position;

-- Verify indexes
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'investment_packages';

-- Verify constraints
SELECT 
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint 
WHERE conrelid = 'investment_packages'::regclass;

-- =====================================================
-- SUCCESS CRITERIA
-- =====================================================
-- ✅ Table created successfully
-- ✅ All constraints in place
-- ✅ All indexes created
-- ✅ Trigger created
-- ✅ No errors in verification queries
-- =====================================================
