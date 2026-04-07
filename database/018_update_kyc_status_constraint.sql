-- Migration: Update user_profiles KYC status constraint
-- This migration updates the kyc_status constraint to include 'submitted' status

-- Drop the old constraint
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS chk_kyc_status;

-- Add the new constraint with 'submitted' status
ALTER TABLE user_profiles ADD CONSTRAINT chk_kyc_status CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected'));

-- Update the default value if needed
ALTER TABLE user_profiles ALTER COLUMN kyc_status SET DEFAULT 'pending';
