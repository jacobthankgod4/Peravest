-- =====================================================
-- UPDATE: FIXED PACKAGE AMOUNTS SYSTEM
-- =====================================================
-- Changes min/max to single investment_amount
-- Creates default packages for all properties
-- =====================================================

-- STEP 1: Add new column for fixed amount
ALTER TABLE investment_packages 
ADD COLUMN IF NOT EXISTS investment_amount DECIMAL(15,2);

-- STEP 2: Update existing packages to use investment_amount
UPDATE investment_packages 
SET investment_amount = min_investment;

-- STEP 3: Make investment_amount NOT NULL after data migration
ALTER TABLE investment_packages 
ALTER COLUMN investment_amount SET NOT NULL;

-- STEP 4: Drop old min/max columns (optional - keep for now for safety)
-- ALTER TABLE investment_packages DROP COLUMN min_investment;
-- ALTER TABLE investment_packages DROP COLUMN max_investment;

-- STEP 5: Clear existing packages
DELETE FROM investment_packages;

-- STEP 6: Create default package amounts for all properties
-- Package amounts: 5k, 10k, 30k, 50k, 100k, 500k, 1M, 5M, 10M, 50M

DO $$
DECLARE
    prop RECORD;
    amounts INTEGER[] := ARRAY[5000, 10000, 30000, 50000, 100000, 500000, 1000000, 5000000, 10000000, 50000000];
    amount INTEGER;
    idx INTEGER := 1;
BEGIN
    FOR prop IN SELECT "Id" FROM property WHERE "Status" = 'active' AND is_deleted = false
    LOOP
        idx := 1;
        FOREACH amount IN ARRAY amounts
        LOOP
            INSERT INTO investment_packages (
                property_id,
                package_name,
                investment_amount,
                min_investment,
                max_investment,
                duration_months,
                interest_rate,
                roi_percentage,
                max_investors,
                display_order
            ) VALUES (
                prop."Id",
                CASE 
                    WHEN amount >= 1000000 THEN '₦' || (amount/1000000)::TEXT || 'M Package'
                    WHEN amount >= 1000 THEN '₦' || (amount/1000)::TEXT || 'K Package'
                    ELSE '₦' || amount::TEXT || ' Package'
                END,
                amount,
                amount,  -- Keep for backward compatibility
                amount,  -- Keep for backward compatibility
                6,       -- Default 6 months
                10,      -- Default 10% interest
                18.5,    -- Default 18.5% ROI for 6 months
                100,     -- Default 100 max investors
                idx
            );
            idx := idx + 1;
        END LOOP;
    END LOOP;
END $$;

-- STEP 7: Verify results
SELECT 
    p."Title" AS property_name,
    COUNT(ip.id) AS package_count,
    STRING_AGG(ip.package_name, ', ' ORDER BY ip.display_order) AS packages
FROM property p
LEFT JOIN investment_packages ip ON p."Id" = ip.property_id
WHERE p."Status" = 'active' AND p.is_deleted = false
GROUP BY p."Id", p."Title"
ORDER BY p."Title"
LIMIT 5;

-- Show sample packages
SELECT 
    package_name,
    investment_amount,
    duration_months,
    roi_percentage
FROM investment_packages
WHERE property_id = (SELECT "Id" FROM property LIMIT 1)
ORDER BY display_order;
