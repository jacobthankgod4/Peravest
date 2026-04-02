-- =====================================================
-- PHASE 1 - DAY 2: DATA MIGRATION SCRIPT
-- =====================================================
-- Version: 1.0.0
-- Date: 2024-01-XX
-- Description: Migrate data from investment_package to investment_packages
-- Status: NON-DESTRUCTIVE (Copies data, doesn't delete)
-- =====================================================

-- Step 1: Backup existing data (for safety)
CREATE TABLE IF NOT EXISTS investment_package_backup AS 
SELECT * FROM investment_package;

-- Verify backup
SELECT COUNT(*) AS backup_count FROM investment_package_backup;

-- Step 2: Migrate existing packages to new table
-- Creates 4 packages per property (3, 6, 9, 12 months)
INSERT INTO investment_packages (
  property_id,
  package_name,
  min_investment,
  max_investment,
  duration_months,
  interest_rate,
  roi_percentage,
  max_investors,
  current_investors,
  is_active,
  display_order
)
SELECT 
  ip."Property_Id",
  CONCAT('Standard - ', ip."Duration", ' Months'),
  ip."Share_Cost",
  ip."Share_Cost" * 10,
  ip."Duration",
  ip."Interest_Rate",
  CASE ip."Duration"
    WHEN 3 THEN ip."Interest_Rate" * 0.925
    WHEN 6 THEN ip."Interest_Rate" * 1.85
    WHEN 9 THEN ip."Interest_Rate" * 2.775
    WHEN 12 THEN ip."Interest_Rate" * 3.7
    ELSE ip."Interest_Rate"
  END,
  ip."Max_Investors",
  0,
  true,
  1
FROM investment_package ip
WHERE ip."Property_Id" IS NOT NULL;

-- Step 3: Create additional duration packages for each property
-- 3 Months package
INSERT INTO investment_packages (
  property_id,
  package_name,
  min_investment,
  max_investment,
  duration_months,
  interest_rate,
  roi_percentage,
  max_investors,
  display_order
)
SELECT DISTINCT
  ip."Property_Id",
  'Starter - 3 Months',
  ip."Share_Cost",
  ip."Share_Cost" * 10,
  3,
  ip."Interest_Rate",
  ip."Interest_Rate" * 0.925,
  ip."Max_Investors",
  1
FROM investment_package ip
WHERE NOT EXISTS (
  SELECT 1 FROM investment_packages 
  WHERE property_id = ip."Property_Id" 
  AND duration_months = 3
);

-- 6 Months package
INSERT INTO investment_packages (
  property_id,
  package_name,
  min_investment,
  max_investment,
  duration_months,
  interest_rate,
  roi_percentage,
  max_investors,
  display_order
)
SELECT DISTINCT
  ip."Property_Id",
  'Core - 6 Months',
  ip."Share_Cost",
  ip."Share_Cost" * 10,
  6,
  ip."Interest_Rate",
  ip."Interest_Rate" * 1.85,
  ip."Max_Investors",
  2
FROM investment_package ip
WHERE NOT EXISTS (
  SELECT 1 FROM investment_packages 
  WHERE property_id = ip."Property_Id" 
  AND duration_months = 6
);

-- 9 Months package
INSERT INTO investment_packages (
  property_id,
  package_name,
  min_investment,
  max_investment,
  duration_months,
  interest_rate,
  roi_percentage,
  max_investors,
  display_order
)
SELECT DISTINCT
  ip."Property_Id",
  'Advanced - 9 Months',
  ip."Share_Cost",
  ip."Share_Cost" * 10,
  9,
  ip."Interest_Rate",
  ip."Interest_Rate" * 2.775,
  ip."Max_Investors",
  3
FROM investment_package ip
WHERE NOT EXISTS (
  SELECT 1 FROM investment_packages 
  WHERE property_id = ip."Property_Id" 
  AND duration_months = 9
);

-- 12 Months package
INSERT INTO investment_packages (
  property_id,
  package_name,
  min_investment,
  max_investment,
  duration_months,
  interest_rate,
  roi_percentage,
  max_investors,
  display_order
)
SELECT DISTINCT
  ip."Property_Id",
  'Premium - 12 Months',
  ip."Share_Cost",
  ip."Share_Cost" * 10,
  12,
  ip."Interest_Rate",
  ip."Interest_Rate" * 3.7,
  ip."Max_Investors",
  4
FROM investment_package ip
WHERE NOT EXISTS (
  SELECT 1 FROM investment_packages 
  WHERE property_id = ip."Property_Id" 
  AND duration_months = 12
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count migrated packages
SELECT COUNT(*) AS total_packages FROM investment_packages;

-- Packages per property
SELECT 
  p."Title" AS property_name,
  COUNT(ip.id) AS package_count
FROM property p
LEFT JOIN investment_packages ip ON p."Id" = ip.property_id
GROUP BY p."Id", p."Title"
ORDER BY package_count DESC;

-- Package details
SELECT 
  p."Title" AS property_name,
  ip.package_name,
  ip.min_investment,
  ip.max_investment,
  ip.duration_months,
  ip.roi_percentage,
  ip.display_order
FROM investment_packages ip
JOIN property p ON ip.property_id = p."Id"
ORDER BY p."Title", ip.display_order;

-- Verify no data loss
SELECT 
  (SELECT COUNT(*) FROM investment_package) AS old_count,
  (SELECT COUNT(DISTINCT property_id) FROM investment_packages) AS new_property_count,
  (SELECT COUNT(*) FROM investment_packages) AS new_package_count;

-- =====================================================
-- SUCCESS CRITERIA
-- =====================================================
-- ✅ All properties have packages
-- ✅ Each property has 4 duration options
-- ✅ No data lost from original table
-- ✅ Backup table created
-- ✅ All constraints satisfied
-- =====================================================
