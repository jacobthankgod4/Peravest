-- DEFINITIVE user_profiles schema for Supabase Auth integration
-- This replaces all previous conflicting migrations

-- Drop old table if it exists
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles with correct schema
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  date_of_birth DATE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Nigeria',
  occupation VARCHAR(100),
  annual_income DECIMAL(15,2),
  investment_experience VARCHAR(50),
  risk_tolerance VARCHAR(20),
  kyc_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  kyc_documents JSON,
  referral_code VARCHAR(20) UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_investment_experience CHECK (investment_experience IN ('beginner', 'intermediate', 'advanced', 'expert')),
  CONSTRAINT chk_risk_tolerance CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  CONSTRAINT chk_kyc_status CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected'))
);

-- Create indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_kyc_status ON user_profiles(kyc_status);
CREATE INDEX idx_user_profiles_referral_code ON user_profiles(referral_code);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all operations
CREATE POLICY "allow_insert" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "allow_update" ON user_profiles FOR UPDATE USING (true);
CREATE POLICY "allow_delete" ON user_profiles FOR DELETE USING (true);
