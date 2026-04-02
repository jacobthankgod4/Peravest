-- Admin Security Policies and RLS

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active properties" ON property;
DROP POLICY IF EXISTS "Only admins can insert properties" ON property;
DROP POLICY IF EXISTS "Only admins can update properties" ON property;
DROP POLICY IF EXISTS "Only admins can delete properties" ON property;
DROP POLICY IF EXISTS "Users can view own account" ON user_accounts;
DROP POLICY IF EXISTS "Users can update own account" ON user_accounts;
DROP POLICY IF EXISTS "Users can insert own account" ON user_accounts;
DROP POLICY IF EXISTS "Only admins can view all users" ON user_accounts;

-- Disable RLS temporarily
ALTER TABLE property DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts DISABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invest_now') THEN
    ALTER TABLE invest_now DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_accounts
    WHERE "Email" = auth.jwt() ->> 'email'
    AND "User_Type" = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Property policies
CREATE POLICY "Anyone can view active properties"
  ON property FOR SELECT
  USING ("Status" = 'active');

CREATE POLICY "Only admins can insert properties"
  ON property FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update properties"
  ON property FOR UPDATE
  USING (is_admin());

CREATE POLICY "Only admins can delete properties"
  ON property FOR DELETE
  USING (is_admin());

-- User accounts policies
CREATE POLICY "Users can view own account"
  ON user_accounts FOR SELECT
  USING ("Email" = auth.jwt() ->> 'email' OR is_admin());

CREATE POLICY "Users can update own account"
  ON user_accounts FOR UPDATE
  USING ("Email" = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert own account"
  ON user_accounts FOR INSERT
  WITH CHECK ("Email" = auth.jwt() ->> 'email');

CREATE POLICY "Only admins can view all users"
  ON user_accounts FOR SELECT
  USING (is_admin());

-- Enable RLS on critical tables
ALTER TABLE property ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

-- Invest_now policies (if table exists) - Skip RLS for now due to UUID/INT mismatch
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invest_now') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own investments" ON invest_now';
    EXECUTE 'DROP POLICY IF EXISTS "Users can create own investments" ON invest_now';
    -- Note: RLS disabled for invest_now due to Usa_Id (INT) vs auth.uid() (UUID) incompatibility
    -- Admin verification still enforced in application layer via adminService
  END IF;
END $$;

-- Admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id SERIAL PRIMARY KEY,
  admin_email VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id VARCHAR(100),
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin ON admin_audit_log(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON admin_audit_log(created_at);
