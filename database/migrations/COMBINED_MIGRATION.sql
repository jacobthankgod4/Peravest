-- =====================================================
-- COMBINED MIGRATION: CREATE TABLE + MIGRATE DATA
-- =====================================================
-- Run this single script to complete Phase 1
-- =====================================================

-- STEP 1: Drop and recreate table
DROP TABLE IF EXISTS investment_packages CASCADE;

CREATE TABLE investment_packages (
  id BIGSERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES property("Id") ON DELETE CASCADE,
  package_name VARCHAR(100) NOT NULL,
  min_investment DECIMAL(15,2) NOT NULL CHECK (min_investment > 0),
  max_investment DECIMAL(15,2) NOT NULL CHECK (max_investment >= min_investment),
  duration_months INTEGER NOT NULL CHECK (duration_months > 0),
  interest_rate DECIMAL(5,2) NOT NULL CHECK (interest_rate >= 0 AND interest_rate <= 100),
  roi_percentage DECIMAL(5,2) NOT NULL CHECK (roi_percentage >= 0),
  max_investors INTEGER DEFAULT 100 CHECK (max_investors > 0),
  current_investors INTEGER DEFAULT 0 CHECK (current_investors >= 0 AND current_investors <= max_investors),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- STEP 2: Create indexes
CREATE INDEX idx_investment_packages_property ON investment_packages(property_id);
CREATE INDEX idx_investment_packages_active ON investment_packages(property_id, is_active);
CREATE INDEX idx_investment_packages_order ON investment_packages(property_id, display_order);

-- STEP 3: Create trigger
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

-- STEP 4: Backup existing data
CREATE TABLE IF NOT EXISTS investment_package_backup AS 
SELECT * FROM investment_package;

-- STEP 5: Migrate data - Create 4 packages per property
INSERT INTO investment_packages (
  property_id, package_name, min_investment, max_investment,
  duration_months, interest_rate, roi_percentage, max_investors, display_order
)
SELECT DISTINCT
  "Property_Id", 'Starter - 3 Months', "Share_Cost", "Share_Cost" * 10,
  3, "Interest_Rate", "Interest_Rate" * 0.925, "Max_Investors", 1
FROM investment_package;

INSERT INTO investment_packages (
  property_id, package_name, min_investment, max_investment,
  duration_months, interest_rate, roi_percentage, max_investors, display_order
)
SELECT DISTINCT
  "Property_Id", 'Core - 6 Months', "Share_Cost", "Share_Cost" * 10,
  6, "Interest_Rate", "Interest_Rate" * 1.85, "Max_Investors", 2
FROM investment_package;

INSERT INTO investment_packages (
  property_id, package_name, min_investment, max_investment,
  duration_months, interest_rate, roi_percentage, max_investors, display_order
)
SELECT DISTINCT
  "Property_Id", 'Advanced - 9 Months', "Share_Cost", "Share_Cost" * 10,
  9, "Interest_Rate", "Interest_Rate" * 2.775, "Max_Investors", 3
FROM investment_package;

INSERT INTO investment_packages (
  property_id, package_name, min_investment, max_investment,
  duration_months, interest_rate, roi_percentage, max_investors, display_order
)
SELECT DISTINCT
  "Property_Id", 'Premium - 12 Months', "Share_Cost", "Share_Cost" * 10,
  12, "Interest_Rate", "Interest_Rate" * 3.7, "Max_Investors", 4
FROM investment_package;

-- STEP 6: Verify results
SELECT 
  'Total packages created' AS metric,
  COUNT(*)::TEXT AS value
FROM investment_packages
UNION ALL
SELECT 
  'Properties with packages',
  COUNT(DISTINCT property_id)::TEXT
FROM investment_packages
UNION ALL
SELECT 
  'Backup records',
  COUNT(*)::TEXT
FROM investment_package_backup;

-- Show packages per property
SELECT 
  p."Title" AS property_name,
  COUNT(ip.id) AS package_count
FROM property p
LEFT JOIN investment_packages ip ON p."Id" = ip.property_id
GROUP BY p."Id", p."Title"
ORDER BY package_count DESC
LIMIT 10;
