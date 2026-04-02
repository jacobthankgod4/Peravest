-- Migration: Create user profiles table (PostgreSQL)
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
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
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users("Id") ON DELETE CASCADE,
  CONSTRAINT chk_investment_experience CHECK (investment_experience IN ('beginner', 'intermediate', 'advanced', 'expert')),
  CONSTRAINT chk_risk_tolerance CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  CONSTRAINT chk_kyc_status CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_kyc_status ON user_profiles(kyc_status);