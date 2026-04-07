-- CORRECTED: Migration 017 - Create KYC Submissions Table
-- This migration creates the kyc_submissions table with proper schema references

CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  date_of_birth DATE,
  phone_number VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  bvn VARCHAR(11),
  nin VARCHAR(11),
  id_type VARCHAR(50),
  id_number VARCHAR(100),
  id_document_url TEXT,
  proof_of_address_url TEXT,
  selfie_url TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_kyc_submissions_user FOREIGN KEY (user_id) REFERENCES public.users("Id") ON DELETE CASCADE,
  CONSTRAINT chk_kyc_submission_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON public.kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON public.kyc_submissions(status);

-- CORRECTED: Migration 018 - Update user_profiles KYC status constraint
-- This migration updates the kyc_status constraint to include 'submitted' status

ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS chk_kyc_status;

ALTER TABLE public.user_profiles ADD CONSTRAINT chk_kyc_status 
  CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected'));

ALTER TABLE public.user_profiles ALTER COLUMN kyc_status SET DEFAULT 'pending';
