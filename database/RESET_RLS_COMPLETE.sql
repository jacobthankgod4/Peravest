-- COMPLETE RLS FIX FOR PROPERTY TABLE

-- 1. Disable RLS temporarily
ALTER TABLE property DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to insert properties" ON property;
DROP POLICY IF EXISTS "Anyone can view active properties" ON property;
DROP POLICY IF EXISTS "Authenticated users can delete properties" ON property;
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON property;
DROP POLICY IF EXISTS "Authenticated users can update properties" ON property;

-- 3. Create simple, working policies
CREATE POLICY "allow_insert" ON property FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select" ON property FOR SELECT USING (true);
CREATE POLICY "allow_update" ON property FOR UPDATE USING (true);
CREATE POLICY "allow_delete" ON property FOR DELETE USING (true);

-- 4. Enable RLS
ALTER TABLE property ENABLE ROW LEVEL SECURITY;

-- 5. Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'property'
ORDER BY policyname;
