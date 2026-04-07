-- Phase 1.1: RLS Audit Query
-- Run this in Supabase SQL Editor to audit existing RLS policies for Ajo tables
-- Expected: public view on ajo_groups, user_id filter on memberships/cycles

SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual, 
  roles 
FROM pg_policies 
WHERE tablename LIKE 'ajo%' OR tablename LIKE '%cycle%' OR tablename LIKE 'ajo_member%' OR tablename LIKE 'grace%'
ORDER BY tablename, policyname;

-- Followup queries if needed
-- \d+ ajo_groups  (describe table)
-- SELECT * FROM ajo_grace_notices LIMIT 5; (check if exists)

-- Copy output to chat for analysis. If policies missing, proceed to 1.2 adds.

