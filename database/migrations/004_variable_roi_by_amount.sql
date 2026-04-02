-- =====================================================
-- UPDATE: VARIABLE ROI BASED ON AMOUNT & DURATION
-- =====================================================
-- Higher amounts = Higher ROI
-- Longer durations = Higher ROI
-- Range: 9.5% to 35%
-- =====================================================

-- ROI Formula:
-- Base ROI increases with investment amount
-- Duration multiplier: 3mo=0.5x, 6mo=1x, 9mo=1.5x, 12mo=2x

-- Update ROI for each package based on amount
UPDATE investment_packages SET roi_percentage = 
  CASE 
    -- ₦5K Package: 9.5% - 19%
    WHEN investment_amount = 5000 THEN 
      CASE duration_months
        WHEN 3 THEN 9.5
        WHEN 6 THEN 12
        WHEN 9 THEN 15
        WHEN 12 THEN 19
        ELSE 12
      END
    
    -- ₦10K Package: 10% - 20%
    WHEN investment_amount = 10000 THEN 
      CASE duration_months
        WHEN 3 THEN 10
        WHEN 6 THEN 13
        WHEN 9 THEN 16
        WHEN 12 THEN 20
        ELSE 13
      END
    
    -- ₦30K Package: 11% - 22%
    WHEN investment_amount = 30000 THEN 
      CASE duration_months
        WHEN 3 THEN 11
        WHEN 6 THEN 14
        WHEN 9 THEN 18
        WHEN 12 THEN 22
        ELSE 14
      END
    
    -- ₦50K Package: 12% - 24%
    WHEN investment_amount = 50000 THEN 
      CASE duration_months
        WHEN 3 THEN 12
        WHEN 6 THEN 16
        WHEN 9 THEN 20
        WHEN 12 THEN 24
        ELSE 16
      END
    
    -- ₦100K Package: 14% - 26%
    WHEN investment_amount = 100000 THEN 
      CASE duration_months
        WHEN 3 THEN 14
        WHEN 6 THEN 18
        WHEN 9 THEN 22
        WHEN 12 THEN 26
        ELSE 18
      END
    
    -- ₦500K Package: 16% - 28%
    WHEN investment_amount = 500000 THEN 
      CASE duration_months
        WHEN 3 THEN 16
        WHEN 6 THEN 20
        WHEN 9 THEN 24
        WHEN 12 THEN 28
        ELSE 20
      END
    
    -- ₦1M Package: 18% - 30%
    WHEN investment_amount = 1000000 THEN 
      CASE duration_months
        WHEN 3 THEN 18
        WHEN 6 THEN 22
        WHEN 9 THEN 26
        WHEN 12 THEN 30
        ELSE 22
      END
    
    -- ₦5M Package: 20% - 32%
    WHEN investment_amount = 5000000 THEN 
      CASE duration_months
        WHEN 3 THEN 20
        WHEN 6 THEN 24
        WHEN 9 THEN 28
        WHEN 12 THEN 32
        ELSE 24
      END
    
    -- ₦10M Package: 22% - 33%
    WHEN investment_amount = 10000000 THEN 
      CASE duration_months
        WHEN 3 THEN 22
        WHEN 6 THEN 26
        WHEN 9 THEN 30
        WHEN 12 THEN 33
        ELSE 26
      END
    
    -- ₦50M Package: 24% - 35%
    WHEN investment_amount = 50000000 THEN 
      CASE duration_months
        WHEN 3 THEN 24
        WHEN 6 THEN 28
        WHEN 9 THEN 32
        WHEN 12 THEN 35
        ELSE 28
      END
    
    ELSE roi_percentage
  END;

-- Verify results
SELECT 
  package_name,
  investment_amount,
  duration_months,
  roi_percentage,
  CONCAT('₦', investment_amount::TEXT, ' for ', duration_months, ' months = ', roi_percentage, '% ROI') AS summary
FROM investment_packages
WHERE property_id = (SELECT "Id" FROM property LIMIT 1)
ORDER BY display_order;

-- Show ROI range
SELECT 
  MIN(roi_percentage) AS min_roi,
  MAX(roi_percentage) AS max_roi,
  COUNT(*) AS total_packages
FROM investment_packages;
