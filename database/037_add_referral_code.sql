-- Add referral_code column to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON user_profiles(referral_code);
