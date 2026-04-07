-- Safe migration: Add missing columns to user_profiles if they don't exist
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON user_profiles(referral_code);
