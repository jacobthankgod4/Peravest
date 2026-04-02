-- =====================================================
-- CREATE COMPLETE PACKAGE SET: ALL AMOUNTS × ALL DURATIONS
-- =====================================================
-- 10 amounts × 3 durations = 30 packages per property
-- Durations: 6, 9, 12 months
-- ROI range: 9.5% to 25%
-- =====================================================

-- STEP 1: Clear existing packages
DELETE FROM investment_packages;

-- STEP 2: Create all combinations (30 packages total)
DO $$
DECLARE
    prop RECORD;
    display_idx INTEGER := 1;
BEGIN
    FOR prop IN SELECT "Id" FROM property WHERE "Status" = 'active' AND is_deleted = false
    LOOP
        display_idx := 1;
        
        -- ₦5K Package (3 durations)
        INSERT INTO investment_packages (property_id, package_name, investment_amount, min_investment, max_investment, duration_months, interest_rate, roi_percentage, max_investors, display_order)
        VALUES 
        (prop."Id", '₦5K - 6 Months', 5000, 5000, 5000, 6, 10, 9.5, 100, display_idx),
        (prop."Id", '₦5K - 9 Months', 5000, 5000, 5000, 9, 10, 12, 100, display_idx + 1),
        (prop."Id", '₦5K - 12 Months', 5000, 5000, 5000, 12, 10, 15, 100, display_idx + 2);
        display_idx := display_idx + 3;
        
        -- ₦10K Package (3 durations)
        INSERT INTO investment_packages (property_id, package_name, investment_amount, min_investment, max_investment, duration_months, interest_rate, roi_percentage, max_investors, display_order)
        VALUES 
        (prop."Id", '₦10K - 6 Months', 10000, 10000, 10000, 6, 10, 10, 100, display_idx),
        (prop."Id", '₦10K - 9 Months', 10000, 10000, 10000, 9, 10, 13, 100, display_idx + 1),
        (prop."Id", '₦10K - 12 Months', 10000, 10000, 10000, 12, 10, 16, 100, display_idx + 2);
        display_idx := display_idx + 3;
        
        -- ₦30K Package (3 durations)
        INSERT INTO investment_packages (property_id, package_name, investment_amount, min_investment, max_investment, duration_months, interest_rate, roi_percentage, max_investors, display_order)
        VALUES 
        (prop."Id", '₦30K - 6 Months', 30000, 30000, 30000, 6, 10, 11, 100, display_idx),
        (prop."Id", '₦30K - 9 Months', 30000, 30000, 30000, 9, 10, 14, 100, display_idx + 1),
        (prop."Id", '₦30K - 12 Months', 30000, 30000, 30000, 12, 10, 17, 100, display_idx + 2);
        display_idx := display_idx + 3;
        
        -- ₦50K Package (3 durations)
        INSERT INTO investment_packages (property_id, package_name, investment_amount, min_investment, max_investment, duration_months, interest_rate, roi_percentage, max_investors, display_order)
        VALUES 
        (prop."Id", '₦50K - 6 Months', 50000, 50000, 50000, 6, 10, 12, 100, display_idx),
        (prop."Id", '₦50K - 9 Months', 50000, 50000, 50000, 9, 10, 15, 100, display_idx + 1),
        (prop."Id", '₦50K - 12 Months', 50000, 50000, 50000, 12, 10, 18, 100, display_idx + 2);
        display_idx := display_idx + 3;
        
        -- ₦100K Package (3 durations)
        INSERT INTO investment_packages (property_id, package_name, investment_amount, min_investment, max_investment, duration_months, interest_rate, roi_percentage, max_investors, display_order)
        VALUES 
        (prop."Id", '₦100K - 6 Months', 100000, 100000, 100000, 6, 10, 13, 100, display_idx),
        (prop."Id", '₦100K - 9 Months', 100000, 100000, 100000, 9, 10, 16, 100, display_idx + 1),
        (prop."Id", '₦100K - 12 Months', 100000, 100000, 100000, 12, 10, 19, 100, display_idx + 2);
        display_idx := display_idx + 3;
        
        -- ₦500K Package (3 durations)
        INSERT INTO investment_packages (property_id, package_name, investment_amount, min_investment, max_investment, duration_months, interest_rate, roi_percentage, max_investors, display_order)
        VALUES 
        (prop."Id", '₦500K - 6 Months', 500000, 500000, 500000, 6, 10, 14, 100, display_idx),
        (prop."Id", '₦500K - 9 Months', 500000, 500000, 500000, 9, 10, 17, 100, display_idx + 1),
        (prop."Id", '₦500K - 12 Months', 500000, 500000, 500000, 12, 10, 20, 100, display_idx + 2);
        display_idx := display_idx + 3;
        
        -- ₦1M Package (3 durations)
        INSERT INTO investment_packages (property_id, package_name, investment_amount, min_investment, max_investment, duration_months, interest_rate, roi_percentage, max_investors, display_order)
        VALUES 
        (prop."Id", '₦1M - 6 Months', 1000000, 1000000, 1000000, 6, 10, 15, 100, display_idx),
        (prop."Id", '₦1M - 9 Months', 1000000, 1000000, 1000000, 9, 10, 18, 100, display_idx + 1),
        (prop."Id", '₦1M - 12 Months', 1000000, 1000000, 1000000, 12, 10, 21, 100, display_idx + 2);
        display_idx := display_idx + 3;
        
        -- ₦5M Package (3 durations)
        INSERT INTO investment_packages (property_id, package_name, investment_amount, min_investment, max_investment, duration_months, interest_rate, roi_percentage, max_investors, display_order)
        VALUES 
        (prop."Id", '₦5M - 6 Months', 5000000, 5000000, 5000000, 6, 10, 16, 100, display_idx),
        (prop."Id", '₦5M - 9 Months', 5000000, 5000000, 5000000, 9, 10, 19, 100, display_idx + 1),
        (prop."Id", '₦5M - 12 Months', 5000000, 5000000, 5000000, 12, 10, 22, 100, display_idx + 2);
        display_idx := display_idx + 3;
        
        -- ₦10M Package (3 durations)
        INSERT INTO investment_packages (property_id, package_name, investment_amount, min_investment, max_investment, duration_months, interest_rate, roi_percentage, max_investors, display_order)
        VALUES 
        (prop."Id", '₦10M - 6 Months', 10000000, 10000000, 10000000, 6, 10, 17, 100, display_idx),
        (prop."Id", '₦10M - 9 Months', 10000000, 10000000, 10000000, 9, 10, 20, 100, display_idx + 1),
        (prop."Id", '₦10M - 12 Months', 10000000, 10000000, 10000000, 12, 10, 23, 100, display_idx + 2);
        display_idx := display_idx + 3;
        
        -- ₦50M Package (3 durations)
        INSERT INTO investment_packages (property_id, package_name, investment_amount, min_investment, max_investment, duration_months, interest_rate, roi_percentage, max_investors, display_order)
        VALUES 
        (prop."Id", '₦50M - 6 Months', 50000000, 50000000, 50000000, 6, 10, 18, 100, display_idx),
        (prop."Id", '₦50M - 9 Months', 50000000, 50000000, 50000000, 9, 10, 21, 100, display_idx + 1),
        (prop."Id", '₦50M - 12 Months', 50000000, 50000000, 50000000, 12, 10, 25, 100, display_idx + 2);
        
    END LOOP;
END $$;

-- STEP 3: Verify results
SELECT 
    COUNT(*) AS total_packages,
    COUNT(DISTINCT property_id) AS properties_with_packages,
    MIN(roi_percentage) AS min_roi,
    MAX(roi_percentage) AS max_roi
FROM investment_packages;

-- Show sample for one property
SELECT 
    package_name,
    investment_amount,
    duration_months,
    roi_percentage
FROM investment_packages
WHERE property_id = (SELECT "Id" FROM property LIMIT 1)
ORDER BY display_order
LIMIT 30;
