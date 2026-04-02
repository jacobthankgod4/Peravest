-- Fix Property RLS Policies - Complete Fix

DROP POLICY IF EXISTS "Authenticated users can update properties" ON property;
DROP POLICY IF EXISTS "Authenticated users can delete properties" ON property;

CREATE POLICY "Authenticated users can update properties"
  ON property FOR UPDATE
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete properties"
  ON property FOR DELETE
  USING (auth.role() = 'authenticated');

ALTER TABLE property ENABLE ROW LEVEL SECURITY;
